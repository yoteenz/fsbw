import type { CodexBlenderHandoffPackage } from '../handoffs';
import type { ProductionLane, DeliveryProfileId } from './types';
import type { GeometryArtifactRef, UvSetContract, MaterialRecord, TextureMapRecord } from './geometry-uv-texture-material';
import type { ModularKitModule } from './modular-collision-nav-lod';
import type { CollisionGeometryRecord, NavigationRequirementRecord, LodLevelRecord } from './modular-collision-nav-lod';
import type { SkeletonRecord, AnimationClipRecord } from './character-rig-animation';
import { inferFolderExpectations } from './asset-package';

export type CodexFabricationTechnicalArtExtension = {
  extensionVersion: '1.0';
  productionLane: ProductionLane;
  productionProfileId: string;
  deliveryProfileId: DeliveryProfileId;
  assetClassificationRef: string;
  geometryRequirements: GeometryArtifactRef[];
  topologyRequirements: string[];
  uvRequirements: UvSetContract[];
  textureRequirements: TextureMapRecord[];
  materialDefinitions: MaterialRecord[];
  modularComponents?: ModularKitModule[];
  collisionRequirements: CollisionGeometryRecord[];
  lodRequirements: LodLevelRecord[];
  navigationRequirements?: NavigationRequirementRecord;
  rigRequirements?: SkeletonRecord;
  animationRequirements?: AnimationClipRecord[];
  expectedPackageFolders: string[];
  validationChecklist: string[];
  reviewRenderRequirements: string[];
  executionCapabilityStatus: 'CONTRACT_ONLY' | 'LOCAL_SHADOW_PC' | 'CLOUD_AUTOMATION';
};

export type CodexBlenderHandoffWithTechnicalArt = CodexBlenderHandoffPackage & {
  technicalArt?: CodexFabricationTechnicalArtExtension;
};

export function buildCodexTechnicalArtExtension(
  _base: CodexBlenderHandoffPackage,
  partial: Omit<CodexFabricationTechnicalArtExtension, 'extensionVersion' | 'expectedPackageFolders'> & {
    expectedPackageFolders?: string[];
  }
): CodexFabricationTechnicalArtExtension {
  return {
    extensionVersion: '1.0',
    expectedPackageFolders:
      partial.expectedPackageFolders ?? inferFolderExpectations(partial.productionProfileId).map(String),
    ...partial,
  };
}

export function validateCodexTechnicalArtExtension(ext: CodexFabricationTechnicalArtExtension): string[] {
  const errors: string[] = [];
  if (ext.executionCapabilityStatus !== 'CONTRACT_ONLY') {
    errors.push('Only CONTRACT_ONLY execution is verified in this sprint');
  }
  if (!ext.productionProfileId) errors.push('productionProfileId required');
  if (ext.validationChecklist.length === 0) errors.push('validationChecklist must not be empty');
  return errors;
}

export function attachTechnicalArtToCodexHandoff(
  pkg: CodexBlenderHandoffPackage,
  ext: CodexFabricationTechnicalArtExtension
): CodexBlenderHandoffWithTechnicalArt {
  const extErrors = validateCodexTechnicalArtExtension(ext);
  if (extErrors.length > 0) {
    throw new Error(`Invalid technical art extension: ${extErrors.join('; ')}`);
  }
  return { ...pkg, technicalArt: ext };
}
