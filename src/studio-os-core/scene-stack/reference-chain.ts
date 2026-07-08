import { listComposeLayers } from './layer-catalog';
import { getSceneStackLayerRecord } from './store';
import type { SceneStackLayerId } from './types';

/** Layer IDs that must anchor to the approved environment shell (never regenerate from marble alone). */
const ANCHOR_LAYER_ID: SceneStackLayerId = 'environment-shell';

/**
 * Collect approved layer image URLs in compose order for layers strictly before `targetLayerId`.
 * Used as FAL edit references so each new pass preserves locked architecture.
 */
export function getLockedReferenceUrlsForLayer(
  departmentId: string,
  projectId: string,
  stationId: string,
  targetLayerId: SceneStackLayerId,
  layerPrompts: Partial<Record<SceneStackLayerId, unknown>>
): string[] {
  const ordered = listComposeLayers()
    .map((l) => l.id)
    .filter((id) => Boolean(layerPrompts[id]));

  const targetIndex = ordered.indexOf(targetLayerId);
  if (targetIndex <= 0) return [];

  const urls: string[] = [];
  for (let i = 0; i < targetIndex; i++) {
    const layerId = ordered[i]!;
    const rec = getSceneStackLayerRecord(departmentId, projectId, stationId, layerId);
    if (rec?.publicUrl) urls.push(rec.publicUrl);
  }

  if (targetLayerId !== ANCHOR_LAYER_ID) {
    const shell = getSceneStackLayerRecord(departmentId, projectId, stationId, ANCHOR_LAYER_ID);
    if (shell?.publicUrl && !urls.includes(shell.publicUrl)) {
      return [shell.publicUrl, ...urls.filter((u) => u !== shell.publicUrl)];
    }
  }

  return urls;
}

export function layerRequiresShellAnchor(layerId: SceneStackLayerId): boolean {
  return layerId !== ANCHOR_LAYER_ID;
}
