import { readStudioOsJson, writeStudioOsJson } from '../../utils/studioOsBrowserStorage';
import type { StudioAssetRegistryEntry } from './types';

const STORAGE_KEY = 'studioOsAssetRegistry_v1';

type Store = { entries: StudioAssetRegistryEntry[] };

const EMPTY: Store = { entries: [] };

function uid(): string {
  return `reg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function readStore(): Store {
  return readStudioOsJson(STORAGE_KEY, () => EMPTY);
}

function writeStore(store: Store): void {
  writeStudioOsJson(STORAGE_KEY, store);
}

export function registerStudioAsset(
  input: Omit<StudioAssetRegistryEntry, 'id' | 'registeredAt' | 'status'> & { status?: StudioAssetRegistryEntry['status'] }
): StudioAssetRegistryEntry {
  const entry: StudioAssetRegistryEntry = {
    id: uid(),
    registeredAt: new Date().toISOString(),
    status: input.status ?? 'validated',
    ...input,
  };
  const store = readStore();
  const filtered = store.entries.filter(
    (e) =>
      !(
        e.departmentId === entry.departmentId &&
        e.projectId === entry.projectId &&
        e.assetId === entry.assetId
      )
  );
  writeStore({ entries: [entry, ...filtered] });
  return entry;
}

export function getRegistryAsset(
  departmentId: string,
  projectId: string,
  assetId: string
): StudioAssetRegistryEntry | null {
  return (
    readStore().entries.find(
      (e) => e.departmentId === departmentId && e.projectId === projectId && e.assetId === assetId
    ) ?? null
  );
}

export function listRegistryAssets(departmentId: string, projectId: string): StudioAssetRegistryEntry[] {
  return readStore().entries.filter((e) => e.departmentId === departmentId && e.projectId === projectId);
}
