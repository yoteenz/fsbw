import { useCallback, useMemo, useState } from 'react';
import type {
  ContentPackAssetSelection,
  AssetDirectorStatus,
} from '../utils/adminStudioAssetDirectorDemo';
import {
  assemblePromptFromAssets,
  searchAssetDirectorIndex,
} from '../utils/adminStudioAssetDirectorDemo';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';

type AssetDirectorStore = {
  packAssetSelections?: Record<string, ContentPackAssetSelection>;
  statusOverrides?: Record<string, AssetDirectorStatus>;
};

function readStore(): AssetDirectorStore {
  return readStudioJson<AssetDirectorStore>(ADMIN_STUDIO_STORAGE_KEYS.assetDirector) ?? {};
}

function writeStore(store: AssetDirectorStore): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.assetDirector, store);
}

export function getContentPackAssetSelection(packId: string): ContentPackAssetSelection {
  const store = readStore();
  return store.packAssetSelections?.[packId] ?? {};
}

export function exportAssetDirectorSnapshot() {
  const store = readStore();
  return {
    packAssetSelections: store.packAssetSelections ?? {},
    statusOverrides: store.statusOverrides ?? {},
    source: 'asset-director-local' as const,
  };
}

export function useAdminStudioAssetDirector() {
  const [searchQuery, setSearchQuery] = useState('');
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const searchResults = useMemo(() => searchAssetDirectorIndex(searchQuery), [searchQuery]);

  return { searchQuery, setSearchQuery, searchResults, version, bump };
}

export function useAdminStudioContentPackAssets(packId: string | undefined) {
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const selection = useMemo(() => {
    void version;
    if (!packId) return {};
    return getContentPackAssetSelection(packId);
  }, [packId, version]);

  const assembledPrompt = useMemo(() => assemblePromptFromAssets(selection), [selection]);

  const updateSelection = useCallback(
    (patch: Partial<ContentPackAssetSelection>) => {
      if (!packId) return;
      const store = readStore();
      const current = store.packAssetSelections?.[packId] ?? {};
      const next: ContentPackAssetSelection = { ...current, ...patch };
      if (patch.materialIds === undefined && current.materialIds) next.materialIds = current.materialIds;
      if (patch.propIds === undefined && current.propIds) next.propIds = current.propIds;
      writeStore({
        ...store,
        packAssetSelections: { ...(store.packAssetSelections ?? {}), [packId]: next },
      });
      bump();
    },
    [packId, bump]
  );

  const toggleMaterialId = useCallback(
    (materialId: string) => {
      if (!packId) return;
      const store = readStore();
      const current = store.packAssetSelections?.[packId] ?? {};
      const ids = current.materialIds ?? [];
      const next = ids.includes(materialId) ? ids.filter((id) => id !== materialId) : [...ids, materialId];
      writeStore({
        ...store,
        packAssetSelections: { ...(store.packAssetSelections ?? {}), [packId]: { ...current, materialIds: next } },
      });
      bump();
    },
    [packId, bump]
  );

  const togglePropId = useCallback(
    (propId: string) => {
      if (!packId) return;
      const store = readStore();
      const current = store.packAssetSelections?.[packId] ?? {};
      const ids = current.propIds ?? [];
      const next = ids.includes(propId) ? ids.filter((id) => id !== propId) : [...ids, propId];
      writeStore({
        ...store,
        packAssetSelections: { ...(store.packAssetSelections ?? {}), [packId]: { ...current, propIds: next } },
      });
      bump();
    },
    [packId, bump]
  );

  const clearSelection = useCallback(() => {
    if (!packId) return;
    const store = readStore();
    const next = { ...(store.packAssetSelections ?? {}) };
    delete next[packId];
    writeStore({ ...store, packAssetSelections: next });
    bump();
  }, [packId, bump]);

  return { selection, assembledPrompt, updateSelection, toggleMaterialId, togglePropId, clearSelection };
}
