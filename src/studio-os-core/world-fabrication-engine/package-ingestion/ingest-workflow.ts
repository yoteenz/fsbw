import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { AssetPackageManifest } from '../technical-art/asset-package';
import { evaluatePackageCompleteness } from '../technical-art/asset-package';
import type { CodexBlenderHandoffPackage } from '../handoffs';
import { attachTechnicalArtToCodexHandoff, buildCodexTechnicalArtExtension } from '../technical-art/codex-handoff-extension';
import { assertImmutableOriginPreserved } from '../lineage';
import type {
  FabricationAssetPackageRecord,
  PackageIngestionOutcome,
  PackageInventory,
} from './types';
import { inventoryPackageDirectory } from './inventory';
import { inspectGlbFile } from './glb-inspector';
import { buildSite00BuildObjectV2Lineage } from './lineage-builder';
import { buildReadinessReport, buildTechnicalAssessments } from './readiness-report';

export type IngestPackageOptions = {
  projectId: string;
  assetId: string;
  productionProfileId: string;
  packageRoot: string;
  sourceArchivePath?: string;
  existingRecords?: FabricationAssetPackageRecord[];
  outputReportsDir?: string;
};

export type CodexReturnPathVerification = {
  handoffValid: boolean;
  returnPackageStructureOk: boolean;
  validationReportsIngested: boolean;
  lineageRegistered: boolean;
  founderReviewPrepared: boolean;
  automatedExecution: 'IMPORT_RETURN_PATH_ONLY' | 'FULL_AGENT_LOOP';
  manualStepsRequired: string[];
  errors: string[];
};

function buildManifestFromInspection(
  inventory: PackageInventory,
  opts: IngestPackageOptions
): AssetPackageManifest {
  const has = (role: string) => inventory.files.some((f) => f.role === role);
  const deliverableCompleteness: AssetPackageManifest['deliverableCompleteness'] = {
    source_blend: has('SOURCE_BLEND') ? 'PRESENT' : 'MISSING',
    runtime_glb: has('RUNTIME_GLB') ? 'PRESENT' : 'MISSING',
    runtime_fbx: has('RUNTIME_FBX') ? 'PRESENT' : 'MISSING',
    material_definitions: existsSync(join(opts.packageRoot, '05_DOCUMENTATION/material-manifest.json'))
      ? 'PRESENT'
      : 'MISSING',
    validation_report: has('VALIDATION_REPORT') ? 'PRESENT' : 'MISSING',
    package_manifest: existsSync(join(opts.packageRoot, '05_DOCUMENTATION/version-manifest.json'))
      ? 'PRESENT'
      : 'MISSING',
    review_renders: inventory.missingFromFullReviewPackage.some((m) => m.startsWith('03_RENDERS'))
      ? 'MISSING'
      : 'UNVERIFIED',
    uv_layout: 'UNVERIFIED',
    pbr_texture_set: has('SOURCE_TEXTURE') ? 'PRESENT' : 'UNVERIFIED',
    collision_mesh: 'NOT_REQUIRED',
    interaction_anchors: 'UNVERIFIED',
    skeleton: 'NOT_APPLICABLE',
    skin_weights: 'NOT_APPLICABLE',
    animation_clips: 'NOT_APPLICABLE',
    navigation_metadata: 'NOT_APPLICABLE',
    engine_import_config: 'UNVERIFIED',
    lod_meshes: 'NOT_REQUIRED',
    high_poly_mesh: has('RUNTIME_GLB_HIGH') ? 'PRESENT' : 'MISSING',
  };

  return {
    packageId: `pkg-${opts.assetId}-v2`,
    assetId: opts.assetId,
    productionLane: 'PROP_INTERACTIVE_OBJECT_ART',
    productionProfileId: opts.productionProfileId,
    version: 'codex-blender-v2',
    authorityRefs: ['approved-blueprint-reference', 'artlist-rodin-massing'],
    folderPresence: {
      '00_MANIFEST': deliverableCompleteness.package_manifest === 'PRESENT' ? 'PRESENT' : 'MISSING',
      '02_SOURCE_MODELS': has('SOURCE_BLEND') ? 'PRESENT' : 'MISSING',
      '07_MATERIALS': has('SOURCE_TEXTURE') ? 'PRESENT' : 'MISSING',
      '11_EXPORTS': has('RUNTIME_GLB') ? 'PRESENT' : 'MISSING',
      '12_RENDERS_AND_QA': has('VALIDATION_REPORT') ? 'PRESENT' : 'MISSING',
    },
    deliverableCompleteness,
    knownLimitations: inventory.warnings,
    approvalState: 'FOUNDER_REVIEW_PENDING',
  };
}

