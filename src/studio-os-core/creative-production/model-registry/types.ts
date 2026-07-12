/**
 * Model Registry™ — configuration-driven creative model routing.
 * layer-model-routing.v2
 */

export const MODEL_REGISTRY_POLICY_VERSION = 'layer-model-routing.v2';

export type ModelAssetClass =
  | 'environment-shell'
  | 'signature-landmark'
  | 'furniture-objects'
  | 'architectural-prop'
  | 'decorative-object'
  | 'reception-structure'
  | 'material-overlay'
  | 'atmosphere-overlay'
  | 'motion-overlay'
  | 'reflection-overlay'
  | 'background-removal'
  | 'image-upscale';

export type ModelGenerationMode =
  | 'text-to-image'
  | 'image-to-image'
  | 'background-removal'
  | 'upscale';

export type ModelReferencePolicy =
  | 'none'
  | 'marble-genesis-anchor'
  | 'shell-placement-img2img'
  | 'placement-metadata-only'
  | 'brand-material-references-only';

export type ModelRolloutState = 'production' | 'canary' | 'deprecated' | 'rollback';

export type ResolutionTruthState =
  | 'native-4k'
  | 'provider-nearest-supported'
  | 'post-upscaled-4k';

export type ModelRouteDefinition = {
  routeId: string;
  assetClass: ModelAssetClass;
  generationMode: ModelGenerationMode;
  provider: 'fal';
  endpointId: string;
  qualityPreset: string;
  targetResolution: '4K' | '2K' | '1K';
  referencePolicy: ModelReferencePolicy;
  alphaPolicy: 'none' | 'requested' | 'post-cleanup';
  backgroundPolicy: 'full-scene' | 'studio-seamless' | 'transparent-alpha';
  supportsBrandAssetGuidance: boolean;
  supportsMultipleReferences: boolean;
  fallbackRouteIds: string[];
  enabled: boolean;
  rolloutState: ModelRolloutState;
  policyVersion: string;
  approvedBy: string;
  approvedAt: string;
  notes: string;
};

export type ResolvedModelRoute = ModelRouteDefinition & {
  providerModel: string;
  providerEndpoint: string;
  textToImageOnly: boolean;
  promptBuilderId: string;
  allowBackgroundExtraction: boolean;
  requestedAlpha: boolean;
  resolutionTruth: {
    requestedResolution: string;
    providerNativeResolution: string;
    supportsNative4K: boolean;
    thinkingLevel?: string;
  };
};

export type ResolveModelRouteInput = {
  organizationId?: string | null;
  assetClass: ModelAssetClass;
  generationMode?: ModelGenerationMode;
  qualityTarget?: 'production' | 'concept';
  brandGroundingRequired?: boolean;
  surface?: 'creative-studio' | 'experience-lab' | 'scene-stack';
  isolationAttempt?: number;
};

export type ResolutionReport = {
  requestedResolution: string;
  providerNativeResolution: string;
  outputResolution: string;
  upscaleApplied: boolean;
  upscaleModel: string | null;
  finalResolution: string;
  truthState: ResolutionTruthState;
};
