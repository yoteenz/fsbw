import type { SceneStackLayerId } from '../../scene-stack/types';
import { getIsolatedLayerContract } from '../../scene-stack/isolated-layer-contract';
import type { ResolveModelRouteInput, ResolvedModelRoute } from './types';
import {
  getModelRouteById,
  getPrimaryRouteForAssetClass,
  MODEL_REGISTRY_ROUTES,
  SCENE_STACK_ISOLATED_OBJECT_FAL_MODEL,
  SCENE_STACK_SHELL_FAL_MODEL,
} from './routes';
import {
  NANO_BANANA_2_EDIT_ENDPOINT,
  NANO_BANANA_2_PRODUCTION_QUALITY,
  NANO_BANANA_2_PRODUCTION_THINKING,
  NANO_BANANA_2_T2I_ENDPOINT,
} from './nano-banana-2-schema';

export function layerIdToAssetClass(layerId: SceneStackLayerId): import('./types.js').ModelAssetClass {
  switch (layerId) {
    case 'environment-shell':
      return 'environment-shell';
    case 'signature-landmark':
      return 'signature-landmark';
    case 'furniture-objects':
      return 'furniture-objects';
    case 'surface-materials':
      return 'material-overlay';
    case 'atmospheric-systems':
      return 'atmosphere-overlay';
    case 'ambient-motion':
      return 'motion-overlay';
    case 'lighting-systems':
      return 'reflection-overlay';
    default:
      return 'decorative-object';
  }
}

const PROMPT_BUILDER_BY_LAYER: Partial<Record<SceneStackLayerId, string>> = {
  'environment-shell': 'environment-shell-prompt.v1',
  'signature-landmark': 'signature-landmark-isolated-prompt.v3',
  'furniture-objects': 'furniture-objects-isolated-prompt.v3',
};

export function resolveModelRoute(input: ResolveModelRouteInput): ResolvedModelRoute {
  const brandGrounding = input.brandGroundingRequired === true;
  let route = getPrimaryRouteForAssetClass(input.assetClass);

  if (brandGrounding && route.supportsBrandAssetGuidance && route.fallbackRouteIds.length > 0) {
    const editFallback = route.fallbackRouteIds
      .map((id) => getModelRouteById(id))
      .find((r) => r?.endpointId === NANO_BANANA_2_EDIT_ENDPOINT);
    if (editFallback) {
      route = editFallback;
    }
  }

  const textToImageOnly =
    route.generationMode === 'text-to-image' && route.endpointId === NANO_BANANA_2_T2I_ENDPOINT;

  return {
    ...route,
    providerModel: route.endpointId,
    providerEndpoint: route.endpointId,
    textToImageOnly,
    promptBuilderId: PROMPT_BUILDER_BY_LAYER[input.assetClass as SceneStackLayerId] ?? 'blend-overlay-prompt.v1',
    allowBackgroundExtraction: route.assetClass !== 'environment-shell',
    requestedAlpha: route.alphaPolicy === 'requested' || route.alphaPolicy === 'post-cleanup',
    resolutionTruth: {
      requestedResolution: '4K',
      providerNativeResolution: NANO_BANANA_2_PRODUCTION_QUALITY,
      supportsNative4K: route.endpointId.startsWith('fal-ai/nano-banana-2'),
      thinkingLevel:
        route.endpointId.startsWith('fal-ai/nano-banana-2') ? NANO_BANANA_2_PRODUCTION_THINKING : undefined,
    },
  };
}

export type SceneStackLayerModelRoute = {
  layerId: SceneStackLayerId;
  generationMode: ReturnType<typeof import('../../scene-stack/isolated-layer-contract.js').resolveLayerGenerationMode>;
  provider: 'fal';
  providerModel: string;
  providerEndpoint: string;
  textToImageOnly: boolean;
  referenceStrategy: import('../../scene-stack/layer-model-routing.js').SceneStackReferenceStrategy;
  requestedAlpha: boolean;
  promptBuilderId: string;
  allowBackgroundExtraction: boolean;
  routeId: string;
  assetClass: import('./types.js').ModelAssetClass;
  brandGroundingCapable: boolean;
  resolutionTruth: ResolvedModelRoute['resolutionTruth'];
};

export function resolveSceneStackLayerModelRouteFromRegistry(
  layerId: SceneStackLayerId,
  options?: {
    organizationId?: string | null;
    brandGroundingRequired?: boolean;
    isolationAttempt?: number;
  }
): SceneStackLayerModelRoute {
  const contract = getIsolatedLayerContract(layerId);
  const generationMode = contract.generationMode;
  const assetClass = layerIdToAssetClass(layerId);
  const brandGrounding = options?.brandGroundingRequired === true;

  const resolved = resolveModelRoute({
    organizationId: options?.organizationId,
    assetClass,
    brandGroundingRequired: brandGrounding,
    isolationAttempt: options?.isolationAttempt ?? 0,
    surface: 'scene-stack',
  });

  let referenceStrategy: SceneStackLayerModelRoute['referenceStrategy'];
  if (layerId === 'environment-shell') {
    referenceStrategy = 'marble-genesis-anchor';
  } else if (resolved.referencePolicy === 'brand-material-references-only') {
    referenceStrategy = brandGrounding ? 'placement-metadata-only' : 'placement-metadata-only';
  } else {
    referenceStrategy = 'placement-metadata-only';
  }

  const promptBuilderId =
    layerId === 'signature-landmark'
      ? 'signature-landmark-isolated-prompt.v3'
      : layerId === 'furniture-objects'
        ? 'furniture-objects-isolated-prompt.v3'
        : layerId === 'environment-shell'
          ? 'environment-shell-prompt.v1'
          : 'blend-overlay-prompt.v1';

  return {
    layerId,
    generationMode,
    provider: 'fal',
    providerModel:
      layerId === 'environment-shell' ? SCENE_STACK_SHELL_FAL_MODEL : resolved.providerModel,
    providerEndpoint:
      layerId === 'environment-shell' ? SCENE_STACK_SHELL_FAL_MODEL : resolved.providerEndpoint,
    textToImageOnly: layerId === 'environment-shell' ? false : resolved.textToImageOnly,
    referenceStrategy,
    requestedAlpha: contract.expectedAlpha,
    promptBuilderId,
    allowBackgroundExtraction: layerId !== 'environment-shell',
    routeId: layerId === 'environment-shell' ? 'nano-banana-pro-edit-shell' : resolved.routeId,
    assetClass,
    brandGroundingCapable: resolved.supportsBrandAssetGuidance,
    resolutionTruth: resolved.resolutionTruth,
  };
}

export function listModelRegistryRoutes(): typeof MODEL_REGISTRY_ROUTES {
  return [...MODEL_REGISTRY_ROUTES];
}

export function rollbackIsolatedRouteTo(routeId: string): ResolvedModelRoute | null {
  const route = getModelRouteById(routeId);
  if (!route) return null;
  return resolveModelRoute({ assetClass: route.assetClass, brandGroundingRequired: false });
}

export { SCENE_STACK_ISOLATED_OBJECT_FAL_MODEL, SCENE_STACK_SHELL_FAL_MODEL };
