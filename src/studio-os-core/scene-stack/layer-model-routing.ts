import type { IsolatedLayerGenerationMode } from './isolated-layer-contract';
import { isIsolatedObjectLayer, resolveLayerGenerationMode } from './isolated-layer-contract';
import { SCENE_STACK_LAYER_ORDER, type SceneStackLayerId } from './types';
import {
  MODEL_REGISTRY_POLICY_VERSION,
  resolveSceneStackLayerModelRouteFromRegistry,
  SCENE_STACK_ISOLATED_OBJECT_FAL_MODEL,
  SCENE_STACK_SHELL_FAL_MODEL,
} from '../creative-production/model-registry';

export const SCENE_STACK_MODEL_ROUTING_VERSION = MODEL_REGISTRY_POLICY_VERSION;

export { SCENE_STACK_SHELL_FAL_MODEL, SCENE_STACK_ISOLATED_OBJECT_FAL_MODEL };

export type SceneStackReferenceStrategy =
  | 'none'
  | 'marble-genesis-anchor'
  | 'shell-placement-img2img'
  | 'placement-metadata-only'
  | 'brand-material-references-only';

export type SceneStackLayerModelRoute = {
  layerId: SceneStackLayerId;
  generationMode: IsolatedLayerGenerationMode;
  provider: 'fal';
  providerModel: string;
  providerEndpoint: string;
  textToImageOnly: boolean;
  referenceStrategy: SceneStackReferenceStrategy;
  requestedAlpha: boolean;
  promptBuilderId: string;
  allowBackgroundExtraction: boolean;
  routeId: string;
  brandGroundingCapable: boolean;
  resolutionTruth: {
    requestedResolution: string;
    providerNativeResolution: string;
    supportsNative4K: boolean;
    thinkingLevel?: string;
  };
};

const FORBIDDEN_ISOLATED_MODES: IsolatedLayerGenerationMode[] = [
  'full-scene-shell',
];

export function resolveLayerIdFromProductionGroupId(productionGroupId: string): SceneStackLayerId | null {
  if (!productionGroupId.startsWith('scene-stack-')) return null;
  for (const layerId of [...SCENE_STACK_LAYER_ORDER].reverse()) {
    if (productionGroupId.endsWith(`-${layerId}`)) return layerId;
  }
  return null;
}

export function resolveSceneStackLayerModelRoute(
  layerId: SceneStackLayerId,
  isolationAttempt = 0,
  options?: {
    organizationId?: string | null;
    brandGroundingRequired?: boolean;
  }
): SceneStackLayerModelRoute {
  return resolveSceneStackLayerModelRouteFromRegistry(layerId, {
    organizationId: options?.organizationId,
    brandGroundingRequired: options?.brandGroundingRequired,
    isolationAttempt,
  });
}

export function assertLayerGenerationModeAllowed(
  layerId: SceneStackLayerId,
  generationMode: IsolatedLayerGenerationMode
): { ok: true } | { ok: false; code: string; reason: string } {
  const expected = resolveLayerGenerationMode(layerId);

  if (isIsolatedObjectLayer(layerId)) {
    if (FORBIDDEN_ISOLATED_MODES.includes(generationMode)) {
      return {
        ok: false,
        code: 'ISOLATED_MODE_VIOLATION',
        reason: `Layer ${layerId} cannot use generationMode ${generationMode} — requires isolated-single-object or isolated-object-group.`,
      };
    }
    if (
      layerId === 'signature-landmark' &&
      generationMode !== 'isolated-single-object'
    ) {
      return {
        ok: false,
        code: 'LANDMARK_MODE_VIOLATION',
        reason: 'signature-landmark must use isolated-single-object generation mode.',
      };
    }
    if (
      layerId === 'furniture-objects' &&
      generationMode !== 'isolated-object-group'
    ) {
      return {
        ok: false,
        code: 'FURNITURE_MODE_VIOLATION',
        reason: 'furniture-objects must use isolated-object-group generation mode.',
      };
    }
  }

  if (layerId === 'environment-shell' && generationMode !== 'full-scene-shell') {
    return {
      ok: false,
      code: 'SHELL_MODE_VIOLATION',
      reason: 'environment-shell must use full-scene-shell generation mode.',
    };
  }

  if (generationMode !== expected && isIsolatedObjectLayer(layerId)) {
    return {
      ok: false,
      code: 'MODE_MISMATCH',
      reason: `Expected ${expected} for ${layerId}, received ${generationMode}.`,
    };
  }

  return { ok: true };
}

export function compareModelSuitabilityMatrix(): Array<{
  scenario: string;
  model: string;
  referenceStrategy: SceneStackReferenceStrategy;
  expectedTendency: 'full-scene' | 'isolated-capable';
  classification: 'PROMPT-DOMINANT' | 'REFERENCE-DOMINANT' | 'MODEL-DOMINANT' | 'COMBINED';
}> {
  return [
    {
      scenario: 'A: legacy prompt + nano-banana-pro/edit + full shell ref',
      model: SCENE_STACK_SHELL_FAL_MODEL,
      referenceStrategy: 'shell-placement-img2img',
      expectedTendency: 'full-scene',
      classification: 'COMBINED',
    },
    {
      scenario: 'B: strict prompt + nano-banana-pro/edit + full shell ref',
      model: SCENE_STACK_SHELL_FAL_MODEL,
      referenceStrategy: 'shell-placement-img2img',
      expectedTendency: 'full-scene',
      classification: 'REFERENCE-DOMINANT',
    },
    {
      scenario: 'C: strict prompt + nano-banana-2 t2i + brand material refs',
      model: SCENE_STACK_ISOLATED_OBJECT_FAL_MODEL,
      referenceStrategy: 'brand-material-references-only',
      expectedTendency: 'isolated-capable',
      classification: 'MODEL-DOMINANT',
    },
    {
      scenario: 'D: strict prompt + nano-banana-2/edit + material refs only',
      model: 'fal-ai/nano-banana-2/edit',
      referenceStrategy: 'brand-material-references-only',
      expectedTendency: 'isolated-capable',
      classification: 'COMBINED',
    },
    {
      scenario: 'E: environment shell — nano-banana-pro/edit unchanged',
      model: SCENE_STACK_SHELL_FAL_MODEL,
      referenceStrategy: 'marble-genesis-anchor',
      expectedTendency: 'full-scene',
      classification: 'REFERENCE-DOMINANT',
    },
  ];
}
