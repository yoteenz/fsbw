import type { IsolatedLayerGenerationMode } from './isolated-layer-contract';
import { getIsolatedLayerContract, isIsolatedObjectLayer, resolveLayerGenerationMode } from './isolated-layer-contract';
import { SCENE_STACK_LAYER_ORDER, type SceneStackLayerId } from './types';

export const SCENE_STACK_MODEL_ROUTING_VERSION = 'layer-model-routing.v1';

/** Environment shell — full-scene img2img with marble or shell anchor. */
export const SCENE_STACK_SHELL_FAL_MODEL = 'fal-ai/nano-banana-pro/edit' as const;

/** Isolated object layers — text-to-image only; no img2img room repaint. */
export const SCENE_STACK_ISOLATED_OBJECT_FAL_MODEL = 'fal-ai/nano-banana-pro' as const;

export type SceneStackReferenceStrategy =
  | 'none'
  | 'marble-genesis-anchor'
  | 'shell-placement-img2img'
  | 'placement-metadata-only';

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
  isolationAttempt = 0
): SceneStackLayerModelRoute {
  const contract = getIsolatedLayerContract(layerId);
  const generationMode = resolveLayerGenerationMode(layerId);

  if (layerId === 'environment-shell') {
    return {
      layerId,
      generationMode,
      provider: 'fal',
      providerModel: SCENE_STACK_SHELL_FAL_MODEL,
      providerEndpoint: SCENE_STACK_SHELL_FAL_MODEL,
      textToImageOnly: false,
      referenceStrategy: 'marble-genesis-anchor',
      requestedAlpha: false,
      promptBuilderId: 'environment-shell-prompt.v1',
      allowBackgroundExtraction: false,
    };
  }

  if (isIsolatedObjectLayer(layerId)) {
    return {
      layerId,
      generationMode,
      provider: 'fal',
      providerModel: SCENE_STACK_ISOLATED_OBJECT_FAL_MODEL,
      providerEndpoint: SCENE_STACK_ISOLATED_OBJECT_FAL_MODEL,
      textToImageOnly: true,
      referenceStrategy: isolationAttempt > 0 ? 'placement-metadata-only' : 'placement-metadata-only',
      requestedAlpha: contract.expectedAlpha,
      promptBuilderId:
        layerId === 'signature-landmark'
          ? 'signature-landmark-isolated-prompt.v2'
          : 'furniture-objects-isolated-prompt.v2',
      allowBackgroundExtraction: false,
    };
  }

  return {
    layerId,
    generationMode,
    provider: 'fal',
    providerModel: SCENE_STACK_ISOLATED_OBJECT_FAL_MODEL,
    providerEndpoint: SCENE_STACK_ISOLATED_OBJECT_FAL_MODEL,
    textToImageOnly: true,
    referenceStrategy: 'placement-metadata-only',
    requestedAlpha: contract.expectedAlpha,
    promptBuilderId: 'blend-overlay-prompt.v1',
    allowBackgroundExtraction: false,
  };
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
      scenario: 'C: strict prompt + nano-banana-pro/edit + metadata only',
      model: SCENE_STACK_SHELL_FAL_MODEL,
      referenceStrategy: 'placement-metadata-only',
      expectedTendency: 'full-scene',
      classification: 'MODEL-DOMINANT',
    },
    {
      scenario: 'D: strict prompt + nano-banana-pro t2i + metadata only',
      model: SCENE_STACK_ISOLATED_OBJECT_FAL_MODEL,
      referenceStrategy: 'placement-metadata-only',
      expectedTendency: 'isolated-capable',
      classification: 'MODEL-DOMINANT',
    },
    {
      scenario: 'E: strict prompt + nano-banana-pro t2i + masked guide',
      model: SCENE_STACK_ISOLATED_OBJECT_FAL_MODEL,
      referenceStrategy: 'placement-metadata-only',
      expectedTendency: 'isolated-capable',
      classification: 'COMBINED',
    },
  ];
}