export function ingestFabricationAssetPackage(opts: IngestPackageOptions): {
  outcome: PackageIngestionOutcome;
  record?: FabricationAssetPackageRecord;
  errors: string[];
} {
  const errors: string[] = [];
  if (opts.projectId !== 'site00') {
    return { outcome: 'REJECTED_CROSS_PROJECT', errors: ['Package benchmark restricted to site00 project scope'] };
  }
  if (!existsSync(opts.packageRoot)) {
    return { outcome: 'REJECTED_INVALID_ARCHIVE', errors: ['Package root does not exist'] };
  }

  const inventory = inventoryPackageDirectory(opts.packageRoot, {
    sourceArchivePath: opts.sourceArchivePath,
    inventoryId: `inv-${opts.assetId}`,
  });

  const packageFingerprint = inventory.files.map((f) => f.sha256).sort().join(':');
  const duplicate = opts.existingRecords?.find((r) => {
    const fp = r.inventory.files.map((f) => f.sha256).sort().join(':');
    return fp === packageFingerprint;
  });
  if (duplicate) {
    return {
      outcome: 'REJECTED_DUPLICATE',
      errors: [`Duplicate of record ${duplicate.recordId}`],
      record: { ...duplicate, duplicateOfRecordId: duplicate.recordId },
    };
  }

  const glbPaths = inventory.files.filter((f) => f.role === 'RUNTIME_GLB' || f.role === 'RUNTIME_GLB_HIGH');
  const glbInspections = glbPaths.map((f) => inspectGlbFile(join(opts.packageRoot, f.relativePath)));
  for (const g of glbInspections) {
    if (!g.parseOk) {
      return { outcome: 'REJECTED_CORRUPT_GLB', errors: g.parseErrors };
    }
  }

  const packageManifest = buildManifestFromInspection(inventory, opts);
  const { assets, transforms } = buildSite00BuildObjectV2Lineage(inventory, opts.projectId);
  const originCheck = assertImmutableOriginPreserved(assets, 'site00-approved-blueprint-reference');
  if (!originCheck.ok) errors.push(originCheck.reason ?? 'Lineage origin check failed');

  const technicalAssessments = buildTechnicalAssessments(inventory, glbInspections, opts.packageRoot);
  const readiness = buildReadinessReport(packageManifest, inventory, glbInspections, opts.packageRoot);

  const record: FabricationAssetPackageRecord = {
    recordId: `fap-${opts.assetId}-${Date.now()}`,
    projectId: opts.projectId,
    assetId: opts.assetId,
    packageManifest,
    inventory,
    glbInspections,
    lineageAssets: assets,
    lineageTransforms: transforms,
    technicalAssessments,
    ingestionRunId: `run-${Date.now()}`,
    ingestedAt: new Date().toISOString(),
  };

  if (opts.outputReportsDir) {
    mkdirSync(opts.outputReportsDir, { recursive: true });
    writeFileSync(join(opts.outputReportsDir, 'inventory.json'), JSON.stringify(inventory, null, 2));
    writeFileSync(join(opts.outputReportsDir, 'glb-inspection.json'), JSON.stringify(glbInspections, null, 2));
    writeFileSync(join(opts.outputReportsDir, 'asset-package-manifest.json'), JSON.stringify(packageManifest, null, 2));
    writeFileSync(
      join(opts.outputReportsDir, 'technical-art-audit.json'),
      JSON.stringify(
        { assessments: technicalAssessments, completeness: evaluatePackageCompleteness(packageManifest) },
        null,
        2
      )
    );
    writeFileSync(join(opts.outputReportsDir, 'lineage.json'), JSON.stringify({ assets, transforms }, null, 2));
    writeFileSync(join(opts.outputReportsDir, 'readiness-report.json'), JSON.stringify(readiness, null, 2));
    writeFileSync(
      join(opts.outputReportsDir, 'founder-review-package.json'),
      JSON.stringify(
        {
          founderApproval: 'PENDING',
          recommendedDecision: 'REVISE',
          readiness,
          manifest: packageManifest,
          inventorySummary: { fileCount: inventory.fileCount, warnings: inventory.warnings },
        },
        null,
        2
      )
    );
  }

  const outcome: PackageIngestionOutcome =
    errors.length > 0 ? 'INGESTED_WITH_WARNINGS' : inventory.warnings.length ? 'INGESTED_WITH_WARNINGS' : 'INGESTED';

  return { outcome, record, errors };
}

