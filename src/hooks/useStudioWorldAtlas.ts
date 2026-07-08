import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ambientWorldTicker,
  buildAtlasCatalog,
  buildAtlasOrbRecommendations,
  buildExpansionRecommendations,
  buildPlannerRoadPaths,
  buildWorldForecast,
  clampPlanCoords,
  createFutureVisionConcept,
  createPlanFeature,
  defaultAtlasView,
  estimatePlanBudget,
  getAtlasNode,
  getBuildingMemory,
  getParentNode,
  getVisibleAtlasNodes,
  invalidateAtlasCatalogCache,
  listActiveEnginesInCatalog,
  readAtlasDiscovery,
  recordAtlasDiscovery,
  recordHiddenFind,
  reserveMasterPlanLand,
  resolveAtlasTravel,
  resolveSelectedPlan,
  resolveZoomLevelForNode,
  saveSimulationResult,
  setForecastHorizon,
  simulateMasterPlanPlacement,
  STUDIO_WORLD_ATLAS_EVENT,
  advanceMasterPlanPhase,
  upsertFutureVisionConcept,
  upsertMasterPlanReservation,
  upsertPlanFeature,
  updateMasterPlanReservation,
  type AtlasMapMode,
  type AtlasMasterPlanReservation,
  type AtlasNode,
  type AtlasOrbRecommendation,
  type AtlasPlanFeatureType,
  type AtlasTravelMode,
  type AtlasTravelResolution,
  type AtlasViewState,
  type AtlasWorldForecastYear,
  type MasterPlanLandCategory,
} from '../studio-os-core/studio-world-atlas';

