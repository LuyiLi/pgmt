import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
assert(!/benchmark-chart|data-metric|full-results|chart-row/.test(html + app), 'Quantitative comparison section must remain removed');
assert(!/\d+(?:\.\d+)?\s*%/.test(html.replace(/<[^>]+>/g, '')), 'Do not display experiment percentages');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'HTML IDs must be unique');
const refs = [...html.matchAll(/(?:href|src|data-src|poster)="([^"]+)"/g)].map(match => match[1]);
refs.push(...[...css.matchAll(/url\("([^"]+)"\)/g)].map(match => match[1]));
for (const ref of refs) {
  if (ref.startsWith('#')) { if (ref.length > 1) assert(ids.includes(ref.slice(1)), `Missing anchor ${ref}`); continue; }
  if (/^(https?:|data:)/.test(ref)) continue;
  assert(fs.existsSync(path.join(root, ref.split('#')[0])), `Missing file ${ref}`);
}
const clipIds = [...app.matchAll(/\{ id: "([^"]+)", label:/g)].map(match => match[1]);
for (const id of clipIds) {
  for (const filename of [`assets/media/${id}.mp4`, `assets/images/${id}.jpg`]) assert(fs.existsSync(path.join(root, filename)), `Missing demo asset ${filename}`);
}
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'site-config.js'), 'utf8'), sandbox);
const config = sandbox.window.PGMT_CONFIG;
assert(config.siteUrl === 'https://luyili.github.io/pgmt/', 'Unexpected deployment target');
for (const name of ['paper', 'arxiv', 'bilibili']) assert.equal(typeof config[name], 'string');
for (const file of fs.readdirSync(path.join(root, 'assets/media'))) assert(fs.statSync(path.join(root, 'assets/media', file)).size < 100 * 1024 * 1024, `Video exceeds GitHub file limit: ${file}`);
console.log(`PASS: ${new Set(refs).size} local/anchor references; ${clipIds.length} demo pairs; unique IDs; resource configuration; media sizes.`);