export function verifyCodexReturnPath(
  handoff: CodexBlenderHandoffPackage,
  record: FabricationAssetPackageRecord
): CodexReturnPathVerification {
  const errors: string[] = [];
  const manualStepsRequired = [
    'Codex agent execution on Shadow PC is manual unless remote automation is authorized',
    'Return package transfer via zip upload or secured storage reference',
  ];

  if (!handoff.expectedReturnPackage.length) {
    errors.push('Handoff missing expectedReturnPackage');
  }

  const hasGlb = record.inventory.files.some((f) => f.role === 'RUNTIME_GLB');
  const hasBlend = record.inventory.files.some((f) => f.role === 'SOURCE_BLEND');
  const returnOk = hasGlb && hasBlend;

  const extended = attachTechnicalArtToCodexHandoff(
    handoff,
    buildCodexTechnicalArtExtension(handoff, {
      productionLane: 'PROP_INTERACTIVE_OBJECT_ART',
      productionProfileId: record.packageManifest.productionProfileId,
      deliveryProfileId: 'WEB_3D',
      assetClassificationRef: record.assetId,
      geometryRequirements: [],
      topologyRequirements: ['NONEMPTY_GEOMETRY', 'FINITE_TRANSFORMS'],
      uvRequirements: [],
      textureRequirements: [],
      materialDefinitions: [],
      collisionRequirements: [],
      lodRequirements: [],
      validationChecklist: handoff.validationSteps,
      reviewRenderRequirements: ['matched-camera render when full package present'],
      executionCapabilityStatus: 'CONTRACT_ONLY',
    })
  );

  if (!extended.technicalArt) errors.push('Failed to attach technical art extension');

  return {
    handoffValid: errors.length === 0,
    returnPackageStructureOk: returnOk,
    validationReportsIngested: record.inventory.files.some((f) => f.role === 'VALIDATION_REPORT'),
    lineageRegistered: record.lineageAssets.length > 0,
    founderReviewPrepared: true,
    automatedExecution: 'IMPORT_RETURN_PATH_ONLY',
    manualStepsRequired,
    errors,
  };
}

export function ingestFromArchiveZip(
  zipPath: string,
  extractDir: string,
  opts: Omit<IngestPackageOptions, 'packageRoot' | 'sourceArchivePath'>
): ReturnType<typeof ingestFabricationAssetPackage> {
  if (!existsSync(zipPath)) {
    return { outcome: 'REJECTED_INVALID_ARCHIVE', errors: ['Archive not found'] };
  }
  // Extraction is performed externally (benchmark fixture); verify archive hash if needed
  if (!existsSync(extractDir)) {
    return { outcome: 'REJECTED_INVALID_ARCHIVE', errors: ['Extract directory missing — extract archive first'] };
  }
  return ingestFabricationAssetPackage({
    ...opts,
    packageRoot: extractDir,
    sourceArchivePath: zipPath,
    outputReportsDir: opts.outputReportsDir,
  });
}
