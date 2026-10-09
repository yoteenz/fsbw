#!/usr/bin/env node
/** Non-billable fixture integrity check against committed inventory report. */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const FIXTURE = join(
  process.cwd(),
  'src/studio-os-core/world-fabrication-engine/benchmarks/site00-build-object-v2/fixture'
);
const INVENTORY = join(
  process.cwd(),
  'src/studio-os-core/world-fabrication-engine/benchmarks/site00-build-object-v2/reports/inventory.json'
);

if (!existsSync(INVENTORY)) {
  console.error('inventory.json missing');
  process.exit(1);
}

const inv = JSON.parse(readFileSync(INVENTORY, 'utf8'));
const mismatches = [];
for (const f of inv.files) {
  const p = join(FIXTURE, f.relativePath);
  if (!existsSync(p)) {
    mismatches.push({ type: 'missing', path: f.relativePath });
    continue;
  }
  const h = createHash('sha256').update(readFileSync(p)).digest('hex');
  if (h !== f.sha256) mismatches.push({ type: 'hash', path: f.relativePath });
}

const ok =
  mismatches.length === 0 &&
  existsSync(join(FIXTURE, '01_SOURCE/SITE00_Build_Object_V2.blend')) &&
  existsSync(join(FIXTURE, '05_DOCUMENTATION/module-manifest.json'));

console.log(JSON.stringify({ ok, mismatches, fixture: FIXTURE }, null, 2));
process.exit(ok ? 0 : 1);
