import { describe, expect, it } from 'vitest';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { inspectGlbFile } from './glb-inspector';
import { inventoryPackageDirectory } from './inventory';
import {
  ingestFabricationAssetPackage,
  verifyCodexReturnPath,
  ingestFromArchiveZip,
} from './ingest-workflow';
import type { CodexBlenderHandoffPackage } from '../handoffs';
import { assertImmutableOriginPreserved } from '../lineage';

const FIXTURE_ROOT = join(
  import.meta.dirname,
  '../benchmarks/site00-build-object-v2/fixture'
);
const REPORTS_DIR = join(import.meta.dirname, '../benchmarks/site00-build-object-v2/reports');
const ARCHIVE_PATH =
  '/home/ubuntu/.cursor/projects/workspace/uploads/SITE00_Build_Object_V2_Under4MB_4d08.zip';

const fixturePresent = existsSync(join(FIXTURE_ROOT, '02_EXPORTS/SITE00_Build_Object_V2_Web.glb'));

describe('GLB parser (real file)', () => {
  it.skipIf(!fixturePresent)('parses SITE00 V2 web GLB with expected hash and complexity', () => {
    const glbPath = join(FIXTURE_ROOT, '02_EXPORTS/SITE00_Build_Object_V2_Web.glb');
    const result = inspectGlbFile(glbPath);
    expect(result.parseOk).toBe(true);
    expect(result.sha256).toBe('813f0646954f37deed11f3c8bca40d68d7ba158f8dd6ced04bb6a911d8dbac81');
    expect(result.meshCount).toBeGreaterThan(0);
    expect(result.materialNames.length).toBeGreaterThanOrEqual(6);
    expect(result.triangleCount).toBeGreaterThan(1000);
    expect(result.extensionsUsed.length).toBeGreaterThan(0);
  });
});

describe('package inventory', () => {
  it.skipIf(!fixturePresent)('inventories reduced V2 fixture and flags missing full-package paths', () => {
    const inv = inventoryPackageDirectory(FIXTURE_ROOT);
    expect(inv.fileCount).toBe(17);
    expect(inv.missingFromFullReviewPackage.length).toBeGreaterThan(0);
    expect(inv.files.some((f) => f.role === 'SOURCE_BLEND')).toBe(true);
  });
});

describe('ingest workflow', () => {
  it.skipIf(!fixturePresent)('ingests V2 package and writes benchmark reports', () => {
    const result = ingestFabricationAssetPackage({
      projectId: 'site00',
      assetId: 'site00_bld_object_v2',
      productionProfileId: 'SITE00_BUILD_OBJECT_WEB_3D',
      packageRoot: FIXTURE_ROOT,
      sourceArchivePath: existsSync(ARCHIVE_PATH) ? ARCHIVE_PATH : undefined,
      outputReportsDir: REPORTS_DIR,
    });
    expect(result.outcome).toMatch(/INGESTED/);
    expect(result.record?.packageManifest.productionProfileId).toBe('SITE00_BUILD_OBJECT_WEB_3D');
    expect(result.record?.glbInspections[0]?.parseOk).toBe(true);
    expect(existsSync(join(REPORTS_DIR, 'readiness-report.json'))).toBe(true);

    const origin = assertImmutableOriginPreserved(
      result.record!.lineageAssets,
      'site00-approved-blueprint-reference'
    );
    expect(origin.ok).toBe(true);
  });

  it('rejects cross-project ingestion', () => {
    const result = ingestFabricationAssetPackage({
      projectId: 'other-project',
      assetId: 'x',
      productionProfileId: 'SITE00_BUILD_OBJECT_WEB_3D',
      packageRoot: FIXTURE_ROOT,
    });
    expect(result.outcome).toBe('REJECTED_CROSS_PROJECT');
  });

  it.skipIf(!fixturePresent)('rejects duplicate ingestion', () => {
    const first = ingestFabricationAssetPackage({
      projectId: 'site00',
      assetId: 'site00_bld_object_v2',
      productionProfileId: 'SITE00_BUILD_OBJECT_WEB_3D',
      packageRoot: FIXTURE_ROOT,
    });
    const second = ingestFabricationAssetPackage({
      projectId: 'site00',
      assetId: 'site00_bld_object_v2',
      productionProfileId: 'SITE00_BUILD_OBJECT_WEB_3D',
      packageRoot: FIXTURE_ROOT,
      existingRecords: first.record ? [first.record] : [],
    });
    expect(second.outcome).toBe('REJECTED_DUPLICATE');
  });

  it.skipIf(!fixturePresent)('verifies codex return path on ingested record', () => {
    const ingested = ingestFabricationAssetPackage({
      projectId: 'site00',
      assetId: 'site00_bld_object_v2',
      productionProfileId: 'SITE00_BUILD_OBJECT_WEB_3D',
      packageRoot: FIXTURE_ROOT,
    });
    const handoff: CodexBlenderHandoffPackage = {
      handoffId: 'h-benchmark',
      manifestId: 'site00-build-object-v2-benchmark',
      approvedReferenceAssets: ['approved-blueprint-reference'],
      spatialSpecificationRef: 'site00-build-object-spatial',
      expectedModuleHierarchy: ['BUILD_OBJECT_ROOT'],
      cameraTargets: ['matched-camera'],
      exportRequirements: ['GLB', 'BLEND'],
      qualityRequirements: ['modular naming'],
      performanceConstraints: ['web triangle budget'],
      allowedModificationScope: 'none-post-delivery',
      costLimitsRef: 'budget-0',
      validationSteps: ['export-validation-report'],
      expectedReturnPackage: ['GLB', 'BLEND', 'validation report'],
      executionEnvironment: 'CODEX_AGENT',
    };
    const verification = verifyCodexReturnPath(handoff, ingested.record!);
    expect(verification.returnPackageStructureOk).toBe(true);
    expect(verification.automatedExecution).toBe('IMPORT_RETURN_PATH_ONLY');
    expect(verification.validationReportsIngested).toBe(true);
  });

  it.skipIf(!existsSync(ARCHIVE_PATH))('requires extracted directory for zip ingest', () => {
    const result = ingestFromArchiveZip(ARCHIVE_PATH, FIXTURE_ROOT, {
      projectId: 'site00',
      assetId: 'site00_bld_object_v2',
      productionProfileId: 'SITE00_BUILD_OBJECT_WEB_3D',
    });
    expect(result.outcome).toMatch(/INGESTED/);
  });
});
