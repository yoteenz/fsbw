import type { SceneStackLayerId } from './types';

/**
 * Scene Assembly™ Immutable Layer Law
 * ARTICLE-K19 — Scene Graph Before Scene Stack™
 *
 * Approved layers are immutable source assets. Scene Assembly may only
 * position, mask, align, depth-sort, color-match, shadow-match, and
 * optimize display at runtime via the World Compiler™ Scene Graph™.
 *
 * It may NEVER send prior approved generative layers back into an image model.
 * It may NEVER alpha-composite full rendered scenes as the compositing mechanism.
 */
export const SCENE_ASSEMBLY_IMMUTABILITY_LAW = {
  id: 'scene-assembly-immutability-law',
  version: 'v2',
  articleK19: 'Scene Graph Before Scene Stack™ — the Scene Graph™ is the source of truth.',
  summary:
    'Approved layers are immutable. World Compiler™ mounts components — never regenerates, repaints, or re-encodes prior layers via FAL.',
  allowedRuntimeOps: [
    'position',
    'mask',
    'align',
    'depth-sort',
    'color-match',
    'shadow-match',
    'calculate-lighting',
    'apply-atmosphere',
    'mount-component',
    'optimize-display',
  ] as const,
  forbiddenRuntimeOps: [
    'alpha-composite-full-scene',
    'stack-rendered-images',
    'css-blend-structural-layers',
    'inherit-prior-furniture-pixels',
  ] as const,
  forbiddenFalInputs: [
    'full-stack-composite',
    'prior-layer-composite',
    'approved-prior-generative-layer',
    'degraded-viewport-export',
    'multi-pass-flattened-image',
  ] as const,
  allowedFalInputs: [
    'environment-shell-reference',
    'placement-mask',
    'rough-guide-image',
    'depth-zone-map',
    'blueprint-metadata',
    'current-layer-prompt',
  ] as const,
} as const;

/** Layers that may be sent to FAL as placement reference (shell only). */
export const FAL_PLACEMENT_REFERENCE_LAYER: SceneStackLayerId = 'environment-shell';

/** Generative layers that must never be FAL reference inputs. */
export const FORBIDDEN_FAL_REFERENCE_LAYERS: ReadonlySet<SceneStackLayerId> = new Set([
  'signature-landmark',
  'furniture-objects',
  'lighting-systems',
  'atmospheric-systems',
  'surface-materials',
  'ambient-motion',
  'founder-personalization',
]);

export function isForbiddenFalReferenceLayer(layerId: SceneStackLayerId): boolean {
  return FORBIDDEN_FAL_REFERENCE_LAYERS.has(layerId);
}
