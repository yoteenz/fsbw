#!/usr/bin/env node
/**
 * Sync the Workspace Experience Brain IFTA contracts (yoteenz/SITE00) into the AIO app.
 *
 * The Experience Brain is authored in SITE00 (shared/studioos-experience-brain, TypeScript source of truth) and
 * exported to docs/studioos/experience-brain/*.json. AIO cannot import across repositories, so the exported JSON is
 * vendored byte-for-byte into src/ifta/experience/ with a provenance record (source commit + sha256 per file).
 * The IFTA page family reads those vendored files directly — copy, states, CTAs, sections, emphasis roles.
 *
 * Usage:
 *   node scripts/experience-brain/sync-ifta-contract.mjs [--site00 <path>] [--check]
 *   SITE00_DIR=/path/to/SITE00 node scripts/experience-brain/sync-ifta-contract.mjs
 *
 * --check  verify vendored files match the SITE00 export (exit 1 on drift); writes nothing.
 */
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const AIO_ROOT = resolve(HERE, '../..');
const DEST = join(AIO_ROOT, 'src/ifta/experience');
const SOURCE_REL = 'docs/studioos/experience-brain';
const FILES = [
  'AIO_IFTA_FUEL_TAX_EXPERIENCE_CONTRACT.json',
  'AIO_IFTA_FUEL_TAX_VISUAL_CONTRACT.json',
  'AIO_IFTA_FUEL_TAX_E2E_CONTRACT.json',
];

const args = process.argv.slice(2);
const check = args.includes('--check');
const flagIdx = args.indexOf('--site00');
const site00 = resolve(
  flagIdx >= 0 ? args[flagIdx + 1] : process.env.SITE00_DIR ?? join(AIO_ROOT, '../../SITE00'),
);
const sourceDir = join(site00, SOURCE_REL);

if (!existsSync(sourceDir)) {
  console.error(`Experience Brain export not found at ${sourceDir}. Pass --site00 <path to SITE00 checkout>.`);
  process.exit(2);
}

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
let sourceCommit = 'unknown';
try {
  sourceCommit = execSync(`git -C "${site00}" log -1 --format=%h -- ${SOURCE_REL}`, { encoding: 'utf8' }).trim() || 'unknown';
} catch {
  /* not a git checkout — provenance records unknown */
}

let drift = 0;
const files = {};
for (const name of FILES) {
  const src = readFileSync(join(sourceDir, name));
  files[name] = { sha256: sha256(src), bytes: src.length };
  const destPath = join(DEST, name);
  const current = existsSync(destPath) ? readFileSync(destPath) : null;
  const same = current !== null && sha256(current) === files[name].sha256;
  if (check) {
    if (!same) {
      drift += 1;
      console.error(`DRIFT  ${name}`);
    } else {
      console.log(`OK     ${name}`);
    }
  } else if (!same) {
    writeFileSync(destPath, src);
    console.log(`synced ${name}`);
  } else {
    console.log(`same   ${name}`);
  }
}

if (check) {
  process.exit(drift ? 1 : 0);
}

const provenance = {
  source_repo: 'yoteenz/SITE00',
  source_path: SOURCE_REL,
  source_commit: sourceCommit,
  source_sprint: 'P0.SITE00.WORKSPACE-EXPERIENCE-BRAIN.CANONICAL-SCHEMA-AIO-PROOF1',
  consumed_by_sprint: 'P0.AIO.EXPERIENCE-DRIVEN-PAGE-REFINEMENT1',
  rule: 'Vendored byte-for-byte. Never hand-edit — change the brain in SITE00 and re-run this script.',
  files,
};
writeFileSync(join(DEST, 'provenance.json'), `${JSON.stringify(provenance, null, 2)}\n`);
console.log(`provenance written (source ${sourceCommit})`);
