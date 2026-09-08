import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.resolve(root, '_site');
// The only directory ever replaced is this project's generated _site directory.
if (path.dirname(output) !== root || path.basename(output) !== '_site') throw new Error('Invalid build destination');
await fs.rm(output, { recursive: true, force: true });
await fs.mkdir(output);
for (const name of ['index.html', 'styles.css', 'app.js', 'site-config.js', '.nojekyll', 'assets']) {
  await fs.cp(path.join(root, name), path.join(output, name), { recursive: true });
}
console.log('Static website built in _site/. No build-time dependencies or third-party runtime services.');
