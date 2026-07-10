import { readStudioOsJson, writeStudioOsJson } from '../../utils/studioOsBrowserStorage';
import { getEphemeralLayerRecord } from './ephemeral-validation-registry';
import { getValidationPreviewSession, isExperienceLabValidationRender } from './validation-render';
import type { SceneStackLayerId, SceneStackLayerRecord } from './types';

const STORAGE_KEY = 'studioOsSceneStack_v1';

type Store = { layers: SceneStackLayerRecord[] };

const EMPTY: Store = { layers: [] };

function uid(): string {
  return `ssl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function layerScopeKey(rec: Pick<SceneStackLayerRecord, 'departmentId' | 'projectId' | 'stationId' | 'layerId'>): string {
  return `${rec.departmentId}:${rec.projectId}:${rec.stationId}:${rec.layerId}`;
}

/** Keep latest version per layer so localStorage stays within Studio OS quota after refresh. */
function compactLayers(layers: SceneStackLayerRecord[]): SceneStackLayerRecord[] {
  const map = new Map<string, SceneStackLayerRecord>();
  for (const rec of layers) {
    const key = layerScopeKey(rec);
    const existing = map.get(key);
    if (!existing || rec.version > existing.version) {
      map.set(key, rec);
    }
  }
  return Array.from(map.values());
}

function readStore(): Store {
  const store = readStudioOsJson(STORAGE_KEY, () => EMPTY);
  return { layers: compactLayers(store.layers) };
}

/** Drop metadata that is not needed to restore the composite on refresh. */
function slimLayerRecord(rec: SceneStackLayerRecord): SceneStackLayerRecord {
  return {
    id: rec.id,
    departmentId: rec.departmentId,
    projectId: rec.projectId,
    stationId: rec.stationId,
    layerId: rec.layerId,
    version: rec.version,
    status: rec.status,
    publicUrl: rec.publicUrl,
    promptVersion: rec.promptVersion,
    productionGroupId: rec.productionGroupId,
    heroAssetId: rec.heroAssetId,
    blueprintId: rec.blueprintId,
    assemblyLawVersion: rec.assemblyLawVersion,
    qualityStatus: rec.qualityStatus,
    qualityIssues: rec.qualityIssues,
  };
}

function writeStore(store: Store): void {
  writeStudioOsJson(STORAGE_KEY, { layers: compactLayers(store.layers).map(slimLayerRecord) });
}

export function getSceneStackLayerRecord(
  departmentId: string,
  projectId: string,
  stationId: string,
  layerId: SceneStackLayerId
): SceneStackLayerRecord | null {
  if (isExperienceLabValidationRender()) {
    const ephemeral = getEphemeralLayerRecord(
      getValidationPreviewSession(),
      departmentId,
      projectId,
      stationId,
      layerId
    );
    if (ephemeral) return ephemeral;
  }

  const records = readStore().layers.filter(
    (l) =>
      l.departmentId === departmentId &&
      l.projectId === projectId &&
      l.stationId === stationId &&
      l.layerId === layerId
  );
  if (records.length === 0) return null;
  return records.reduce((best, cur) => (cur.version > best.version ? cur : best));
}

export function listSceneStackLayersForStation(
  departmentId: string,
  projectId: string,
  stationId: string
): SceneStackLayerRecord[] {
  const map = new Map<string, SceneStackLayerRecord>();
  for (const rec of readStore().layers) {
    if (rec.departmentId !== departmentId || rec.projectId !== projectId || rec.stationId !== stationId) {
      continue;
    }
    const key = `${rec.layerId}`;
    const existing = map.get(key);
    if (!existing || rec.version > existing.version) {
      map.set(key, rec);
    }
  }
  return Array.from(map.values());
}

export function saveSceneStackLayerRecord(
  input: Omit<SceneStackLayerRecord, 'id'> & { id?: string }
): SceneStackLayerRecord {
  const record: SceneStackLayerRecord = {
    id: input.id ?? uid(),
    ...input,
  };
  const store = readStore();
  writeStore({ layers: [record, ...store.layers] });
  return record;
}

export function approveSceneStackLayer(
  departmentId: string,
  projectId: string,
  stationId: string,
  layerId: SceneStackLayerId
): SceneStackLayerRecord | null {
  const current = getSceneStackLayerRecord(departmentId, projectId, stationId, layerId);
  if (!current || !current.publicUrl) return null;
  return saveSceneStackLayerRecord({
    ...current,
    status: 'approved',
    approvedAt: new Date().toISOString(),
  });
}

export function nextSceneStackLayerVersion(
  departmentId: string,
  projectId: string,
  stationId: string,
  layerId: SceneStackLayerId
): number {
  const current = getSceneStackLayerRecord(departmentId, projectId, stationId, layerId);
  return (current?.version ?? 0) + 1;
}

/** Remove layer records except those in keepLayerIds — used by Clean Regeneration Mode™. */
export function purgeSceneStackLayerRecords(
  departmentId: string,
  projectId: string,
  stationId: string,
  keepLayerIds: SceneStackLayerId[]
): number {
  const keep = new Set(keepLayerIds);
  const store = readStore();
  const before = store.layers.length;
  const next = store.layers.filter(
    (rec) =>
      !(
        rec.departmentId === departmentId &&
        rec.projectId === projectId &&
        rec.stationId === stationId &&
        !keep.has(rec.layerId)
      )
  );
  writeStore({ layers: next });
  return before - next.length;
}
