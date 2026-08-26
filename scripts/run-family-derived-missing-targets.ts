#!/usr/bin/env npx tsx
/** P0.VR.3L-FSBW — Scan + classify missing targets for family derivation */
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import {
  runFamilyDerivedMissingTargetPipeline,
  attachFamilyDerivedMissingTargetsToManifest,
  MANIFEST_ARTIFACT_RELATIVE_PATH,
} from '../src/studio-os-core/route-intelligence/index.ts';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const executeBuild = process.argv.includes('--execute-build');
const manifestPath = join(repoRoot, MANIFEST_ARTIFACT_RELATIVE_PATH);

if (!existsSync(manifestPath)) {
  console.error('Run npm run compile:design-pages first');
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const report = runFamilyDerivedMissingTargetPipeline({
  repoRoot,
  manifest,
  executeBuild,
  includeFixtures: true,
});

const updated = attachFamilyDerivedMissingTargetsToManifest(manifest, report);
mkdirSync(dirname(manifestPath), { recursive: true });
writeFileSync(manifestPath, JSON.stringify(updated, null, 2), 'utf8');

console.log(`P0.VR.3L-FSBW Family-Derived Missing Targets`);
console.log(`  targets: ${report.targets.length}`);
for (const s of report.projectSummaries) {
  console.log(`  ${s.projectId}: total=${s.total} ready=${s.readyForDerivation} derived=${s.derived} trueMissing=${s.trueMissingRoutes}`);
}
