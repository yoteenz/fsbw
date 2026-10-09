import type { FabricationExecutionEnvironment, WorldFabricationTargetRuntime } from './types';

export type CodexBlenderHandoffPackage = {
  handoffId: string;
  manifestId: string;
  approvedReferenceAssets: string[];
  spatialSpecificationRef: string;
  massingGlbRef?: string;
  expectedModuleHierarchy: string[];
  materialDefinitionsRef?: string;
  cameraTargets: string[];
  exportRequirements: Array<'GLB' | 'FBX' | 'BLEND'>;
  qualityRequirements: string[];
  performanceConstraints: string[];
  allowedModificationScope: string;
  costLimitsRef: string;
  validationSteps: string[];
  expectedReturnPackage: string[];
  executionEnvironment: FabricationExecutionEnvironment;
};

export type UnrealAssemblyHandoffPackage = {
  handoffId: string;
  manifestId: string;
  approvedMasterRefs: string[];
  sceneAssemblyRef: string;
  zoneId: string;
  targetRuntime: WorldFabricationTargetRuntime;
  lightingNotes: string[];
  navigationRequirements: string[];
  collisionRequirements: string[];
  cinematicCameraPresets?: string[];
  notMandatoryForSimpleAssets: true;
};

export type WebRuntimeExportManifest = {
  exportId: string;
  manifestId: string;
  targetRuntime: 'WEB_THREEJS' | 'WEB_CUSTOM';
  glbRefs: string[];
  triangleBudget?: number;
  textureMemoryBudgetMb?: number;
  drawCallBudget?: number;
  interactionAnchorRefs: string[];
  reducedMotionFallback: boolean;
  staticFallbackRendering: boolean;
  deviceConstraints: string[];
};

export function validateCodexHandoff(pkg: CodexBlenderHandoffPackage): string[] {
  const errors: string[] = [];
  if (!pkg.approvedReferenceAssets.length) errors.push('Codex handoff requires approved reference assets');
  if (!pkg.spatialSpecificationRef) errors.push('Missing spatial specification ref');
  if (pkg.executionEnvironment === 'UNAVAILABLE') {
    errors.push('Execution environment unavailable — job must remain blocked');
  }
  return errors;
}
