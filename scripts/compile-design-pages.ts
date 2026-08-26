#!/usr/bin/env npx tsx
/**
 * P0.VR.3F — Compile founder-facing website page sets from design route manifest.
 * Workflow: audit routes (if stale) → normalize → family consolidation → compile page sets
 * Usage: npx tsx scripts/compile-design-pages.ts [--stdout] [--diff]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  runCrossProjectRouteForensicAudit,
  registerMissingRoutesAsDesignable,
  attachPageSetsToManifest,
  diffProjectWebsitePageSets,
  MANIFEST_ARTIFACT_RELATIVE_PATH,
} from '../src/studio-os-core/route-intelligence/index.ts';
import type { StudioWorldDesignRouteManifest } from '../src/studio-os-core/route-intelligence/types.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const stdoutOnly = process.argv.includes('--stdout');
const showDiff = process.argv.includes('--diff');

function loadPreviousManifest(path: string): StudioWorldDesignRouteManifest | undefined {
  if (!existsSync(path)) return undefined;
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as StudioWorldDesignRouteManifest;
  } catch {
    return undefined;
  }
}

function main() {
  const outPath = join(repoRoot, MANIFEST_ARTIFACT_RELATIVE_PATH);
  const previous = loadPreviousManifest(outPath);

  const { report, manifest: baseManifest } = runCrossProjectRouteForensicAudit({ repoRoot });
  const routesWithMissing = registerMissingRoutesAsDesignable(
    baseManifest.rawImplementationRoutes,
    baseManifest.dependencyGraphs,
  );
  const withRoutes = { ...baseManifest, rawImplementationRoutes: routesWithMissing, routes: routesWithMissing };
  const manifest = attachPageSetsToManifest(withRoutes);

  const json = JSON.stringify(manifest, null, 2);

  if (stdoutOnly) {
    console.log(json);
    return;
  }

  const outDir = dirname(outPath);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(outPath, json, 'utf8');

  console.log('P0.VR.3F Website Page Compiler');
  console.log(`  path: ${MANIFEST_ARTIFACT_RELATIVE_PATH}`);
  console.log(`  commit: ${manifest.sourceCommit}`);
  console.log(`  schema: ${manifest.schemaVersion}`);
  console.log(`  page set schema: ${manifest.pageSetCompilation?.pageSetSchemaVersion ?? 'n/a'}`);
  console.log(`  design screens: ${manifest.designScreens?.length ?? 0}`);
  console.log(`  compiled projects: ${manifest.projectPageSets?.length ?? 0}`);
  console.log('');

  for (const ps of manifest.projectPageSets ?? []) {
    console.log(
      `  ${ps.projectId}: primary=${ps.summary.totalPrimaryPages} supporting=${ps.supportingPageIds.length} missing=${ps.summary.missing} internalExcluded=${ps.summary.internalExcluded} status=${ps.status}`,
    );
  }

  if (showDiff && previous?.projectPageSets) {
    const diff = diffProjectWebsitePageSets(previous.projectPageSets, manifest.projectPageSets ?? [], {
      previousGeneratedAt: previous.pageSetCompilation?.generatedAt ?? 'unknown',
      currentGeneratedAt: manifest.pageSetCompilation?.generatedAt ?? new Date().toISOString(),
      sourceManifestVersion: manifest.manifestVersion,
    });
    console.log('');
    console.log(`  diff entries: ${diff.entries.length}`);
    for (const e of diff.entries.slice(0, 20)) {
      console.log(`    [${e.type}] ${e.projectId} ${e.pageId ?? ''} — ${e.detail}`);
    }
    if (diff.entries.length > 20) console.log(`    … +${diff.entries.length - 20} more`);
  }

  console.log('');
  console.log(`  raw routes: ${report.routesDiscovered} · true orphans: ${report.orphanedCount}`);
}

main();
