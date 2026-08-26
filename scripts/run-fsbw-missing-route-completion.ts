#!/usr/bin/env npx tsx
/**
 * P0.VR.3H-FSBW — FSBW missing route completion pipeline
 * Usage: npx tsx scripts/run-fsbw-missing-route-completion.ts [--execute-build] [--stdout]
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  MANIFEST_ARTIFACT_RELATIVE_PATH,
  attachFsbwMissingRouteCompletionToManifest,
  runFsbwMissingRouteCompletion,
} from '../src/studio-os-core/route-intelligence/index.ts';
import type { StudioWorldDesignRouteManifest } from '../src/studio-os-core/route-intelligence/types.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const executeBuild = process.argv.includes('--execute-build');
const stdoutOnly = process.argv.includes('--stdout');

function loadManifest(): StudioWorldDesignRouteManifest {
  const path = join(repoRoot, MANIFEST_ARTIFACT_RELATIVE_PATH);
  if (!existsSync(path)) {
    throw new Error(`Manifest not found: ${MANIFEST_ARTIFACT_RELATIVE_PATH}. Run npm run compile:design-pages first.`);
  }
  return JSON.parse(readFileSync(path, 'utf8')) as StudioWorldDesignRouteManifest;
}

function main() {
  const manifest = loadManifest();
  const report = runFsbwMissingRouteCompletion({ repoRoot, manifest, executeBuild });
  const updated = attachFsbwMissingRouteCompletionToManifest(manifest, report);

  if (stdoutOnly) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  writeFileSync(join(repoRoot, MANIFEST_ARTIFACT_RELATIVE_PATH), JSON.stringify(updated, null, 2), 'utf8');

  console.log('P0.VR.3H-FSBW Missing Route Completion');
  console.log(`  commit: ${report.sourceCommit}`);
  console.log(`  manifest: ${report.sourceManifestVersion}`);
  console.log(`  executeBuild: ${executeBuild}`);
  console.log('');

  for (const ps of report.projectSummaries) {
    console.log(
      `  ${ps.projectId}: missing=${ps.missing} simple=${ps.simple} complex=${ps.complex} built=${ps.built} shell=${ps.shellOnly} blocked=${ps.blocked}`,
    );
  }

  if (report.externalRepoOwned.length) {
    console.log('');
    console.log('  EXTERNAL REPO OWNED (not implemented in FSBW):');
    for (const ext of report.externalRepoOwned) {
      console.log(`    ${ext.projectId}: ${ext.count} pages`);
    }
  }

  console.log('');
  console.log(`  composer authorship: ${report.registry.authorship.length}`);
  console.log(`  review sets: ${report.registry.reviewSets.length}`);
}

main();
