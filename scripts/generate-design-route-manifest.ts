#!/usr/bin/env npx tsx
/**
 * P0.VR.3 — Generate studio-world-design-route-manifest.json from forensic route audit.
 * Usage: npx tsx scripts/generate-design-route-manifest.ts [--stdout]
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  runCrossProjectRouteForensicAudit,
  registerMissingRoutesAsDesignable,
  MANIFEST_ARTIFACT_RELATIVE_PATH,
} from '../src/studio-os-core/route-intelligence/index.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const stdoutOnly = process.argv.includes('--stdout');

function main() {
  const { report, manifest: baseManifest } = runCrossProjectRouteForensicAudit({ repoRoot });
  const routesWithMissing = registerMissingRoutesAsDesignable(baseManifest.routes, baseManifest.dependencyGraphs);
  const manifest = { ...baseManifest, routes: routesWithMissing };

  const json = JSON.stringify(manifest, null, 2);

  if (stdoutOnly) {
    console.log(json);
    return;
  }

  const outPath = join(repoRoot, MANIFEST_ARTIFACT_RELATIVE_PATH);
  const outDir = dirname(outPath);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(outPath, json, 'utf8');

  console.log('P0.VR.3 Design Route Manifest generated');
  console.log(`  path: ${MANIFEST_ARTIFACT_RELATIVE_PATH}`);
  console.log(`  commit: ${manifest.sourceCommit}`);
  console.log(`  projects: ${manifest.projects.length}`);
  console.log(`  routes: ${manifest.routes.length}`);
  console.log(`  visual states: ${manifest.visualStates.length}`);
  console.log(`  designable: ${report.designableRoutes}`);
  console.log('');
  for (const p of report.perProject) {
    console.log(
      `  ${p.projectId}: routes=${p.routesDiscovered} designable=${p.designableRoutes} orphaned=${p.orphaned} missing=${p.missingDependencies}`,
    );
  }
}

main();
