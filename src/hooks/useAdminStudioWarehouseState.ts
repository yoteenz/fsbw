import { useCallback, useMemo, useState } from 'react';
import {
  buildWarehouseRecommendations,
  filterCompatibleAssets,
  searchWarehouseAssets,
  shouldRecommendReuse,
  WAREHOUSE_SCENE_RECIPES,
  type WarehouseDistrictId,
  type WarehouseReplaceContext,
  type WarehouseViewMode,
} from '../studio-os-core/studio-warehouse';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';
import type { WarehouseAsset } from '../studio-os-core/studio-warehouse';
import { buildStudioWarehouseCatalog, exportWarehouseSnapshot } from '../utils/adminStudioWarehouseDemo';

type WarehousePrefs = {
  favorites: string[];
  archived: string[];
  appliedReplacements: Array<{ workspaceId: string; slotRole: string; assetId: string; at: string }>;
};

const EMPTY_PREFS: WarehousePrefs = { favorites: [], archived: [], appliedReplacements: [] };

export function useAdminStudioWarehouse() {
  const [viewMode, setViewMode] = useState<WarehouseViewMode>('districts');
  const [activeDistrictId, setActiveDistrictId] = useState<WarehouseDistrictId>('environment-gallery');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceContext, setReplaceContext] = useState<WarehouseReplaceContext | null>(null);
  const [previewRotation, setPreviewRotation] = useState(0);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [version, setVersion] = useState(0);

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const prefs = useMemo(() => {
    void version;
    return readStudioJson<WarehousePrefs>(ADMIN_STUDIO_STORAGE_KEYS.warehouse) ?? EMPTY_PREFS;
  }, [version]);

  const baseCatalog = useMemo(() => buildStudioWarehouseCatalog(), [version]);

  const catalog = useMemo(() => {
    return baseCatalog.map((asset) => ({
      ...asset,
      favorite: prefs.favorites.includes(asset.id) || asset.favorite,
      archived: prefs.archived.includes(asset.id),
    }));
  }, [baseCatalog, prefs.archived, prefs.favorites]);

  const selectedAsset = useMemo(
    () => catalog.find((a) => a.id === selectedAssetId) ?? null,
    [catalog, selectedAssetId]
  );

  const districtAssets = useMemo(
    () => catalog.filter((a) => a.districtId === activeDistrictId && !a.archived),
    [activeDistrictId, catalog]
  );

  const searchResults = useMemo(
    () => searchWarehouseAssets(searchQuery, catalog, 16),
    [catalog, searchQuery]
  );

  const recommendations = useMemo(
    () => buildWarehouseRecommendations(catalog, selectedAssetId ?? undefined),
    [catalog, selectedAssetId]
  );

  const sceneRecipes = WAREHOUSE_SCENE_RECIPES;

  const replaceCandidates = useMemo(() => {
    if (!replaceContext) return [];
    return filterCompatibleAssets(catalog, replaceContext.workspaceId, replaceContext.slotRole);
  }, [catalog, replaceContext]);

  const snapshot = useMemo(() => exportWarehouseSnapshot(), [catalog]);

  const persistPrefs = useCallback(
    (next: WarehousePrefs) => {
      writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.warehouse, next);
      bump();
    },
    [bump]
  );

  const toggleFavorite = useCallback(
    (assetId: string) => {
      const favs = new Set(prefs.favorites);
      if (favs.has(assetId)) favs.delete(assetId);
      else favs.add(assetId);
      persistPrefs({ ...prefs, favorites: [...favs] });
    },
    [persistPrefs, prefs]
  );

  const archiveAsset = useCallback(
    (assetId: string) => {
      const archived = new Set(prefs.archived);
      archived.add(assetId);
      persistPrefs({ ...prefs, archived: [...archived] });
      if (selectedAssetId === assetId) setSelectedAssetId(null);
    },
    [persistPrefs, prefs, selectedAssetId]
  );

  const applyReplacement = useCallback(
    (assetId: string) => {
      if (!replaceContext) return;
      persistPrefs({
        ...prefs,
        appliedReplacements: [
          {
            workspaceId: replaceContext.workspaceId,
            slotRole: replaceContext.slotRole,
            assetId,
            at: new Date().toISOString(),
          },
          ...prefs.appliedReplacements,
        ].slice(0, 48),
      });
      setReplaceContext(null);
      setSelectedAssetId(assetId);
    },
    [persistPrefs, prefs, replaceContext]
  );

  const openReplaceFlow = useCallback((ctx: WarehouseReplaceContext) => {
    setReplaceContext(ctx);
    setViewMode('districts');
  }, []);

  const recommendReuseFor = useCallback((asset: WarehouseAsset) => shouldRecommendReuse(asset), []);

  const rotatePreview = useCallback((delta: number) => {
    setPreviewRotation((r) => (r + delta) % 360);
  }, []);

  const zoomPreview = useCallback((delta: number) => {
    setPreviewZoom((z) => Math.min(2.2, Math.max(0.6, z + delta)));
  }, []);

  const resetPreview = useCallback(() => {
    setPreviewRotation(0);
    setPreviewZoom(1);
  }, []);

  return {
    viewMode,
    setViewMode,
    activeDistrictId,
    setActiveDistrictId,
    selectedAssetId,
    setSelectedAssetId,
    selectedAsset,
    districtAssets,
    catalog,
    searchQuery,
    setSearchQuery,
    searchResults,
    recommendations,
    sceneRecipes,
    replaceContext,
    setReplaceContext,
    replaceCandidates,
    openReplaceFlow,
    applyReplacement,
    toggleFavorite,
    archiveAsset,
    recommendReuseFor,
    previewRotation,
    previewZoom,
    rotatePreview,
    zoomPreview,
    resetPreview,
    snapshot,
    appliedReplacements: prefs.appliedReplacements,
  };
}
