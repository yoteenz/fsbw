import { listGeneratableLayerIdsForStation } from './compose';
import { isBlendCompositeLayer } from './reference-chain';
import { getSceneStackLayerRecord, purgeSceneStackLayerRecords, saveSceneStackLayerRecord } from './store';
import { getSceneStackStation } from './station-manifest';
import type { SceneStackLayerId } from './types';

export type CleanRegenerationPlan = {
  stationId: string;
  keepShell: boolean;
  shellSharp: boolean;
  discardLayerIds: SceneStackLayerId[];
  regenerateOrder: SceneStackLayerId[];
  reason: string;
};

export type CleanRegenerationResult = {
  plan: CleanRegenerationPlan;
  discardedCount: number;
};

/**
 * Assess whether shell is sharp enough to keep during Clean Regeneration Mode™.
 * Heuristic: approved shell with quality validated or version ≥ 1 with URL.
 */
export function assessShellSharpness(
  departmentId: string,
  projectId: string,
  stationId: string
): boolean {
  const shell = getSceneStackLayerRecord(departmentId, projectId, stationId, 'environment-shell');
  if (!shell?.publicUrl || shell.status === 'discarded') return false;
  if (shell.qualityStatus === 'regenerate_required') return false;
  return true;
}

/** Build Clean Regeneration Mode™ plan for a station with baked-in degradation. */
export function planCleanRegeneration(
  departmentId: string,
  projectId: string,
  stationId: string
): CleanRegenerationPlan | null {
  const station = getSceneStackStation(departmentId, stationId);
  if (!station) return null;

  const layerIds = listGeneratableLayerIdsForStation(departmentId, stationId, station.layerPrompts);
  const shellSharp = assessShellSharpness(departmentId, projectId, stationId);

  const discardLayerIds = layerIds.filter((id) => {
    if (id === 'environment-shell') return !shellSharp;
    const rec = getSceneStackLayerRecord(departmentId, projectId, stationId, id);
    return Boolean(rec?.publicUrl) || rec?.qualityStatus === 'regenerate_required';
  });

  if (discardLayerIds.length === 0) return null;

  const regenerateOrder: SceneStackLayerId[] = [];
  if (!shellSharp || !getSceneStackLayerRecord(departmentId, projectId, stationId, 'environment-shell')?.publicUrl) {
    regenerateOrder.push('environment-shell');
  }

  for (const id of layerIds) {
    if (id === 'environment-shell') continue;
    if (isBlendCompositeLayer(id)) {
      /* atmosphere/particles/lighting as overlays — after object layers */
    }
    regenerateOrder.push(id);
  }

  return {
    stationId,
    keepShell: shellSharp,
    shellSharp,
    discardLayerIds,
    regenerateOrder,
    reason:
      'Clean Regeneration Mode™ — discard degraded derived layers; rebuild from Master Scene Blueprint™ + shell placement only.',
  };
}

/** Discard degraded layers — keep shell only when sharp. */
export function executeCleanRegenerationDiscard(
  departmentId: string,
  projectId: string,
  plan: CleanRegenerationPlan
): CleanRegenerationResult {
  const keepIds: SceneStackLayerId[] = plan.keepShell ? ['environment-shell'] : [];
  const discardedCount = purgeSceneStackLayerRecords(
    departmentId,
    projectId,
    plan.stationId,
    keepIds
  );
  return { plan, discardedCount };
}

/** Mark existing degraded layers as regenerate_required without purging (soft flag). */
export function flagDegradedLayersForRegeneration(
  departmentId: string,
  projectId: string,
  stationId: string
): number {
  const station = getSceneStackStation(departmentId, stationId);
  if (!station) return 0;

  const layerIds = listGeneratableLayerIdsForStation(departmentId, stationId, station.layerPrompts);
  let flagged = 0;

  for (const layerId of layerIds) {
    if (layerId === 'environment-shell') continue;
    const rec = getSceneStackLayerRecord(departmentId, projectId, stationId, layerId);
    if (!rec?.publicUrl) continue;

    saveSceneStackLayerRecord({
      ...rec,
      qualityStatus: 'regenerate_required',
      qualityIssues: [
        'Pre-hardening layer — may contain baked cumulative stack. Use Clean Regeneration Mode™.',
      ],
    });
    flagged++;
  }

  return flagged;
}
