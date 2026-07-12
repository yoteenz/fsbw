/**
 * Scene Stack™ — Golden Build™ layered environment types.
 * NEVER generate complete scenes as a single image.
 */

export const SCENE_STACK_LAYER_ORDER = [
  'environment-shell',
  'signature-landmark',
  'furniture-objects',
  'lighting-systems',
  'atmospheric-systems',
  'surface-materials',
  'ambient-motion',
  'interaction',
  'runtime-effects',
  'founder-personalization',
] as const;

export type SceneStackLayerId = (typeof SCENE_STACK_LAYER_ORDER)[number];

export type SceneStackLayerRole = 'fal-generated' | 'cursor-runtime';

export type SceneStackLayerDefinition = {
  id: SceneStackLayerId;
  order: number;
  displayName: string;
  role: SceneStackLayerRole;
  generatable: boolean;
  requiresApproval: boolean;
  composeClass: string;
};

export type SceneStackHotspotBounds = {
  left: string;
  top: string;
  width: string;
  height: string;
};

export type SceneStackLayerPrompt = {
  primary: string;
  negative: string;
  heroAssetId: string;
  productionGroupId: string;
};

export type SceneStackStationSpec = {
  stationId: string;
  displayName: string;
  shortLabel: string;
  signatureLandmarkId?: string;
  layerPrompts: Partial<Record<SceneStackLayerId, SceneStackLayerPrompt>>;
  hotspots: Record<string, SceneStackHotspotBounds>;
};

export type SceneStackManifest = {
  departmentId: string;
  packageId: string;
  milestone: string;
  signatureLandmarkId: string;
  aspectRatio: string;
  outputFormat: 'png' | 'webp';
  stations: SceneStackStationSpec[];
};

export type SceneStackLayerStatus = 'idle' | 'generating' | 'candidate' | 'draft_ready' | 'approved' | 'failed' | 'discarded';

/** Canonical classification — Phase 1 hotfix: generated layers are non_canonical until promotion. */
export type SceneStackCanonicalStatus = 'non_canonical' | 'promoted';

/** Scene Stack Quality Guard™ — per-layer validation outcome */
export type SceneLayerQualityStatus = 'pending' | 'validated' | 'regenerate_required';

export type SceneStackLayerRecord = {
  id: string;
  departmentId: string;
  projectId: string;
  stationId: string;
  layerId: SceneStackLayerId;
  version: number;
  status: SceneStackLayerStatus;
  publicUrl?: string;
  storagePath?: string;
  model?: string;
  generatedAt?: string;
  approvedAt?: string;
  promptVersion: string;
  productionGroupId: string;
  heroAssetId: string;
  /** Master Scene Blueprint™ id used at generation time */
  blueprintId?: string;
  /** Scene Assembly Law version — regression guard */
  assemblyLawVersion?: string;
  qualityStatus?: SceneLayerQualityStatus;
  qualityIssues?: string[];
  /** Non-canonical until explicit promotion through Production Authorization (Phase 1). */
  canonicalStatus?: SceneStackCanonicalStatus;
  /** Verified Asset Production Pipeline™ — raw provider URL (forensic only) */
  candidateUrl?: string;
  assetCandidateId?: string;
  /** Required for Scene Stack mount — proves candidate passed full production gate */
  approvalProof?: import('./verified-asset-production/contract').AssetProductionApprovalProof;
  productionStage?: import('./verified-asset-production/contract').VerifiedAssetProductionStage;
  registryState?: import('./verified-asset-production/contract').AssetRegistryLifecycleState;
  quarantineId?: string;
};

export type SceneStackLayerView = {
  layerId: SceneStackLayerId;
  definition: SceneStackLayerDefinition;
  status: SceneStackLayerStatus;
  publicUrl: string | null;
  version: number;
  qualityStatus?: SceneLayerQualityStatus;
  qualityIssues?: string[];
};

export type CompiledSceneStackLayerPrompt = {
  prompt: string;
  negativePrompt: string;
  aspectRatio: string;
  outputFormat: 'png' | 'webp';
  stationId: string;
  layerId: SceneStackLayerId;
  productionGroupId: string;
  heroAssetId: string;
  promptVersion: string;
  blueprintId: string;
  generationMode?: string;
  promptBuilderId?: string;
  providerModel?: string;
  textToImageOnly?: boolean;
  referenceStrategy?: string;
};

export type SceneStackCompositeStatus = 'idle' | 'building' | 'partial' | 'ready' | 'failed';

export const SCENE_STACK_PROMPT_VERSION = 'scene-stack.v3-isolated';
export const SCENE_ASSEMBLY_LAW_VERSION = 'scene-assembly-law.v2';
export const MASTER_SCENE_BLUEPRINT_VERSION = 'master-blueprint.v1';
export const WORLD_COMPILER_LAW_VERSION = 'world-compiler.v1';

export const SCENE_STACK_REQUIRED_LAYERS: SceneStackLayerId[] = [
  'environment-shell',
  'signature-landmark',
  'lighting-systems',
];
