import { readStudioOsJson, writeStudioOsJson } from '../../utils/studioOsBrowserStorage';
import type { SceneGenesisSceneRecord } from './types';

const STORAGE_KEY = 'studioOsSceneGenesis_v1';

type Store = { scenes: SceneGenesisSceneRecord[] };

const EMPTY: Store = { scenes: [] };

function uid(): string {
  return `sg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function readStore(): Store {
  return readStudioOsJson(STORAGE_KEY, () => EMPTY);
}

function writeStore(store: Store): void {
  writeStudioOsJson(STORAGE_KEY, store);
}

export function getSceneGenesisRecord(
  departmentId: string,
  projectId: string,
  stationId: string
): SceneGenesisSceneRecord | null {
  return (
    readStore().scenes.find(
      (s) =>
        s.departmentId === departmentId &&
        s.projectId === projectId &&
        s.stationId === stationId
    ) ?? null
  );
}

export function listSceneGenesisRecords(
  departmentId: string,
  projectId: string
): SceneGenesisSceneRecord[] {
  return readStore().scenes.filter(
    (s) => s.departmentId === departmentId && s.projectId === projectId
  );
}

export function saveSceneGenesisRecord(
  input: Omit<SceneGenesisSceneRecord, 'id' | 'generatedAt'> & { generatedAt?: string }
): SceneGenesisSceneRecord {
  const record: SceneGenesisSceneRecord = {
    id: uid(),
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    ...input,
  };
  const store = readStore();
  const filtered = store.scenes.filter(
    (s) =>
      !(
        s.departmentId === record.departmentId &&
        s.projectId === record.projectId &&
        s.stationId === record.stationId
      )
  );
  writeStore({ scenes: [record, ...filtered] });
  return record;
}

export function clearSceneGenesisRecords(departmentId: string, projectId: string): void {
  const store = readStore();
  writeStore({
    scenes: store.scenes.filter(
      (s) => !(s.departmentId === departmentId && s.projectId === projectId)
    ),
  });
}
