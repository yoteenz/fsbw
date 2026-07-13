import type { SceneStackLayerId } from '../../scene-stack/types';
import { getIsolatedLayerContract } from '../../scene-stack/isolated-layer-contract';
import type { ModelAssetClass } from './types';
import type { ArtifactIntent } from '../artifact-intent';
import type { ResolveModelRouteInput, ResolvedModelRoute } from './types';
import {
  getModelRouteById,
  MODEL_REGISTRY_ROUTES,
  SCENE_STACK_ISOLATED_OBJECT_FAL_MODEL,
  SCENE_STACK_SHELL_FAL_MODEL,
} from './routes';
import { NANO_BANANA_2_EDIT_ENDPOINT, NANO_BANANA_2_T2I_ENDPOINT } from './nano-banana-2-schema';
import {
  resolveModelRoutingDecision,
  resolveModelRoutingFromLayerId,
} from '../model-routing-engine/model-routing-engine';

function assetClassToArtifactIntent(assetClass: ModelAssetClass): ArtifactIntent {
  switch (assetClass) {
    case 'founder-full-room-preview':
      return 'founder-full-room-preview';
    case 'environment-shell':
      return 'environment-shell';
    case 'signature-landmark':
      return 'landmark-asset';
    case 'furniture-objects':
      return 'object-group';
    case 'reception-structure':
      return 'reception-desk';
    case 'architectural-prop':
      return 'architecture-piece';
    case 'decorative-object':
      return 'decor-asset';
    case 'background-removal':
      return 'background-cleanup';
    case 'material-overlay':
      return 'material-map';
    case 'atmosphere-overlay':
      return 'transparent-overlay';
    case 'motion-overlay':
      return 'transparent-overlay';
    case 'reflection-overlay':
      return 'material-map';
    case 'image-upscale':
      return 'decor-asset';
    default:
      return 'decor-asset';
  }
}

export function layerIdToAssetClass(layerId: SceneStackLayerId): ModelAssetClass {
  return resolveModelRoutingFromLayerId(layerId).assetClass;
}

export function resolveModelRoute(input: ResolveModelRouteInput): ResolvedModelRoute {
  const artifactIntent = assetClassToArtifactIntent(input.assetClass);

  const decision = resolveModelRoutingDecision({
    artifactIntent,
    assetClass: input.assetClass,
    surface:
      input.surface === 'experience-lab'
        ? 'experience-lab'
        : input.surface === 'creative-studio'
          ? 'creative-direction-studio'
          : 'scene-stack',
    brandGroundingRequired: input.brandGroundingRequired,
    isolationAttempt: input.isolationAttempt,
    organizationId: input.organizationId,
  });

  const route = getModelRouteById(decision.routeId);
  if (!route) {
    throw new Error(`Route not found: ${decision.routeId}`);
  }

  return {
    ...route,
    providerModel: decision.providerModel,
    providerEndpoint: decision.providerEndpoint,
    textToImageOnly: decision.textToImageOnly,
    promptBuilderId: decision.promptBuilderId,
    allowBackgroundExtraction: decision.allowBackgroundExtraction,
    requestedAlpha: decision.requestedAlpha,
    resolutionTruth: decision.resolutionTruth,
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
  artifactIntent: import('../artifact-intent.js').ArtifactIntent;
  promptVersion: string;
  workerFamily: import('../model-routing-engine/types.js').GenerationWorkerFamily;
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
  const decision = resolveModelRoutingFromLayerId(layerId, {
    organizationId: options?.organizationId,
    brandGroundingRequired: options?.brandGroundingRequired,
    isolationAttempt: options?.isolationAttempt,
    surface: 'scene-stack',
  });

  let referenceStrategy: SceneStackLayerModelRoute['referenceStrategy'];
  if (decision.referenceStrategy === 'marble-genesis-anchor') {
    referenceStrategy = 'marble-genesis-anchor';
  } else if (decision.referenceStrategy === 'brand-material-references-only') {
    referenceStrategy = 'brand-material-references-only';
  } else {
    referenceStrategy = 'placement-metadata-only';
  }

  return {
    layerId,
    generationMode,
    provider: 'fal',
    providerModel: decision.providerModel,
    providerEndpoint: decision.providerEndpoint,
    textToImageOnly: decision.textToImageOnly,
    referenceStrategy,
    requestedAlpha: contract.expectedAlpha,
    promptBuilderId: decision.promptBuilderId,
    allowBackgroundExtraction: decision.allowBackgroundExtraction,
    routeId: decision.routeId,
    assetClass: decision.assetClass,
    brandGroundingCapable: decision.brandGroundingCapable,
    resolutionTruth: decision.resolutionTruth,
    artifactIntent: decision.artifactIntent,
    promptVersion: decision.promptVersion,
    workerFamily: decision.workerFamily,
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
export { NANO_BANANA_2_EDIT_ENDPOINT, NANO_BANANA_2_T2I_ENDPOINT };
