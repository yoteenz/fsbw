#!/usr/bin/env node
/**
 * Build committed tunnel previews (same pattern as aio-public/preview/).
 *
 *   node scripts/build-design-previews.mjs
 *
 * Outputs:
 *   design-authority/aio-public/preview/
 *   design-authority/aio-office/workspaces/preview/
 *   design-authority/aio-office/office/preview/
 */
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const node = process.execPath;

const steps = [
  ['aio-public', join(APP, 'design-authority/aio-public/build.mjs'), join(APP, 'design-authority/aio-public/preview')],
  ['aio-office workspaces', join(APP, 'design-authority/aio-office/workspaces/build.mjs'), join(APP, 'design-authority/aio-office/workspaces/preview')],
  ['aio-office unified', join(APP, 'design-authority/aio-office/office/build.mjs'), join(APP, 'design-authority/aio-office/office/preview')],
];

for (const [label, script, out] of steps) {
  console.log(`\n— ${label} → ${out}`);
  execFileSync(node, [script, out], { cwd: APP, stdio: 'inherit' });
}
console.log('\nDone. Open site.html or local.html under each preview/ on the mobile tunnel.');
