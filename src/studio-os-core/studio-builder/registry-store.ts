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

function isValidRegistryEntry(entry: unknown): entry is StudioAssetRegistryEntry {
  if (!entry || typeof entry !== 'object') return false;
  const e = entry as StudioAssetRegistryEntry;
  return (
    typeof e.id === 'string' &&
    typeof e.departmentId === 'string' &&
    typeof e.projectId === 'string' &&
    typeof e.assetId === 'string' &&
    typeof e.registeredAt === 'string'
  );
}

function readStore(): Store {
  const store = readStudioOsJson(STUDIO_BUILDER_REGISTRY_STORAGE_KEY, () => EMPTY);
  const entries = store.entries.filter(isValidRegistryEntry);
  if (entries.length > 0) return { entries };

  const legacyRaw = readStudioOsJson(LEGACY_STORAGE_KEY, () => EMPTY);
  if (isBuilderRegistryStore(legacyRaw) && legacyRaw.entries.length > 0) {
    const legacyEntries = legacyRaw.entries.filter(isValidRegistryEntry);
    if (legacyEntries.length > 0) {
      writeStore({ entries: legacyEntries });
      return { entries: legacyEntries };
    }
  }

  return { entries: [] };
}

function writeStore(store: Store): void {
  writeStudioOsJson(STUDIO_BUILDER_REGISTRY_STORAGE_KEY, store);
}

export function registerStudioAsset(
  input: Omit<StudioAssetRegistryEntry, 'id' | 'registeredAt' | 'status'> & { status?: StudioAssetRegistryEntry['status'] }
): StudioAssetRegistryEntry {
  if (typeof console !== 'undefined') {
    console.warn(
      '[Asset Registry Policy] registerStudioAsset writes to deprecated local cache. Use Supabase Asset Registry via Creative Production Gateway.'
    );
  }
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
  schedulePipelineAssetSyncDeferred(entry);
  return entry;
}

/** Merge remote or updated entry without creating duplicate assetId rows. */
export function upsertLocalRegistryEntry(
  input: Omit<StudioAssetRegistryEntry, 'id' | 'registeredAt' | 'status'> & {
    id?: string;
    registeredAt?: string;
    status?: StudioAssetRegistryEntry['status'];
  }
): StudioAssetRegistryEntry {
  const store = readStore();
  const existing = store.entries.find(
    (e) =>
      e.departmentId === input.departmentId &&
      e.projectId === input.projectId &&
      e.assetId === input.assetId
  );

  const entry: StudioAssetRegistryEntry = {
    id: existing?.id ?? input.id ?? uid(),
    registeredAt: existing?.registeredAt ?? input.registeredAt ?? new Date().toISOString(),
    status: input.status ?? existing?.status ?? 'validated',
    departmentId: input.departmentId,
    projectId: input.projectId,
    packageId: input.packageId,
    assetId: input.assetId,
    productionGroupId: input.productionGroupId,
    category: input.category,
    publicUrl: input.publicUrl,
    storagePath: input.storagePath,
    model: input.model,
    promptVersion: input.promptVersion,
    stationId: input.stationId ?? existing?.stationId,
    layerId: input.layerId ?? existing?.layerId,
    supabaseAssetId: input.supabaseAssetId ?? existing?.supabaseAssetId,
  };

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

function schedulePipelineAssetSyncDeferred(entry: StudioAssetRegistryEntry): void {
  if (typeof window === 'undefined' || !entry.publicUrl?.startsWith('http')) return;
  void import('../../services/studio/assetRegistry/pipelineSync')
    .then((m) => m.schedulePipelineAssetSync(entry))
    .catch(() => {
      /* offline / unsigned-in — local registry still works */
    });
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
