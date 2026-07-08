import type { SceneStackLayerId } from './types';
import { getSceneStackLayerRecord } from './store';

/** Layer IDs that must anchor to the approved environment shell (never regenerate from marble alone). */
const ANCHOR_LAYER_ID: SceneStackLayerId = 'environment-shell';

/**
 * Blend-mode layers composited in CSS — FAL must output isolated effect passes, not full scenes.
 */
export const SCENE_STACK_BLEND_COMPOSITE_LAYERS: ReadonlySet<SceneStackLayerId> = new Set([
  'lighting-systems',
  'atmospheric-systems',
  'surface-materials',
  'ambient-motion',
  'founder-personalization',
]);

/**
 * Placement reference for FAL — NOT a cumulative composite of all prior layers.
 * Returns shell URL only. Use enforceFalReferenceLaw() before every FAL call.
 */
export function getLockedReferenceUrlsForLayer(
  departmentId: string,
  projectId: string,
  stationId: string,
  targetLayerId: SceneStackLayerId,
  _layerPrompts: Partial<Record<SceneStackLayerId, unknown>>
): string[] {
  if (targetLayerId === ANCHOR_LAYER_ID) return [];

  const shell = getSceneStackLayerRecord(departmentId, projectId, stationId, ANCHOR_LAYER_ID);
  return shell?.publicUrl ? [shell.publicUrl] : [];
}

export function layerRequiresShellAnchor(layerId: SceneStackLayerId): boolean {
  return layerId !== ANCHOR_LAYER_ID;
}

export function isBlendCompositeLayer(layerId: SceneStackLayerId): boolean {
  return SCENE_STACK_BLEND_COMPOSITE_LAYERS.has(layerId);
}
