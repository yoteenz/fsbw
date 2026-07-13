import type { ArtifactIntent } from '../creative-production/artifact-intent';
import type { GenerationSurface } from '../creative-production/model-routing-engine/types';
import {
  isBackgroundCleanupIntent,
  isProductionAssetIntent,
  isWorldEnvironmentIntent,
  BLEND_OVERLAY_INTENTS,
} from '../creative-production/model-routing-engine/intent-matrix';
import {
  resolveModelRoutingDecision,
  type ModelRoutingDecision,
} from '../creative-production/model-routing-engine';
import type { ModelRoutingValidationResult } from '../creative-production/model-routing-engine/types';

function isNanoBananaProEndpoint(endpoint: string): boolean {
  return endpoint.includes('nano-banana-pro');
}

function isNanoBanana2Endpoint(endpoint: string): boolean {
  return endpoint.includes('nano-banana-2');
}

function isBirefnetEndpoint(endpoint: string): boolean {
  return endpoint.includes('birefnet');
}

/** Immune System™ — enforces model specialization before dispatch. */
export function validateModelRoutingDecision(
  decision: ModelRoutingDecision
): ModelRoutingValidationResult {
  const { artifactIntent, providerModel, workerFamily } = decision;

  if (isWorldEnvironmentIntent(artifactIntent) && !isNanoBananaProEndpoint(providerModel)) {
    return {
      ok: false,
      code: 'WORLD_INTENT_REQUIRES_NBP',
      message: `Artifact intent ${artifactIntent} requires Nano Banana Pro (world architect) but received ${providerModel}.`,
    };
  }

  if (BLEND_OVERLAY_INTENTS.has(artifactIntent)) {
    return { ok: true, decision };
  }

  if (isProductionAssetIntent(artifactIntent) && !isNanoBanana2Endpoint(providerModel)) {
    return {
      ok: false,
      code: 'ASSET_INTENT_REQUIRES_NB2',
      message: `Artifact intent ${artifactIntent} requires Nano Banana 2 (asset manufacturer) but received ${providerModel}.`,
    };
  }

  if (isBackgroundCleanupIntent(artifactIntent) && !isBirefnetEndpoint(providerModel)) {
    return {
      ok: false,
      code: 'CLEANUP_INTENT_REQUIRES_BIREFNET',
      message: `Artifact intent ${artifactIntent} requires background cleanup worker but received ${providerModel}.`,
    };
  }

  if (workerFamily === 'world-architect' && isProductionAssetIntent(artifactIntent)) {
    return {
      ok: false,
      code: 'WORLD_WORKER_ASSET_VIOLATION',
      message: `World architect worker cannot generate production asset intent ${artifactIntent}.`,
    };
  }

  if (workerFamily === 'asset-manufacturer' && isWorldEnvironmentIntent(artifactIntent)) {
    return {
      ok: false,
      code: 'ASSET_WORKER_ROOM_VIOLATION',
      message: `Asset manufacturer worker cannot generate environment intent ${artifactIntent}.`,
    };
  }

  return { ok: true, decision };
}

export function validateAndResolveModelRouting(input: {
  artifactIntent: ArtifactIntent;
  surface?: GenerationSurface;
  brandGroundingRequired?: boolean;
  organizationId?: string | null;
  assetClass?: import('../creative-production/model-registry/types').ModelAssetClass;
}): ModelRoutingValidationResult {
  const decision = resolveModelRoutingDecision(input);
  return validateModelRoutingDecision(decision);
}

/** Reject asset workers attempting full-room generation. */
export function assertAssetWorkerNotGeneratingRoom(input: {
  artifactIntent: ArtifactIntent;
  surface: GenerationSurface;
}): ModelRoutingValidationResult | { ok: true } {
  if (
    input.surface === 'creative-direction-studio' &&
    isWorldEnvironmentIntent(input.artifactIntent)
  ) {
    return {
      ok: false,
      code: 'ASSET_WORKER_ROOM_VIOLATION',
      message: 'Creative Director Studio cannot invent architecture — route to Experience Lab.',
    };
  }
  return { ok: true };
}

/** Reject environment workers attempting isolated asset generation. */
export function assertEnvironmentWorkerNotGeneratingAsset(input: {
  artifactIntent: ArtifactIntent;
  surface: GenerationSurface;
}): ModelRoutingValidationResult | { ok: true } {
  if (input.surface === 'experience-lab' && isProductionAssetIntent(input.artifactIntent)) {
    return {
      ok: false,
      code: 'WORLD_WORKER_ASSET_VIOLATION',
      message: 'Experience Lab creates worlds only — route asset intents to Creative Director Studio.',
    };
  }
  return { ok: true };
}
