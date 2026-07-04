import { useCallback, useMemo, useState } from 'react';
import type {
  ContentPackAssetSelection,
  AssetDirectorStatus,
} from '../utils/adminStudioAssetDirectorDemo';
import {
  assemblePromptFromAssets,
  searchAssetDirectorIndex,
} from '../utils/adminStudioAssetDirectorDemo';
import type { AssetDirectorFilterId, AssetDirectorViewMode, StudioVisualBundle, VisualAssetItem } from '../utils/adminStudioAssetDirectorVisual';
import { versionStorageKey } from '../utils/adminStudioAssetGenerationPipeline';
import { shouldReclassifyGeneratedAsReferenceScene } from '../utils/adminStudioSetSeparation';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';

export type GeneratedVersionRecord = {
  previewSrc: string;
  generatedAt: string;
  variantName: string;
  source: 'factory' | 'replace';
  jobId?: string;
  status: 'generating' | 'complete' | 'failed';
  error?: string;
};

type AssetDirectorStore = {
  packAssetSelections?: Record<string, ContentPackAssetSelection>;
  statusOverrides?: Record<string, AssetDirectorStatus>;
  viewMode?: AssetDirectorViewMode;
  favorites?: string[];
  generatedVersions?: Record<string, GeneratedVersionRecord>;
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
    generatedVersions: store.generatedVersions ?? {},
    source: 'asset-director-local' as const,
  };
}

export function getGeneratedVersionRecord(studioId: string, variantId: string): GeneratedVersionRecord | undefined {
  const store = readStore();
  return store.generatedVersions?.[versionStorageKey(studioId, variantId)];
}

export function setGeneratedVersionRecord(
  studioId: string,
  variantId: string,
  record: GeneratedVersionRecord
): void {
  const store = readStore();
  const key = versionStorageKey(studioId, variantId);
  writeStore({
    ...store,
    generatedVersions: { ...(store.generatedVersions ?? {}), [key]: record },
  });
}

function formatGeneratedVersionSubtitle(error?: string): string {
  if (!error) return 'GENERATION FAILED';
  if (/^forbidden$/i.test(error.trim())) return 'ADMIN ACCESS DENIED';
  if (/session expired|sign in required|missing_token|invalid_token/i.test(error)) {
    return 'SIGN IN REQUIRED';
  }
  if (/admin access denied|not_admin/i.test(error)) return 'ADMIN ACCESS DENIED';
  if (/marble reference missing|studio reference missing/i.test(error)) return 'REFERENCE ASSETS UNAVAILABLE';
  if (/failed to parse url/i.test(error)) return 'INVALID REFERENCE URL';
  return error.length > 48 ? `${error.slice(0, 45)}…` : error;
}

export function mergeStudioBundleWithGeneratedVersions(bundle: StudioVisualBundle, studioId: string): StudioVisualBundle {
  const store = readStore();
  const generated = store.generatedVersions ?? {};

  let referenceScene = [...bundle.referenceScene];
  let masterStudio = [...bundle.masterStudio];

  const versions = bundle.versions.map((v) => {
    const key = versionStorageKey(studioId, v.id);
    const gen = generated[key];
    if (!gen) return v;

    if (gen.status === 'complete' && shouldReclassifyGeneratedAsReferenceScene(v.name, true)) {
      const refId = `${studioId}-ref-migrated-${v.id}`;
      const existingRefIdx = referenceScene.findIndex((r) => r.id === refId || r.name.includes(v.name));
      const refItem: VisualAssetItem = {
        id: refId,
        name: `${v.name} · STAGED REFERENCE`,
        previewSrc: gen.previewSrc || v.previewSrc,
        status: 'approved',
        resolution: v.resolution,
        version: v.version,
        accentHex: v.accentHex,
        setLayer: 'reference-scene',
        subtitle: 'RECLASSIFIED · EXAMPLE ONLY · NOT MASTER STUDIO',
      };
      if (existingRefIdx >= 0) {
        referenceScene[existingRefIdx] = refItem;
      } else {
        referenceScene = [refItem, ...referenceScene];
      }
      const masterIdx = masterStudio.findIndex((m) => m.name === v.name || m.name === 'MASTER BASE');
      if (masterIdx >= 0) {
        masterStudio[masterIdx] = {
          ...masterStudio[masterIdx],
          status: 'needs-review',
          subtitle: 'NEEDS GENERATION · CLEAN EMPTY SET',
          previewSrc: masterStudio[masterIdx].previewSrc,
        };
      }
      return {
        ...v,
        previewSrc: v.previewSrc,
        status: 'needs-review' as const,
        subtitle: 'MIGRATED TO REFERENCE SCENE · GENERATE CLEAN MASTER',
        setLayer: 'master-studio' as const,
      };
    }

    return {
      ...v,
      previewSrc: gen.previewSrc || v.previewSrc,
      status: gen.status === 'generating' ? ('needs-review' as const) : gen.status === 'failed' ? ('draft' as const) : ('approved' as const),
      subtitle:
        gen.status === 'generating'
          ? 'GENERATING…'
          : gen.status === 'failed'
            ? formatGeneratedVersionSubtitle(gen.error)
            : gen.source === 'replace'
              ? 'REPLACED'
              : 'FACTORY GENERATED',
      setLayer: v.setLayer ?? 'master-studio',
    };
  });

  const heroRef = referenceScene.find((r) => r.previewSrc && !r.previewSrc.includes('wave-thumb') && r.subtitle?.includes('RECLASSIFIED'));
  const heroGen = versions.find((v) => v.name === 'DAY' && generated[versionStorageKey(studioId, v.id)]?.status === 'complete');
  const heroMaster = masterStudio.find((m) => m.status === 'approved' && m.previewSrc);

  return {
    ...bundle,
    versions,
    masterStudio,
    referenceScene,
    heroSrc: heroRef?.previewSrc ?? heroMaster?.previewSrc ?? heroGen?.previewSrc ?? bundle.heroSrc,
  };
}

export function useAdminStudioAssetDirector() {
  const [searchQuery, setSearchQuery] = useState('');
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const searchResults = useMemo(() => searchAssetDirectorIndex(searchQuery), [searchQuery]);

  const store = useMemo(() => {
    void version;
    return readStore();
  }, [version]);

  const viewMode: AssetDirectorViewMode = store.viewMode ?? 'gallery';
  const favorites = store.favorites ?? [];

  const setViewMode = useCallback(
    (mode: AssetDirectorViewMode) => {
      writeStore({ ...readStore(), viewMode: mode });
      bump();
    },
    [bump]
  );

  const toggleFavorite = useCallback(
    (assetId: string) => {
      const s = readStore();
      const favs = s.favorites ?? [];
      const next = favs.includes(assetId) ? favs.filter((id) => id !== assetId) : [...favs, assetId];
      writeStore({ ...s, favorites: next });
      bump();
    },
    [bump]
  );

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    version,
    bump,
    viewMode,
    setViewMode,
    favorites,
    toggleFavorite,
  };
}

export function useAdminStudioAssetDirectorBrowser(initialFilter: AssetDirectorFilterId = 'all') {
  const [activeFilter, setActiveFilter] = useState<AssetDirectorFilterId>(initialFilter);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [quickPreview, setQuickPreview] = useState<VisualAssetItem | null>(null);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const bulkAction = useCallback((action: string) => {
    void action;
    setSelectedIds([]);
  }, []);

  return {
    activeFilter,
    setActiveFilter,
    selectedIds,
    toggleSelect,
    clearSelection,
    bulkAction,
    quickPreview,
    setQuickPreview,
  };
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
