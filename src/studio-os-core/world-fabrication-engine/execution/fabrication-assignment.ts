import type { CodexBlenderHandoffPackage } from '../handoffs';
import { attachTechnicalArtToCodexHandoff, buildCodexTechnicalArtExtension } from '../technical-art/codex-handoff-extension';
import type { FabricationAssignmentManifest } from './types';

export function buildSite00BuildObjectV2Assignment(params: {
  assignmentId: string;
  packageRoot: string;
  returnRoot: string;
}): FabricationAssignmentManifest {
  const baseHandoff: CodexBlenderHandoffPackage = {
    handoffId: `handoff-${params.assignmentId}`,
    manifestId: 'site00-build-object-v2-benchmark',
    approvedReferenceAssets: ['approved-blueprint-reference'],
    spatialSpecificationRef: 'site00-build-object-spatial',
    expectedModuleHierarchy: ['BUILD_OBJECT_ROOT'],
    materialDefinitionsRef: '05_DOCUMENTATION/material-manifest.json',
    cameraTargets: ['CAM_REFERENCE_MATCH'],
    exportRequirements: ['GLB', 'BLEND'],
    qualityRequirements: ['module naming', 'structural validation'],
    performanceConstraints: ['web triangle budget'],
    allowedModificationScope: 'validation-and-test-export-only',
    costLimitsRef: 'budget-zero',
    validationSteps: ['wfe-blender-execution-report.json'],
    expectedReturnPackage: ['execution test GLB', 'validation report', 'manifest copies'],
    executionEnvironment: 'BLENDER_LOCAL',
  };

  const handoff = attachTechnicalArtToCodexHandoff(
    baseHandoff,
    buildCodexTechnicalArtExtension(baseHandoff, {
      productionLane: 'PROP_INTERACTIVE_OBJECT_ART',
      productionProfileId: 'SITE00_BUILD_OBJECT_WEB_3D',
      deliveryProfileId: 'WEB_3D',
      assetClassificationRef: 'site00_bld_object_v2',
      geometryRequirements: [],
      topologyRequirements: ['NONEMPTY_GEOMETRY', 'EXPECTED_MODULE_NAMES'],
      uvRequirements: [],
      textureRequirements: [],
      materialDefinitions: [],
      collisionRequirements: [],
      lodRequirements: [],
      validationChecklist: ['masterOpens', 'masterMaterialsPresent', 'webGlbIntegrity'],
      reviewRenderRequirements: [],
      executionCapabilityStatus: 'CONTRACT_ONLY',
    })
  );

  return {
    assignmentId: params.assignmentId,
    projectId: 'site00',
    assetId: 'site00_bld_object_v2',
    fabricationVersion: 'codex-blender-v2',
    productionLane: 'PROP_INTERACTIVE_OBJECT_ART',
    targetRuntime: 'WEB_3D',
    secondaryProfile: 'UNREAL_WORLD',
    packageRoot: params.packageRoot,
    returnRoot: params.returnRoot,
    approvedReferenceIds: ['approved-blueprint-reference'],
    sourceAssetRefs: ['01_SOURCE/SITE00_Build_Object_V2.blend'],
    expectedDeliverables: [
      '02_EXPORTS/SITE00_Build_Object_V2_ExecutionTest_Web.glb',
      '05_DOCUMENTATION/wfe-blender-execution-report.json',
    ],
    performanceProfile: 'web-prop-default',
    executionBudget: { allowPaidGeneration: false, maxAttempts: 1 },
    founderApprovalGate: 'FOUNDER_VISUAL_APPROVAL',
    handoff,
    createdAt: new Date().toISOString(),
  };
}
