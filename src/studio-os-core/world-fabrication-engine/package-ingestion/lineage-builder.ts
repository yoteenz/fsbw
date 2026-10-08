import type { FabricationAssetRecord, LineageTransformRecord } from '../lineage';
import type { PackageInventory } from './types';

const MANIFEST_ID = 'site00-build-object-v2-benchmark';

/** Known production sequence — historical facts vs files present in this fixture. */
export function buildSite00BuildObjectV2Lineage(
  inventory: PackageInventory,
  projectId: string
): { assets: FabricationAssetRecord[]; transforms: LineageTransformRecord[] } {
  const now = inventory.extractedAt;
  const fileByRole = (role: string) => inventory.files.find((f) => f.role === role);

  const assets: FabricationAssetRecord[] = [
    {
      assetId: 'site00-approved-blueprint-reference',
      manifestId: MANIFEST_ID,
      tier: 'ORIGINAL_REFERENCE',
      storageRef: 'external:approved-blueprint-image',
      approvalStatus: 'APPROVED',
      inputAuthorityVersion: 'founder-approved',
    },
    {
      assetId: 'site00-artlist-rodin-massing',
      manifestId: MANIFEST_ID,
      tier: 'AI_MASSING_SOURCE',
      storageRef: 'external:artlist-rodin-glb',
      provider: 'ARTLIST',
      approvalStatus: 'APPROVED_FOR_RECONSTRUCTION',
    },
    {
      assetId: 'site00-codex-blender-v1-package',
      manifestId: MANIFEST_ID,
      tier: 'FABRICATION_SOURCE',
      storageRef: 'external:SITE00_Build_Object_Review_Package.zip',
      sourceTool: 'BLENDER',
      fabricationScriptVersion: 'V1',
      approvalStatus: 'SUPERSEDED_BY_V2',
      supersededByAssetId: 'site00-codex-blender-v2-package',
    },
    {
      assetId: 'site00-codex-blender-v2-package',
      manifestId: MANIFEST_ID,
      tier: 'APPROVED_MASTER',
      storageRef: inventory.sourceArchivePath ?? inventory.packageRoot,
      contentHash: inventory.sourceArchiveSha256,
      sourceTool: 'BLENDER',
      fabricationScriptVersion: 'V2',
      approvalStatus: 'FOUNDER_REVIEW_PENDING',
    },
  ];

  const blend = fileByRole('SOURCE_BLEND');
  if (blend) {
    assets.push({
      assetId: 'site00-build-object-v2-blend-master',
      manifestId: MANIFEST_ID,
      tier: 'FABRICATION_SOURCE',
      storageRef: blend.relativePath,
      contentHash: blend.sha256,
      sourceTool: 'BLENDER',
      materialDependencies: inventory.files
        .filter((f) => f.role === 'SOURCE_TEXTURE')
        .map((f) => f.relativePath),
      approvalStatus: 'FOUNDER_REVIEW_PENDING',
    });
  }

  const webGlb = fileByRole('RUNTIME_GLB');
  if (webGlb) {
    assets.push({
      assetId: 'site00-build-object-v2-web-glb',
      manifestId: MANIFEST_ID,
      tier: 'RUNTIME_EXPORT',
      storageRef: webGlb.relativePath,
      contentHash: webGlb.sha256,
      exportConfiguration: { target: 'WEB_3D', profile: 'SITE00_BUILD_OBJECT_WEB_3D' },
      approvalStatus: 'FOUNDER_REVIEW_PENDING',
    });
  }

  const transforms: LineageTransformRecord[] = [
    {
      transformId: 'xf-blueprint-to-rodin',
      manifestId: MANIFEST_ID,
      inputAssetIds: ['site00-approved-blueprint-reference'],
      outputAssetIds: ['site00-artlist-rodin-massing'],
      version: '1',
      agentOrTool: 'ARTLIST_RODIN',
      executedAt: 'historical-reported',
      configuration: { paidGeneration: false, note: 'Historical — not re-run in this sprint' },
      validationResult: 'SKIPPED',
      approvalState: 'APPROVED',
      tier: 'AI_MASSING_SOURCE',
    },
    {
      transformId: 'xf-rodin-to-codex-v1',
      manifestId: MANIFEST_ID,
      inputAssetIds: ['site00-artlist-rodin-massing', 'site00-approved-blueprint-reference'],
      outputAssetIds: ['site00-codex-blender-v1-package'],
      version: '1',
      agentOrTool: 'CODEX_BLENDER',
      executedAt: 'historical-reported',
      configuration: {},
      validationResult: 'PASS',
      approvalState: 'SUPERSEDED',
      tier: 'FABRICATION_SOURCE',
    },
    {
      transformId: 'xf-v1-to-codex-v2',
      manifestId: MANIFEST_ID,
      inputAssetIds: ['site00-codex-blender-v1-package', 'site00-approved-blueprint-reference'],
      outputAssetIds: ['site00-codex-blender-v2-package'],
      version: '2',
      agentOrTool: 'CODEX_BLENDER',
      executedAt: now,
      configuration: { sprint: 'P0.SITE00.BUILDER.BUILD-OBJECT.V2-REFERENCE-FIDELITY-ARCHITECTURAL-RECONSTRUCTION1' },
      validationResult: 'PENDING',
      approvalState: 'FOUNDER_REVIEW_PENDING',
      tier: 'FABRICATION_SOURCE',
      supersedesTransformId: 'xf-rodin-to-codex-v1',
    },
  ];

  if (projectId !== 'site00') {
    // caller handles cross-project rejection
  }

  return { assets, transforms };
}
