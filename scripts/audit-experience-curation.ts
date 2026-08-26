#!/usr/bin/env npx tsx
/**
 * P0.VR.3I — Audit experience page curation (leaks, duplicates, conflicts, stale overrides).
 * Usage: npx tsx scripts/audit-experience-curation.ts [--json]
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  MANIFEST_ARTIFACT_RELATIVE_PATH,
  loadExperienceCurationStore,
  auditFrontalSlayerPrimaryExperience,
  buildCompiledByScreen,
  auditAioServiceConsolidation,
} from '../src/studio-os-core/route-intelligence/index.ts';
import type { StudioWorldDesignRouteManifest } from '../src/studio-os-core/route-intelligence/types.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const jsonOut = process.argv.includes('--json');

function main() {
  const manifestPath = join(repoRoot, MANIFEST_ARTIFACT_RELATIVE_PATH);
  if (!existsSync(manifestPath)) {
    console.error('Missing manifest — run npm run compile:design-pages first');
    process.exit(1);
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as StudioWorldDesignRouteManifest;
  const store = loadExperienceCurationStore(repoRoot);

  const report = {
    schema: manifest.schemaVersion,
    sourceCommit: manifest.sourceCommit,
    curationSchema: manifest.experienceCurationCompilation?.curationSchemaVersion,
    projects: [] as Record<string, unknown>[],
    overrideConflicts: store.overrides.filter((o) => o.status === 'OVERRIDE_CONFLICT'),
    activeOverrides: store.overrides.filter((o) => o.active).length,
    supersededOverrides: store.overrides.filter((o) => !o.active).length,
  };

  for (const ps of manifest.projectPageSets ?? []) {
    const cur = ps.experienceCuration;
    const internalLeaks =
      ps.projectId === 'frontal-slayer'
        ? auditFrontalSlayerPrimaryExperience(
            (ps.experiencePages ?? []).filter((p) => p.founderPrimary),
            buildCompiledByScreen(
              ps.compiledPages,
              (manifest.designScreens ?? []).filter((s) => s.projectId === ps.projectId),
            ),
          ).filter((e) => e.classification === 'INTERNAL_WORKSPACE')
        : [];

    const aioConsolidation =
      ps.projectId === 'all-in-one-enterprise'
        ? auditAioServiceConsolidation(
            ps.experiencePages ?? [],
            (manifest.designFamilies ?? []).filter((f) => f.projectId === ps.projectId),
          )
        : [];

    report.projects.push({
      projectId: ps.projectId,
      proposed: cur?.compilerProposedPrimaryCount,
      active: cur?.activePrimaryCount,
      internal: cur?.internalWorkspaceCount,
      status: cur?.universeStatus,
      curationVersion: cur?.curationVersion,
      reviewQueue: cur?.reviewQueue?.length ?? 0,
      possibleInternalLeaks: internalLeaks.length,
      possibleServiceInstances: aioConsolidation.flatMap((c) => c.displayNames).length,
      overrideConflicts: cur?.overrideConflicts?.length ?? 0,
      capturePlan: cur?.capturePlan?.estimatedCaptureCount,
    });
  }

  if (jsonOut) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log('P0.VR.3I Experience Curation Audit');
  console.log(`  manifest: ${report.schema}`);
  console.log(`  curation: ${report.curationSchema ?? 'n/a'}`);
  console.log(`  overrides: ${report.activeOverrides} active · ${report.supersededOverrides} superseded · ${report.overrideConflicts.length} conflicts`);
  console.log('');

  for (const p of report.projects) {
    console.log(
      `  ${p.projectId}: proposed=${p.proposed} active=${p.active} internal=${p.internal} leaks=${p.possibleInternalLeaks} review=${p.reviewQueue} status=${p.status}`,
    );
  }
}

main();
