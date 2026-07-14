#!/usr/bin/env node
/**
 * Merge founder presentation patch JSON into experience-lab-icon-presentation.ts
 * Usage: node scripts/apply-founder-icon-presentation-patch.mjs path/to/patch.json
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const patchPath = process.argv[2];
if (!patchPath) {
  console.error('Usage: node scripts/apply-founder-icon-presentation-patch.mjs <patch.json>');
  process.exit(1);
}

const patch = JSON.parse(readFileSync(resolve(ROOT, patchPath), 'utf8'));
const presentationPath = resolve(
  ROOT,
  'src/features/studio-world/icons/experience-lab-icon-presentation.ts',
);
let src = readFileSync(presentationPath, 'utf8');

for (const [key, values] of Object.entries(patch)) {
  for (const [field, value] of Object.entries(values)) {
    const re = new RegExp(`(${key}:\\s*\\{[\\s\\S]*?${field}:\\s*)([\\d.-]+)`);
    if (!re.test(src)) {
      console.warn(`skip ${key}.${field} — field not found`);
      continue;
    }
    src = src.replace(re, `$1${value}`);
  }
}

writeFileSync(presentationPath, src);
console.log(`Applied ${Object.keys(patch).length} icon patch(es) to presentation registry`);
