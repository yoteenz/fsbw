import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  applyWarehouseAssetByCategory,
  applyWarehouseAssetToSceneStack,
  warehouseSlotRoleToLayerId,
} from '../studio-os-core/scene-stack/warehouse-bridge';
import { resolveActiveProjectGenome } from '../studio-os-core/project-genome';
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
  type WarehouseInteractionMode,
} from '../studio-os-core/studio-warehouse';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';
import type { WarehouseAsset } from '../studio-os-core/studio-warehouse';
import { buildStudioWarehouseCatalog, exportWarehouseSnapshot } from '../utils/adminStudioWarehouseDemo';
import { PIPELINE_REGISTRY_SYNCED_EVENT } from '../services/studio/assetRegistry/pipelineSync';

const CDS_DEPARTMENT_ID = 'creative-direction';

type WarehousePrefs = {
  favorites: string[];
  archived: string[];
  appliedReplacements: Array<{ workspaceId: string; slotRole: string; assetId: string; at: string }>;
  lastZoneId?: WarehouseCameraZoneId;
  arrivalComplete?: boolean;
  inspectorOpen?: boolean;
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
  const [interactionMode, setInteractionMode] = useState<WarehouseInteractionMode>('browse');
  const [compareAssetIds, setCompareAssetIds] = useState<string[]>([]);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [transitioningAssetId, setTransitioningAssetId] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [applyNotice, setApplyNotice] = useState<string | null>(null);

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    const project = resolveActiveProjectGenome(CDS_DEPARTMENT_ID);
    void import('../services/studio/assetRegistry/pipelineSync')
      .then((m) => m.hydratePipelineRegistryFromSupabase(CDS_DEPARTMENT_ID, project.projectId).then(() => bump()))
      .catch(() => {
        /* offline — warehouse catalog still uses local registry */
      });
    const onSynced = () => bump();
    window.addEventListener(PIPELINE_REGISTRY_SYNCED_EVENT, onSynced);
    return () => window.removeEventListener(PIPELINE_REGISTRY_SYNCED_EVENT, onSynced);
  }, [bump]);

  const prefs = useMemo(() => {
    void version;
    return readStudioJson<WarehousePrefs>(ADMIN_STUDIO_STORAGE_KEYS.warehouse) ?? EMPTY_PREFS;
  }, [version]);

  useEffect(() => {
    if (prefs.arrivalComplete) setArrivalComplete(true);
    if (prefs.inspectorOpen !== undefined) setInspectorOpen(prefs.inspectorOpen);
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
      const asset = catalog.find((a) => a.id === assetId);
      const layerId = warehouseSlotRoleToLayerId(replaceContext.slotRole);
      const project = resolveActiveProjectGenome(CDS_DEPARTMENT_ID);

      let mounted = false;
      if (asset && layerId) {
        const result = applyWarehouseAssetToSceneStack({
          departmentId: CDS_DEPARTMENT_ID,
          projectId: project.projectId,
          stationId: replaceContext.workspaceId,
          layerId,
          asset,
        });
        mounted = result.ok;
        setApplyNotice(
          result.ok
            ? `Mounted ${asset.name} on ${replaceContext.workspaceName} · ${replaceContext.slotRole} (no FAL).`
            : result.reason ?? 'Could not mount asset.'
        );
      }

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
      if (mounted) bump();
    },
    [bump, catalog, persistPrefs, prefs, replaceContext]
  );

  const applySelectedAssetToSceneStack = useCallback(() => {
    if (!selectedAssetId) return;
    const asset = catalog.find((a) => a.id === selectedAssetId);
    if (!asset) return;
    const project = resolveActiveProjectGenome(CDS_DEPARTMENT_ID);
    const result = applyWarehouseAssetByCategory({
      departmentId: CDS_DEPARTMENT_ID,
      projectId: project.projectId,
      asset,
    });
    setApplyNotice(
      result.ok
        ? `Mounted ${asset.name} on ${result.stationId} · ${result.layerId} (no FAL).`
        : result.reason ?? 'Could not mount asset — pick a pipeline-registered object with a preview URL.'
    );
    if (result.ok) bump();
  }, [bump, catalog, selectedAssetId]);

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

  const selectAssetForInspection = useCallback(
    (assetId: string) => {
      setTransitioningAssetId(assetId);
      setSelectedAssetId(assetId);
      setInteractionMode('inspect');
      resetPreview();
      window.setTimeout(() => setTransitioningAssetId(null), 680);
    },
    [resetPreview]
  );

  const toggleCompareAsset = useCallback((assetId: string) => {
    setCompareAssetIds((prev) => {
      if (prev.includes(assetId)) return prev.filter((id) => id !== assetId);
      if (prev.length >= 4) return prev;
      return [...prev, assetId];
    });
  }, []);

  const clearCompare = useCallback(() => {
    setCompareAssetIds([]);
    setInteractionMode('browse');
  }, []);

  const enterCompareMode = useCallback(() => {
    setInteractionMode('compare');
    if (selectedAssetId && !compareAssetIds.includes(selectedAssetId)) {
      setCompareAssetIds((prev) => (prev.length >= 4 ? prev : [...prev, selectedAssetId]));
    }
  }, [compareAssetIds, selectedAssetId]);

  const exitCompareMode = useCallback(() => {
    setInteractionMode('inspect');
  }, []);

  const toggleInspector = useCallback(() => {
    setInspectorOpen((open) => {
      const next = !open;
      const stored = readStudioJson<WarehousePrefs>(ADMIN_STUDIO_STORAGE_KEYS.warehouse) ?? EMPTY_PREFS;
      writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.warehouse, { ...stored, inspectorOpen: next });
      return next;
    });
  }, []);

  const openInspector = useCallback(() => {
    setInspectorOpen(true);
    const stored = readStudioJson<WarehousePrefs>(ADMIN_STUDIO_STORAGE_KEYS.warehouse) ?? EMPTY_PREFS;
    writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.warehouse, { ...stored, inspectorOpen: true });
  }, []);

  const closeInspector = useCallback(() => {
    setInspectorOpen(false);
    const stored = readStudioJson<WarehousePrefs>(ADMIN_STUDIO_STORAGE_KEYS.warehouse) ?? EMPTY_PREFS;
    writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.warehouse, { ...stored, inspectorOpen: false });
  }, []);

  const compareAssets = useMemo(
    () => compareAssetIds.map((id) => catalog.find((a) => a.id === id)).filter(Boolean) as WarehouseAsset[],
    [catalog, compareAssetIds]
  );

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
    selectAssetForInspection,
    interactionMode,
    setInteractionMode,
    compareAssetIds,
    compareAssets,
    toggleCompareAsset,
    clearCompare,
    enterCompareMode,
    exitCompareMode,
    inspectorOpen,
    toggleInspector,
    openInspector,
    closeInspector,
    transitioningAssetId,
    snapshot,
    appliedReplacements: prefs.appliedReplacements,
    applyNotice,
    clearApplyNotice: () => setApplyNotice(null),
    applySelectedAssetToSceneStack,
  };
}
