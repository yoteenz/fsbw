import type { SceneStackLayerId } from '../../scene-stack/types';
import {
  getModelRouteById,
  getPrimaryRouteForAssetClass,
  MODEL_REGISTRY_ROUTES,
} from '../model-registry/routes';
import {
  NANO_BANANA_2_EDIT_ENDPOINT,
  NANO_BANANA_2_PRODUCTION_QUALITY,
  NANO_BANANA_2_PRODUCTION_THINKING,
  NANO_BANANA_2_T2I_ENDPOINT,
} from '../model-registry/nano-banana-2-schema';
import { resolvePromptRouting } from '../prompt-router/prompt-router';
import {
  isBackgroundCleanupIntent,
  isProductionAssetIntent,
  isWorldEnvironmentIntent,
  resolveAssetClassForIntent,
  resolveWorkerFamilyForIntent,
} from './intent-matrix';
import type {
  GenerationSurface,
  ModelRoutingDecision,
  ModelRoutingReferenceStrategy,
  ResolveModelRoutingInput,
} from './types';
import { MODEL_ROUTING_ENGINE_VERSION } from './types';

function inferSurface(intent: ResolveModelRoutingInput['artifactIntent'], surface?: GenerationSurface): GenerationSurface {
  if (surface) return surface;
  if (intent === 'founder-full-room-preview') return 'founder-render';
  if (isWorldEnvironmentIntent(intent)) return 'experience-lab';
  if (isProductionAssetIntent(intent)) return 'creative-direction-studio';
  if (isBackgroundCleanupIntent(intent)) return 'scene-stack';
  return 'scene-stack';
}

function resolveReferenceStrategy(input: {
  workerFamily: ReturnType<typeof resolveWorkerFamilyForIntent>;
  assetClass: ReturnType<typeof resolveAssetClassForIntent>;
  brandGroundingRequired: boolean;
}): ModelRoutingReferenceStrategy {
  if (input.workerFamily === 'background-cleanup') return 'none';
  if (input.workerFamily === 'world-architect') {
    return input.assetClass === 'founder-full-room-preview'
      ? 'brand-material-references-only'
      : 'marble-genesis-anchor';
  }
  if (input.brandGroundingRequired) return 'brand-material-references-only';
  return 'placement-metadata-only';
}

function resolveRouteForDecision(input: ResolveModelRoutingInput, assetClass: ReturnType<typeof resolveAssetClassForIntent>) {
  let route = getPrimaryRouteForAssetClass(assetClass);
  const brandGrounding = input.brandGroundingRequired === true;

  if (brandGrounding && route.supportsBrandAssetGuidance && route.fallbackRouteIds.length > 0) {
    const editFallback = route.fallbackRouteIds
      .map((id) => getModelRouteById(id))
      .find((r) => r?.endpointId === NANO_BANANA_2_EDIT_ENDPOINT);
    if (editFallback) route = editFallback;
  }

  if (input.artifactIntent === 'founder-full-room-preview') {
    const founderRoute = getModelRouteById('nano-banana-pro-founder-full-room');
    if (founderRoute) route = founderRoute;
  }

  if (input.artifactIntent === 'environment-shell' || input.artifactIntent === 'experience-environment') {
    const shellRoute = getModelRouteById('nano-banana-pro-edit-shell');
    if (shellRoute) route = shellRoute;
  }

  return route;
}

/** ModelRoutingEngine™ — selects model + reference strategy before any AI worker executes. */
export function resolveModelRoutingDecision(input: ResolveModelRoutingInput): ModelRoutingDecision {
  const workerFamily = resolveWorkerFamilyForIntent(input.artifactIntent);
  const assetClass = resolveAssetClassForIntent(input.artifactIntent, input.assetClass);
  const surface = inferSurface(input.artifactIntent, input.surface);
  const route = resolveRouteForDecision(input, assetClass);
  const prompt = resolvePromptRouting({ artifactIntent: input.artifactIntent, assetClass });
  const brandGrounding = input.brandGroundingRequired === true;
  const referenceStrategy = resolveReferenceStrategy({
    workerFamily,
    assetClass,
    brandGroundingRequired: brandGrounding,
  });

  const textToImageOnly =
    route.generationMode === 'text-to-image' && route.endpointId === NANO_BANANA_2_T2I_ENDPOINT;

  return {
    engineVersion: MODEL_ROUTING_ENGINE_VERSION,
    artifactIntent: input.artifactIntent,
    workerFamily,
    surface,
    assetClass,
    routeId: route.routeId,
    provider: 'fal',
    providerModel: route.endpointId,
    providerEndpoint: route.endpointId,
    generationMode: route.generationMode,
    referenceStrategy,
    referencePolicy: route.referencePolicy,
    promptVersion: prompt.promptVersion,
    promptBuilderId: prompt.promptBuilderId,
    textToImageOnly,
    requestedAlpha: route.alphaPolicy === 'requested' || route.alphaPolicy === 'post-cleanup',
    allowBackgroundExtraction: workerFamily === 'asset-manufacturer',
    brandGroundingCapable: route.supportsBrandAssetGuidance,
    policyVersion: route.policyVersion,
    resolutionTruth: {
      requestedResolution: '4K',
      providerNativeResolution: NANO_BANANA_2_PRODUCTION_QUALITY,
      supportsNative4K: route.endpointId.startsWith('fal-ai/nano-banana-2'),
      thinkingLevel:
        route.endpointId.startsWith('fal-ai/nano-banana-2') ? NANO_BANANA_2_PRODUCTION_THINKING : undefined,
    },
  };
}

export function resolveModelRoutingFromLayerId(
  layerId: SceneStackLayerId,
  options?: {
    organizationId?: string | null;
    brandGroundingRequired?: boolean;
    isolationAttempt?: number;
    surface?: GenerationSurface;
  }
): ModelRoutingDecision {
  const intent = layerIdToArtifactIntent(layerId);
  return resolveModelRoutingDecision({
    artifactIntent: intent,
    surface: options?.surface ?? 'scene-stack',
    brandGroundingRequired: options?.brandGroundingRequired,
    isolationAttempt: options?.isolationAttempt,
    organizationId: options?.organizationId,
  });
}

export function layerIdToArtifactIntent(layerId: SceneStackLayerId): import('../artifact-intent').ArtifactIntent {
  switch (layerId) {
    case 'environment-shell':
      return 'environment-shell';
    case 'signature-landmark':
      return 'landmark-asset';
    case 'furniture-objects':
      return 'object-group';
    case 'surface-materials':
      return 'material-map';
    case 'atmospheric-systems':
      return 'transparent-overlay';
    case 'ambient-motion':
      return 'transparent-overlay';
    case 'lighting-systems':
      return 'material-map';
    default:
      return 'decor-asset';
  }
}

export function getWorldArchitectDefaultModel(): string {
  const route = getModelRouteById('nano-banana-pro-edit-shell');
  return route?.endpointId ?? MODEL_REGISTRY_ROUTES.find((r) => r.routeId === 'nano-banana-pro-edit-shell')!.endpointId;
}

export function getAssetManufacturerDefaultModel(): string {
  const route = getModelRouteById('nano-banana-2-isolated');
  return route?.endpointId ?? NANO_BANANA_2_T2I_ENDPOINT;
}

export function getBackgroundCleanupModel(): string {
  const route = getModelRouteById('birefnet-background-removal');
  return route?.endpointId ?? 'fal-ai/birefnet/v2';
}
