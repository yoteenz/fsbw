import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ambientWorldTicker,
  buildAtlasCatalog,
  buildAtlasOrbRecommendations,
  defaultAtlasView,
  getAtlasNode,
  getBuildingMemory,
  getParentNode,
  getVisibleAtlasNodes,
  invalidateAtlasCatalogCache,
  listActiveEnginesInCatalog,
  readAtlasDiscovery,
  recordAtlasDiscovery,
  recordHiddenFind,
  resolveAtlasTravel,
  resolveZoomLevelForNode,
  STUDIO_WORLD_ATLAS_EVENT,
  type AtlasMapMode,
  type AtlasMasterPlanReservation,
  type AtlasNode,
  type AtlasOrbRecommendation,
  type AtlasTravelMode,
  type AtlasTravelResolution,
  type AtlasViewState,
} from '../studio-os-core/studio-world-atlas';

export function useStudioWorldAtlas(options?: {
  companyName?: string;
  liveRefreshMs?: number;
}) {
  const [view, setView] = useState<AtlasViewState>(defaultAtlasView);
  const [discoveryTick, setDiscoveryTick] = useState(0);
  const [liveTick, setLiveTick] = useState(0);

  const discovery = useMemo(() => {
    void discoveryTick;
    return readAtlasDiscovery();
  }, [discoveryTick]);

  const catalog = useMemo(() => {
    void liveTick;
    return buildAtlasCatalog({
      companyName: options?.companyName,
      discovery,
      mapMode: view.mapMode,
      liveTick,
    });
  }, [options?.companyName, discovery, view.mapMode, liveTick]);

  const focusNode = useMemo(
    () => getAtlasNode(view.focusNodeId, catalog) ?? catalog[0]!,
    [view.focusNodeId, catalog]
  );

  const visibleNodes = useMemo(
    () => getVisibleAtlasNodes(view.focusNodeId, view.mapMode, catalog),
    [view.focusNodeId, view.mapMode, catalog]
  );

  const orbRecommendations: AtlasOrbRecommendation[] = useMemo(
    () => buildAtlasOrbRecommendations(catalog, discovery),
    [catalog, discovery]
  );

  const activeEngines = useMemo(() => listActiveEnginesInCatalog(catalog), [catalog]);

  const worldTicker = useMemo(
    () =>
      ambientWorldTicker(catalog, {
        mapMode: view.mapMode,
        view: { travelingRoads: view.travelingRoads, travelMode: view.travelMode },
        constructions: discovery.activeConstructions,
        hiddenFinds: discovery.hiddenFinds,
        tick: liveTick,
      }),
    [catalog, view.mapMode, view.travelingRoads, view.travelMode, discovery, liveTick]
  );

  const focusMemory = useMemo(
    () => getBuildingMemory(focusNode.id, discovery.buildingMemories),
    [focusNode.id, discovery.buildingMemories]
  );

  const breadcrumb = useMemo(() => {
    const trail: AtlasNode[] = [];
    let cursor: AtlasNode | null = focusNode;
    while (cursor) {
      trail.unshift(cursor);
      cursor = cursor.parentId ? getAtlasNode(cursor.parentId, catalog) ?? null : null;
    }
    return trail;
  }, [focusNode, catalog]);

  const setMapMode = useCallback((mapMode: AtlasMapMode) => {
    invalidateAtlasCatalogCache();
    setView((v) => ({ ...v, mapMode, transitionMs: 500 }));
  }, []);

  const setTravelMode = useCallback((travelMode: AtlasTravelMode) => {
    setView((v) => ({ ...v, travelMode }));
  }, []);

  const focusOn = useCallback(
    (nodeId: string) => {
      const node = getAtlasNode(nodeId, catalog);
      if (!node || (node.hidden && view.mapMode !== 'innovation' && view.mapMode !== 'future-vision')) {
        return;
      }
      if (node.fogged && !node.unlocked) {
        if (
          nodeId.startsWith('discovery-') &&
          (view.mapMode === 'innovation' || view.mapMode === 'future-vision')
        ) {
          recordHiddenFind(nodeId);
        } else {
          return;
        }
      } else {
        recordAtlasDiscovery(nodeId);
      }
      if (nodeId.startsWith('discovery-') && !node.unlocked) {
        recordHiddenFind(nodeId);
      }
      invalidateAtlasCatalogCache();
      setDiscoveryTick((t) => t + 1);
      setView((v) => ({
        ...v,
        focusNodeId: nodeId,
        zoomLevel: resolveZoomLevelForNode(node),
        transitionMs: node.level > v.zoomLevel ? 1100 : 800,
      }));
    },
    [catalog, view.mapMode]
  );

  const zoomOut = useCallback(() => {
    const parent = getParentNode(view.focusNodeId, catalog);
    if (!parent) return;
    setView((v) => ({
      ...v,
      focusNodeId: parent.id,
      zoomLevel: parent.level,
      transitionMs: 700,
    }));
  }, [view.focusNodeId, catalog]);

  const resetToWorld = useCallback(() => {
    setView(defaultAtlasView());
  }, []);

  const resolveTravel = useCallback(
    (nodeId: string): AtlasTravelResolution | null => {
      const node = getAtlasNode(nodeId, catalog);
      if (!node) return null;
      recordAtlasDiscovery(nodeId);
      invalidateAtlasCatalogCache();
      setDiscoveryTick((t) => t + 1);
      setView((v) => ({ ...v, travelingRoads: true }));
      return resolveAtlasTravel(node, view.travelMode, view);
    },
    [catalog, view]
  );

  const clearTravelingRoads = useCallback(() => {
    setView((v) => ({ ...v, travelingRoads: false }));
  }, []);

  const selectMasterPlan = useCallback((plan: AtlasMasterPlanReservation) => {
    const planNodeId = `plan-${plan.id}`;
    setView((v) => ({
      ...v,
      mapMode: 'master-planner',
      focusNodeId: 'atlas-world-root',
      transitionMs: 600,
    }));
    recordAtlasDiscovery(planNodeId);
    setDiscoveryTick((t) => t + 1);
  }, []);

  useEffect(() => {
    const onUpdate = () => {
      invalidateAtlasCatalogCache();
      setDiscoveryTick((t) => t + 1);
    };
    window.addEventListener(STUDIO_WORLD_ATLAS_EVENT, onUpdate);
    return () => window.removeEventListener(STUDIO_WORLD_ATLAS_EVENT, onUpdate);
  }, []);

  useEffect(() => {
    const ms = options?.liveRefreshMs;
    if (!ms || ms < 3000) return;
    const id = window.setInterval(() => setLiveTick((t) => t + 1), ms);
    return () => window.clearInterval(id);
  }, [options?.liveRefreshMs]);

  // Ambient live world pulse — keeps table alive between interactions
  useEffect(() => {
    const id = window.setInterval(() => setLiveTick((t) => t + 1), 12_000);
    return () => window.clearInterval(id);
  }, []);

  return {
    view,
    catalog,
    focusNode,
    visibleNodes,
    orbRecommendations,
    breadcrumb,
    discovery,
    activeEngines,
    worldTicker,
    focusMemory,
    setMapMode,
    setTravelMode,
    focusOn,
    zoomOut,
    resetToWorld,
    resolveTravel,
    clearTravelingRoads,
    selectMasterPlan,
  };
}
