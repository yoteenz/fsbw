import { readStudioOsJson, writeStudioOsJson } from '../../utils/studioOsBrowserStorage';
import type { SceneStackLayerId, SceneStackLayerRecord } from './types';

const STORAGE_KEY = 'studioOsSceneStack_v1';

type Store = { layers: SceneStackLayerRecord[] };

const EMPTY: Store = { layers: [] };

function uid(): string {
  return `ssl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function readStore(): Store {
  return readStudioOsJson(STORAGE_KEY, () => EMPTY);
}

function writeStore(store: Store): void {
  writeStudioOsJson(STORAGE_KEY, store);
}

export function getSceneStackLayerRecord(
  departmentId: string,
  projectId: string,
  stationId: string,
  layerId: SceneStackLayerId
): SceneStackLayerRecord | null {
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