export function useStudioWorldAtlas(options?: {
  companyName?: string;
  liveRefreshMs?: number;
}) {
  const [view, setView] = useState<AtlasViewState>(defaultAtlasView);
  const [discoveryTick, setDiscoveryTick] = useState(0);
  const [liveTick, setLiveTick] = useState(0);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const discovery = useMemo(() => {
    void discoveryTick;
    return readAtlasDiscovery();
  }, [discoveryTick]);

  const isMasterPlannerMode =
    view.mapMode === 'master-planner' || view.mapMode === 'future-vision';

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

  const selectedPlan = useMemo(
    () => resolveSelectedPlan(discovery, selectedPlanId ?? (focusNode.planId ? `plan-${focusNode.planId}` : null)),
    [discovery, selectedPlanId, focusNode.planId]
  );

  const orbRecommendations: AtlasOrbRecommendation[] = useMemo(
    () =>
      buildAtlasOrbRecommendations(catalog, discovery, {
        mapMode: view.mapMode,
        selectedPlanId: selectedPlan?.id ?? null,
      }),
    [catalog, discovery, view.mapMode, selectedPlan?.id]
  );

  const expansionRecommendations = useMemo(
    () => buildExpansionRecommendations(catalog, discovery.masterPlan),
    [catalog, discovery.masterPlan]
  );

  const worldForecast = useMemo(
    () => buildWorldForecast(discovery.forecastHorizon, discovery),
    [discovery]
  );

  const activeSimulation = useMemo(
    () => (selectedPlan ? discovery.lastSimulations[selectedPlan.id] : undefined),
    [discovery.lastSimulations, selectedPlan]
  );

  const plannerRoadPaths = useMemo(
    () =>
      buildPlannerRoadPaths(
        { mapMode: view.mapMode, discovery, liveTick },
        { mapX: focusNode.mapX, mapY: focusNode.mapY }
      ),
    [view.mapMode, discovery, liveTick, focusNode.mapX, focusNode.mapY]
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
      if (node.planId) setSelectedPlanId(node.planId);
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
    setSelectedPlanId(null);
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
    setSelectedPlanId(plan.id);
    setView((v) => ({
      ...v,
      mapMode: 'master-planner',
      focusNodeId: 'atlas-world-root',
      transitionMs: 600,
    }));
    recordAtlasDiscovery(`plan-${plan.id}`);
    setDiscoveryTick((t) => t + 1);
  }, []);

  const reserveLand = useCallback(
    (label: string, category: MasterPlanLandCategory, mapX = 50, mapY = 50) => {
      const coords = clampPlanCoords(mapX, mapY);
      const plan = reserveMasterPlanLand(label, coords.mapX, coords.mapY, category);
      upsertMasterPlanReservation(plan);
      setSelectedPlanId(plan.id);
      invalidateAtlasCatalogCache();
      setDiscoveryTick((t) => t + 1);
      return plan;
    },
    []
  );

  const movePlanReservation = useCallback((planId: string, mapX: number, mapY: number) => {
    const plan = discovery.masterPlan.find((p) => p.id === planId);
    if (!plan) return;
    const coords = clampPlanCoords(mapX, mapY);
    upsertMasterPlanReservation(updateMasterPlanReservation(plan, coords));
    invalidateAtlasCatalogCache();
    setDiscoveryTick((t) => t + 1);
  }, [discovery.masterPlan]);

  const addPlanAmenity = useCallback(
    (planId: string, amenity: string) => {
      const plan = discovery.masterPlan.find((p) => p.id === planId);
      if (!plan) return;
      const amenities = [...(plan.amenities ?? []), amenity];
      upsertMasterPlanReservation(updateMasterPlanReservation(plan, { amenities }));
      setDiscoveryTick((t) => t + 1);
    },
    [discovery.masterPlan]
  );

  const addDistrictFeature = useCallback(
    (type: AtlasPlanFeatureType, label: string, mapX: number, mapY: number) => {
      const coords = clampPlanCoords(mapX, mapY);
      const feat = createPlanFeature(type, label, coords.mapX, coords.mapY, selectedPlanId ?? undefined);
      upsertPlanFeature(feat);
      setDiscoveryTick((t) => t + 1);
    },
    [selectedPlanId]
  );

  const runSimulation = useCallback(
    (planId?: string) => {
      const id = planId ?? selectedPlanId;
      const plan = discovery.masterPlan.find((p) => p.id === id);
      if (!plan) return null;
      const result = simulateMasterPlanPlacement(plan, catalog);
      saveSimulationResult(result);
      setDiscoveryTick((t) => t + 1);
      return result;
    },
    [discovery.masterPlan, selectedPlanId, catalog]
  );

  const advancePlan = useCallback((planId: string) => {
    advanceMasterPlanPhase(planId);
    setDiscoveryTick((t) => t + 1);
  }, []);

  const changeForecastHorizon = useCallback((years: AtlasWorldForecastYear) => {
    setForecastHorizon(years);
    setDiscoveryTick((t) => t + 1);
  }, []);

  const addVisionConcept = useCallback((label: string, mapX = 45, mapY = 60) => {
    const coords = clampPlanCoords(mapX, mapY);
    const concept = createFutureVisionConcept(
      label,
      coords.mapX,
      coords.mapY,
      'Future Vision™ concept — nothing generates until approved.',
      'Alternative layout sketch'
    );
    upsertFutureVisionConcept(concept);
    setView((v) => ({ ...v, mapMode: 'future-vision' }));
    setDiscoveryTick((t) => t + 1);
  }, []);

  const selectedPlanBudget = useMemo(
    () => (selectedPlan ? selectedPlan.budget ?? estimatePlanBudget(selectedPlan) : null),
    [selectedPlan]
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
    isMasterPlannerMode,
    selectedPlan,
    selectedPlanBudget,
    activeSimulation,
    expansionRecommendations,
    worldForecast,
    plannerRoadPaths,
    setMapMode,
    setTravelMode,
    focusOn,
    zoomOut,
    resetToWorld,
    resolveTravel,
    clearTravelingRoads,
    selectMasterPlan,
    reserveLand,
    movePlanReservation,
    addPlanAmenity,
    addDistrictFeature,
    runSimulation,
    advancePlan,
    changeForecastHorizon,
    addVisionConcept,
    setSelectedPlanId,
  };
}
