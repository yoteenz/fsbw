import type { SceneStackLayerId } from './types';

/**
 * Scene Assembly™ Immutable Layer Law
 *
 * Approved layers are immutable source assets. Scene Assembly may only
 * position, mask, align, composite, blend, depth-sort, color-match,
 * shadow-match, and optimize display at runtime.
 *
 * It may NEVER send prior approved generative layers back into an image model.
 */
export const SCENE_ASSEMBLY_IMMUTABILITY_LAW = {
  id: 'scene-assembly-immutability-law',
  version: 'v1',
  summary:
    'Approved layers are immutable. Never regenerate, repaint, reinterpret, or re-encode prior layers via FAL.',
  allowedRuntimeOps: [
    'position',
    'mask',
    'align',
    'composite',
    'blend',
    'depth-sort',
    'color-match',
    'shadow-match',
    'optimize-display',
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
