import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  buildAtlasCatalog,
  buildAtlasOrbRecommendations,
  defaultAtlasView,
  getAtlasNode,
  getParentNode,
  getVisibleAtlasNodes,
  invalidateAtlasCatalogCache,
  readAtlasDiscovery,
  recordAtlasDiscovery,
  resolveAtlasTravel,
  resolveZoomLevelForNode,
  STUDIO_WORLD_ATLAS_EVENT,
  type AtlasMapMode,
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
    return buildAtlasCatalog(options?.companyName, discovery.discoveredNodeIds);
  }, [options?.companyName, discovery.discoveredNodeIds, liveTick]);

  const focusNode = useMemo(
    () => getAtlasNode(view.focusNodeId, catalog) ?? catalog[0]!,
    [view.focusNodeId, catalog]
  );

  const visibleNodes = useMemo(
    () => getVisibleAtlasNodes(view.focusNodeId, view.mapMode, catalog),
    [view.focusNodeId, view.mapMode, catalog]
  );

  const orbRecommendations: AtlasOrbRecommendation[] = useMemo(
    () => buildAtlasOrbRecommendations(catalog),
    [catalog]
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
    setView((v) => ({ ...v, mapMode, transitionMs: 500 }));
  }, []);

  const setTravelMode = useCallback((travelMode: AtlasTravelMode) => {
    setView((v) => ({ ...v, travelMode }));
  }, []);

  const focusOn = useCallback(
    (nodeId: string) => {
      const node = getAtlasNode(nodeId, catalog);
      if (!node || node.hidden) return;
      if (node.fogged && !node.unlocked) return;
      recordAtlasDiscovery(nodeId);
      invalidateAtlasCatalogCache();
      setDiscoveryTick((t) => t + 1);
      setView((v) => ({
        ...v,
        focusNodeId: nodeId,
        zoomLevel: resolveZoomLevelForNode(node),
        transitionMs: node.level > v.zoomLevel ? 1100 : 800,
      }));
    },
    [catalog]
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
      return resolveAtlasTravel(node, view.travelMode, view);
    },
    [catalog, view]
  );

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

  return {
    view,
    catalog,
    focusNode,
    visibleNodes,
    orbRecommendations,
    breadcrumb,
    discovery,
    setMapMode,
    setTravelMode,
    focusOn,
    zoomOut,
    resetToWorld,
    resolveTravel,
  };
}
