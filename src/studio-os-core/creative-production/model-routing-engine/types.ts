import type { ArtifactIntent } from '../artifact-intent';
import type { ModelAssetClass, ModelGenerationMode, ModelReferencePolicy } from '../model-registry/types';

export const MODEL_ROUTING_ENGINE_VERSION = 'model-routing-engine.v1' as const;

/** Worker specialization — one model family per responsibility. */
export type GenerationWorkerFamily = 'world-architect' | 'asset-manufacturer' | 'background-cleanup';

export type GenerationSurface =
  | 'experience-lab'
  | 'creative-direction-studio'
  | 'scene-stack'
  | 'founder-render'
  | 'studio-builder';

export type ModelRoutingReferenceStrategy =
  | 'none'
  | 'marble-genesis-anchor'
  | 'approved-founder-render-context'
  | 'brand-material-references-only'
  | 'placement-metadata-only'
  | 'shell-placement-img2img';

export type ResolveModelRoutingInput = {
  artifactIntent: ArtifactIntent;
  surface?: GenerationSurface;
  assetClass?: ModelAssetClass;
  organizationId?: string | null;
  brandGroundingRequired?: boolean;
  isolationAttempt?: number;
  aspectRatio?: '16:9' | '21:9';
};

export type ModelRoutingDecision = {
  engineVersion: typeof MODEL_ROUTING_ENGINE_VERSION;
  artifactIntent: ArtifactIntent;
  workerFamily: GenerationWorkerFamily;
  surface: GenerationSurface;
  assetClass: ModelAssetClass;
  routeId: string;
  provider: 'fal';
  providerModel: string;
  providerEndpoint: string;
  generationMode: ModelGenerationMode;
  referenceStrategy: ModelRoutingReferenceStrategy;
  referencePolicy: ModelReferencePolicy;
  promptVersion: string;
  promptBuilderId: string;
  textToImageOnly: boolean;
  requestedAlpha: boolean;
  allowBackgroundExtraction: boolean;
  brandGroundingCapable: boolean;
  policyVersion: string;
  resolutionTruth: {
    requestedResolution: string;
    providerNativeResolution: string;
    supportsNative4K: boolean;
    thinkingLevel?: string;
  };
};

export type ModelRoutingValidationCode =
  | 'WORLD_INTENT_REQUIRES_NBP'
  | 'ASSET_INTENT_REQUIRES_NB2'
  | 'CLEANUP_INTENT_REQUIRES_BIREFNET'
  | 'WORLD_WORKER_ASSET_VIOLATION'
  | 'ASSET_WORKER_ROOM_VIOLATION'
  | 'SURFACE_WORKER_MISMATCH'
  | 'UNKNOWN_ARTIFACT_INTENT';

export type ModelRoutingValidationResult =
  | { ok: true; decision: ModelRoutingDecision }
  | { ok: false; code: ModelRoutingValidationCode; message: string };
