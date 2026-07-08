import { getLayerDefinition, listComposeLayers } from './layer-catalog';
import { getSceneStackLayerRecord } from './store';
import type {
  SceneStackCompositeStatus,
  SceneStackLayerId,
  SceneStackLayerView,
  SceneStackLayerStatus,
} from './types';
import { SCENE_STACK_REQUIRED_LAYERS } from './types';

export function resolveStationLayerViews(
  departmentId: string,
  projectId: string,
  stationId: string,
  generatingLayerIds: Set<string> = new Set(),
  failedLayerIds: Set<string> = new Set()
): SceneStackLayerView[] {
  return listComposeLayers().map((def) => {
    const rec = getSceneStackLayerRecord(departmentId, projectId, stationId, def.id);
    let status: SceneStackLayerStatus = 'idle';
    if (generatingLayerIds.has(def.id)) status = 'generating';
    else if (failedLayerIds.has(def.id)) status = 'failed';
    else if (rec?.status === 'approved' && rec.publicUrl) status = 'approved';
    else if (rec?.publicUrl && rec.status !== 'discarded') status = 'approved';

    return {
      layerId: def.id,
      definition: getLayerDefinition(def.id),
      status,
      publicUrl: rec?.publicUrl ?? null,
      version: rec?.version ?? 0,
      qualityStatus: rec?.qualityStatus,
      qualityIssues: rec?.qualityIssues,
    };
  });
}

export function resolveStackCompositeStatus(
  layers: SceneStackLayerView[]
): SceneStackCompositeStatus {
  const generatable = layers.filter((l) => l.definition.generatable);
  if (generatable.some((l) => l.status === 'generating')) return 'building';
  if (generatable.some((l) => l.status === 'failed')) return 'failed';

  const approved = generatable.filter((l) => l.status === 'approved' && l.publicUrl);
  const requiredApproved = SCENE_STACK_REQUIRED_LAYERS.every((id) =>
    approved.some((l) => l.layerId === id)
  );

  if (requiredApproved && approved.length === generatable.length) return 'ready';
  if (approved.length > 0) return 'partial';
  return 'idle';
}

export function listGeneratableLayerIdsForStation(
  _departmentId: string,
  _stationId: string,
  layerPrompts: Partial<Record<SceneStackLayerId, unknown>>
): SceneStackLayerId[] {
  return listComposeLayers()
    .map((l) => l.id)
    .filter((id) => Boolean(layerPrompts[id]));
}
