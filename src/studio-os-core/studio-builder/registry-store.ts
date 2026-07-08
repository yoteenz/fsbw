import { readStudioOsJson, writeStudioOsJson } from '../../utils/studioOsBrowserStorage';
import type { StudioAssetRegistryEntry } from './types';

/** Distinct from Milestone 140 Asset Registry™ (`studioOsAssetRegistry_v1` profiles store). */
export const STUDIO_BUILDER_REGISTRY_STORAGE_KEY = 'studioOsStudioBuilderRegistry_v1';
const LEGACY_STORAGE_KEY = 'studioOsAssetRegistry_v1';

type Store = { entries: StudioAssetRegistryEntry[] };

const EMPTY: Store = { entries: [] };

function uid(): string {
  return `reg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function isBuilderRegistryStore(value: unknown): value is Store {
  return (
    Boolean(value) &&
    typeof value === 'object' &&
    Array.isArray((value as Store).entries)
  );
}

function readStore(): Store {
  const store = readStudioOsJson(STUDIO_BUILDER_REGISTRY_STORAGE_KEY, () => EMPTY);
  if (store.entries.length > 0) return store;

  const legacyRaw = readStudioOsJson(LEGACY_STORAGE_KEY, () => EMPTY);
  if (isBuilderRegistryStore(legacyRaw) && legacyRaw.entries.length > 0) {
    writeStore(legacyRaw);
    return legacyRaw;
  }

  return store;
}

function writeStore(store: Store): void {
  writeStudioOsJson(STUDIO_BUILDER_REGISTRY_STORAGE_KEY, store);
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

/** Studio Warehouse™ — all pipeline-registered assets across departments. */
export function listAllRegistryAssets(): StudioAssetRegistryEntry[] {
  return readStore().entries;
}
