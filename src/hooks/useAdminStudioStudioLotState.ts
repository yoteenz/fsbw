import { useCallback, useMemo, useState } from 'react';
import {
  ADMIN_STUDIO_LOT_DEFAULTS,
  createBlankStudioLot,
  type StudioLotEntry,
  type StudioLotFieldKey,
  type StudioLotPromptVersion,
  type StudioLotStatus,
} from '../utils/adminStudioStudioLotDemo';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';

type StudioLotPatch = Partial<StudioLotEntry>;
type StudioLotPatchStore = Record<string, StudioLotPatch>;

const DEFAULT_IDS = new Set(ADMIN_STUDIO_LOT_DEFAULTS.map((s) => s.id));

function readPatches(): StudioLotPatchStore {
  return readStudioJson<StudioLotPatchStore>(ADMIN_STUDIO_STORAGE_KEYS.studioLot) ?? {};
}

function readCustomStudios(): StudioLotEntry[] {
  return readStudioJson<StudioLotEntry[]>(ADMIN_STUDIO_STORAGE_KEYS.studioLotCustom) ?? [];
}

function writePatches(store: StudioLotPatchStore): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.studioLot, store);
}

function writeCustomStudios(studios: StudioLotEntry[]): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.studioLotCustom, studios);
}

function mergeDefaults(patches: StudioLotPatchStore): StudioLotEntry[] {
  return ADMIN_STUDIO_LOT_DEFAULTS.map((d) => ({ ...d, ...(patches[d.id] ?? {}) }));
}

export function listStudioLotStudios(): StudioLotEntry[] {
  const patches = readPatches();
  const custom = readCustomStudios();
  const merged = mergeDefaults(patches);
  const customOnly = custom.filter((c) => !DEFAULT_IDS.has(c.id));
  return [...merged, ...customOnly];
}

export function getStudioLotById(studioId: string): StudioLotEntry | undefined {
  return listStudioLotStudios().find((s) => s.id === studioId);
}

export function exportStudioLotSnapshot() {
  return {
    studios: listStudioLotStudios(),
    source: 'studio-lot-local' as const,
  };
}

function patchStudio(studioId: string, patch: StudioLotPatch): void {
  if (DEFAULT_IDS.has(studioId)) {
    const store = readPatches();
    store[studioId] = { ...(store[studioId] ?? {}), ...patch };
    writePatches(store);
    return;
  }
  const custom = readCustomStudios();
  const idx = custom.findIndex((s) => s.id === studioId);
  if (idx >= 0) {
    custom[idx] = { ...custom[idx], ...patch };
    writeCustomStudios(custom);
  }
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

export function useAdminStudioLot(studioId?: string) {
  const [studios, setStudios] = useState(listStudioLotStudios);
  const [assetSearch, setAssetSearch] = useState('');

  const selectedStudio = useMemo(
    () => (studioId ? studios.find((s) => s.id === studioId) ?? null : null),
    [studios, studioId]
  );

  const updateField = useCallback((id: string, key: StudioLotFieldKey, value: string) => {
    setStudios((prev) => {
      const next = prev.map((s) => {
        if (s.id !== id) return s;
        const updated = { ...s, [key]: value, lastUpdated: new Date().toISOString().slice(0, 10) };
        patchStudio(id, { [key]: value, lastUpdated: updated.lastUpdated });
        return updated;
      });
      return next;
    });
  }, []);

  const setStatus = useCallback((id: string, status: StudioLotStatus) => {
    setStudios((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, status } : s));
      patchStudio(id, { status });
      return next;
    });
  }, []);

  const addCustomStudio = useCallback((name: string) => {
    const base = slugify(name) || `studio-${Date.now()}`;
    let id = base;
    let n = 1;
    const existing = new Set(listStudioLotStudios().map((s) => s.id));
    while (existing.has(id)) {
      id = `${base}-${n++}`;
    }
    const entry = createBlankStudioLot(id, name);
    const custom = readCustomStudios();
    custom.push(entry);
    writeCustomStudios(custom);
    setStudios(listStudioLotStudios());
    return id;
  }, []);

  const addPromptVersion = useCallback((id: string, label: string, body: string) => {
    setStudios((prev) => {
      const next = prev.map((s) => {
        if (s.id !== id) return s;
        const version: StudioLotPromptVersion = {
          id: `pv-${Date.now()}`,
          label,
          body,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        const promptVersions = [version, ...s.promptVersions];
        patchStudio(id, { promptVersions });
        return { ...s, promptVersions, lastUpdated: version.createdAt };
      });
      return next;
    });
  }, []);

  const filteredAssets = useMemo(() => {
    if (!selectedStudio) return [];
    const q = assetSearch.trim().toLowerCase();
    if (!q) return selectedStudio.assetCatalog;
    return selectedStudio.assetCatalog.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q) ||
        a.version.toLowerCase().includes(q)
    );
  }, [selectedStudio, assetSearch]);

  return {
    studios,
    selectedStudio,
    assetSearch,
    setAssetSearch,
    filteredAssets,
    updateField,
    setStatus,
    addCustomStudio,
    addPromptVersion,
  };
}
