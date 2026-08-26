#!/usr/bin/env npx tsx
/**
 * P0.VR.3F — Generate studio-world-design-route-manifest.json (design families + page sets).
 * Usage: npx tsx scripts/generate-design-route-manifest.ts [--stdout]
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  runCrossProjectRouteForensicAudit,
  registerMissingRoutesAsDesignable,
  attachPageSetsToManifest,
  MANIFEST_ARTIFACT_RELATIVE_PATH,
} from '../src/studio-os-core/route-intelligence/index.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const stdoutOnly = process.argv.includes('--stdout');

function main() {
  const { report, manifest: baseManifest } = runCrossProjectRouteForensicAudit({ repoRoot });
  const routesWithMissing = registerMissingRoutesAsDesignable(
    baseManifest.rawImplementationRoutes,
    baseManifest.dependencyGraphs,
  );
  const manifest = attachPageSetsToManifest({ ...baseManifest, rawImplementationRoutes: routesWithMissing, routes: routesWithMissing });

  const json = JSON.stringify(manifest, null, 2);

  if (stdoutOnly) {
    console.log(json);
    return;
  }

  const outPath = join(repoRoot, MANIFEST_ARTIFACT_RELATIVE_PATH);
  const outDir = dirname(outPath);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(outPath, json, 'utf8');

  console.log('P0.VR.3F Design Route Manifest generated');
  console.log(`  path: ${MANIFEST_ARTIFACT_RELATIVE_PATH}`);
  console.log(`  commit: ${manifest.sourceCommit}`);
  console.log(`  schema: ${manifest.schemaVersion}`);
  console.log(`  design screens: ${manifest.designScreens?.length ?? 0}`);
  console.log(`  design families: ${manifest.designFamilies?.length ?? 0}`);
  console.log(`  project page sets: ${manifest.projectPageSets?.length ?? 0}`);
  console.log(`  raw implementation routes: ${manifest.rawImplementationRoutes.length}`);
  console.log(`  true orphans: ${report.orphanedCount}`);
  console.log('');
  for (const p of report.perProject) {
    const savings = manifest.referenceGenerationSavings?.find((s) => s.projectId === p.projectId);
    const pageSet = manifest.projectPageSets?.find((ps) => ps.projectId === p.projectId);
    console.log(
      `  ${p.projectId}: screens=${p.designScreens} families=${p.designFamilies} uniqueRefs=${p.uniqueReferencesRequired} avoided=${savings?.generationRequestsAvoided ?? 0} primaryPages=${pageSet?.summary.totalPrimaryPages ?? 0} missing=${pageSet?.summary.missing ?? 0}`,
    );
  }
}

main();
