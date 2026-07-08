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

export type SceneStackLayerStatus = 'idle' | 'generating' | 'approved' | 'failed' | 'discarded';

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
};

export type SceneStackCompositeStatus = 'idle' | 'building' | 'partial' | 'ready' | 'failed';

export const SCENE_STACK_PROMPT_VERSION = 'scene-stack.v2';
export const SCENE_ASSEMBLY_LAW_VERSION = 'scene-assembly-law.v1';
export const MASTER_SCENE_BLUEPRINT_VERSION = 'master-blueprint.v1';

export const SCENE_STACK_REQUIRED_LAYERS: SceneStackLayerId[] = [
  'environment-shell',
  'signature-landmark',
  'lighting-systems',
];
