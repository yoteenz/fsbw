#!/usr/bin/env node
/** Verify production bundle retains studio-world-atlas department package registration. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');
const markers = ['studio-world-atlas', 'pkg-studio-world-atlas-golden-v1'];

if (!fs.existsSync(distDir)) {
  console.error('[verify-department-package-in-dist] dist/ missing — run npm run build first');
  process.exit(1);
}

const jsFiles = fs.readdirSync(path.join(distDir, 'assets')).filter((f) => f.endsWith('.js'));
let found = 0;
for (const file of jsFiles) {
  const content = fs.readFileSync(path.join(distDir, 'assets', file), 'utf8');
  if (markers.every((m) => content.includes(m))) {
    found += 1;
  }
}

if (found === 0) {
  console.error(
    '[verify-department-package-in-dist] studio-world-atlas markers not found in any dist/assets/*.js chunk'
  );
  process.exit(1);
}

console.log(`[verify-department-package-in-dist] OK — markers found in ${found} chunk(s)`);
