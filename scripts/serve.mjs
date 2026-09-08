import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 4173);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.pdf': 'application/pdf', '.json': 'application/json; charset=utf-8' };
http.createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch { response.writeHead(400).end('Bad request'); return; }
  if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405).end(); return; }
  if (pathname === '/') { response.writeHead(302, { Location: '/pgmt/' }).end(); return; }
  if (pathname === '/pgmt') { response.writeHead(301, { Location: '/pgmt/' }).end(); return; }
  if (pathname.startsWith('/pgmt/')) pathname = pathname.slice('/pgmt'.length);
  if (pathname.endsWith('/')) pathname += 'index.html';
  const filename = path.resolve(root, '.' + pathname);
  if (!filename.startsWith(root + path.sep) || pathname.split('/').some(part => part.startsWith('.')) || !['index.html', 'styles.css', 'app.js', 'site-config.js', 'assets'].includes(pathname.split('/')[1])) {
    response.writeHead(404).end('Not found'); return;
  }
  let stat;
  try { stat = fs.statSync(filename); if (!stat.isFile()) throw new Error(); }
  catch { response.writeHead(404).end('Not found'); return; }
  const headers = { 'Content-Type': mime[path.extname(filename)] || 'application/octet-stream', 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' };
  const range = request.headers.range;
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    let start = match?.[1] ? Number(match[1]) : 0;
    let end = match?.[2] ? Number(match[2]) : stat.size - 1;
    if (match && !match[1] && match[2]) { start = Math.max(0, stat.size - Number(match[2])); end = stat.size - 1; }
    if (!match || start > end || start >= stat.size || end >= stat.size) { response.writeHead(416, { 'Content-Range': `bytes */${stat.size}` }).end(); return; }
    response.writeHead(206, { ...headers, 'Content-Length': end - start + 1, 'Content-Range': `bytes ${start}-${end}/${stat.size}` });
    if (request.method === 'HEAD') response.end();
    else fs.createReadStream(filename, { start, end }).on('error', () => response.destroy()).pipe(response);
  } else {
    response.writeHead(200, { ...headers, 'Content-Length': stat.size });
    if (request.method === 'HEAD') response.end();
    else fs.createReadStream(filename).on('error', () => response.destroy()).pipe(response);
  }
}).listen(port, '127.0.0.1', () => console.log(`PGMT preview: http://127.0.0.1:${port}/pgmt/`));
