import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  buildWarehouseRecommendations,
  filterCompatibleAssets,
  searchWarehouseAssets,
  shouldRecommendReuse,
  WAREHOUSE_SCENE_RECIPES,
  type WarehouseDistrictId,
  type WarehouseReplaceContext,
  type WarehouseViewMode,
  districtForWarehouseZone,
  resolveWarehouseZoneForSlot,
  type WarehouseCameraZoneId,
} from '../studio-os-core/studio-warehouse';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';
import type { WarehouseAsset } from '../studio-os-core/studio-warehouse';
import { buildStudioWarehouseCatalog, exportWarehouseSnapshot } from '../utils/adminStudioWarehouseDemo';

type WarehousePrefs = {
  favorites: string[];
  archived: string[];
  appliedReplacements: Array<{ workspaceId: string; slotRole: string; assetId: string; at: string }>;
  lastZoneId?: WarehouseCameraZoneId;
  arrivalComplete?: boolean;
};

const EMPTY_PREFS: WarehousePrefs = { favorites: [], archived: [], appliedReplacements: [] };

export function useAdminStudioWarehouse() {
  const [viewMode, setViewMode] = useState<WarehouseViewMode>('districts');
  const [activeZoneId, setActiveZoneId] = useState<WarehouseCameraZoneId>('threshold');
  const [arrivalComplete, setArrivalComplete] = useState(false);
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

  useEffect(() => {
    if (prefs.arrivalComplete) setArrivalComplete(true);
    if (prefs.lastZoneId) {
      setActiveZoneId(prefs.lastZoneId);
      const district = districtForWarehouseZone(prefs.lastZoneId);
      if (district) setActiveDistrictId(district);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- restore visit once

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

  const syncZoneToDistrict = useCallback((zoneId: WarehouseCameraZoneId) => {
    const district = districtForWarehouseZone(zoneId);
    if (district) setActiveDistrictId(district);
    setActiveZoneId(zoneId);
    const stored = readStudioJson<WarehousePrefs>(ADMIN_STUDIO_STORAGE_KEYS.warehouse) ?? EMPTY_PREFS;
    writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.warehouse, {
      ...stored,
      lastZoneId: zoneId,
    });
  }, []);

  const completeArrival = useCallback(() => {
    setArrivalComplete(true);
    setActiveZoneId('central-atrium');
    setActiveDistrictId('environment-gallery');
    const stored = readStudioJson<WarehousePrefs>(ADMIN_STUDIO_STORAGE_KEYS.warehouse) ?? EMPTY_PREFS;
    writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.warehouse, {
      ...stored,
      arrivalComplete: true,
      lastZoneId: 'central-atrium',
    });
    bump();
  }, [bump]);

  const enterLiveAssembly = useCallback(
    (ctx: WarehouseReplaceContext) => {
      const zoneId = resolveWarehouseZoneForSlot(ctx.slotRole);
      setArrivalComplete(true);
      setReplaceContext(ctx);
      syncZoneToDistrict(zoneId);
    },
    [syncZoneToDistrict]
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
    activeZoneId,
    setActiveZoneId: syncZoneToDistrict,
    arrivalComplete,
    setArrivalComplete,
    completeArrival,
    enterLiveAssembly,
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
