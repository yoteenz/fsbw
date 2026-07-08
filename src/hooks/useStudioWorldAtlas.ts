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
  commitParallelFuture,
  forkParallelFutureInStore,
  reviveParallelFutureFromLibrary,
  saveParallelFutureWalk,
  setActiveParallelFuture,
  enterMergeLab,
  exitMergeLab,
  runFutureMergeInStore,
  resolveMergeConflictInStore,
  moveMergeBuildingInStore,
  simulateMasterPlanPlacement,
  STUDIO_WORLD_ATLAS_EVENT,
  advanceMasterPlanPhase,
  upsertFutureVisionConcept,
  upsertMasterPlanReservation,
  upsertPlanFeature,
  updateMasterPlanReservation,
  type AtlasMapMode,
  buildParallelFuturesComparison,
  buildFutureCommitSummary,
  simulateParallelFutureWalk,
  buildLiveMergeMetrics,
  liveMergeMetricLines,
  formatGenomeLines,
  formatMergeReplay,
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
import {
  buildJourneyRoadPaths,
  buildOrbRecommendationsSnapshot,
  buildOrbWorldSignals,
  journeyNodePositions,
  type OrbRecommendation,
} from '../studio-os-core/orb-recommendations';

export function useStudioWorldAtlas(options?: {
  companyName?: string;
  organizationId?: string;
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
    view.mapMode === 'master-planner' ||
    view.mapMode === 'future-vision' ||
    view.mapMode === 'parallel-futures' ||
    view.mapMode === 'future-merge';

  const isParallelFuturesMode =
    view.mapMode === 'parallel-futures' || view.mapMode === 'future-merge';

  const isFutureMergeMode = view.mapMode === 'future-merge';

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

  const activeParallelFuture = useMemo(
    () =>
      discovery.parallelFutures.find((f) => f.id === discovery.activeParallelFutureId) ??
      discovery.parallelFutures[0],
    [discovery.parallelFutures, discovery.activeParallelFutureId]
  );

  const parallelFuturesComparison = useMemo(
    () => buildParallelFuturesComparison(discovery.parallelFutures),
    [discovery.parallelFutures]
  );

  const activeParallelFutureWalk = useMemo(
    () =>
      activeParallelFuture
        ? discovery.parallelFutureWalks[activeParallelFuture.id]
        : undefined,
    [discovery.parallelFutureWalks, activeParallelFuture]
  );

  const parallelFutureCommitPreview = useMemo(
    () => (activeParallelFuture ? buildFutureCommitSummary(activeParallelFuture) : undefined),
    [activeParallelFuture]
  );

  const mergeDraftFuture = useMemo(
    () =>
      discovery.mergeDraftFutureId
        ? discovery.parallelFutures.find((f) => f.id === discovery.mergeDraftFutureId)
        : undefined,
    [discovery.mergeDraftFutureId, discovery.parallelFutures]
  );

  const liveMergeMetrics = useMemo(() => {
    const analysis = mergeDraftFuture?.analysis ?? activeParallelFuture?.analysis;
    return analysis ? buildLiveMergeMetrics(analysis) : undefined;
  }, [mergeDraftFuture, activeParallelFuture]);

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

  const orbSnapshot = useMemo(
    () =>
      buildOrbRecommendationsSnapshot(
        options?.organizationId ?? 'frontal-slayer',
        options?.companyName ?? 'Studio World',
        '/admin/studio/world-atlas'
      ),
    [options?.organizationId, options?.companyName]
  );

  const orbWorldSignals = useMemo(
    () => buildOrbWorldSignals(orbSnapshot.recommendations, catalog),
    [orbSnapshot.recommendations, catalog]
  );

  const orbJourneyRoadPaths = useMemo(() => {
    const positions = journeyNodePositions(catalog, orbSnapshot.executiveJourney);
    return buildJourneyRoadPaths(orbSnapshot.executiveJourney, positions);
  }, [catalog, orbSnapshot.executiveJourney]);

  const orbProactiveRecommendations: OrbRecommendation[] = useMemo(
    () => orbSnapshot.recommendations.slice(0, 5),
    [orbSnapshot.recommendations]
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

  const openMergeLab = useCallback(() => {
    enterMergeLab();
    setView((v) => ({ ...v, mapMode: 'future-merge', focusNodeId: 'atlas-world-root', transitionMs: 800 }));
    invalidateAtlasCatalogCache();
    setDiscoveryTick((t) => t + 1);
  }, []);

  const closeMergeLab = useCallback(() => {
    exitMergeLab();
    setView((v) => ({ ...v, mapMode: 'parallel-futures', transitionMs: 600 }));
    setDiscoveryTick((t) => t + 1);
  }, []);

  const runFutureMerge = useCallback(() => {
    const merged = runFutureMergeInStore();
    if (merged) {
      invalidateAtlasCatalogCache();
      setDiscoveryTick((t) => t + 1);
    }
    return merged;
  }, []);

  const resolveMergeConflict = useCallback((conflictId: string) => {
    resolveMergeConflictInStore(conflictId);
    setDiscoveryTick((t) => t + 1);
  }, []);

  const moveMergeBuilding = useCallback((buildingId: string, mapX: number, mapY: number) => {
    moveMergeBuildingInStore(buildingId, mapX, mapY);
    invalidateAtlasCatalogCache();
    setDiscoveryTick((t) => t + 1);
  }, []);

  const selectParallelFuture = useCallback((futureId: string) => {
    setActiveParallelFuture(futureId);
    setView((v) => ({ ...v, mapMode: 'parallel-futures', focusNodeId: 'atlas-world-root', transitionMs: 600 }));
    invalidateAtlasCatalogCache();
    setDiscoveryTick((t) => t + 1);
  }, []);

  const walkParallelFuture = useCallback(
    (futureId?: string) => {
      const id = futureId ?? discovery.activeParallelFutureId;
      const future = discovery.parallelFutures.find((f) => f.id === id);
      if (!future) return null;
      const sim = simulateParallelFutureWalk(future);
      saveParallelFutureWalk(sim);
      setDiscoveryTick((t) => t + 1);
      return sim;
    },
    [discovery.parallelFutures, discovery.activeParallelFutureId]
  );

  const approveParallelFuture = useCallback(
    (futureId: string) => {
      const committed = commitParallelFuture(futureId);
      setDiscoveryTick((t) => t + 1);
      return committed;
    },
    []
  );

  const forkActiveParallelFuture = useCallback(
    (newLabel: string) => {
      const id = discovery.activeParallelFutureId;
      if (!id) return null;
      const forked = forkParallelFutureInStore(id, newLabel);
      setDiscoveryTick((t) => t + 1);
      return forked;
    },
    [discovery.activeParallelFutureId]
  );

  const reviveLibraryFuture = useCallback((entryId: string) => {
    reviveParallelFutureFromLibrary(entryId);
    setView((v) => ({ ...v, mapMode: 'parallel-futures' }));
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
    orbProactiveRecommendations,
    orbWorldSignals,
    orbJourneyRoadPaths,
    orbDailyBrief: orbSnapshot.dailyBrief,
    breadcrumb,
    discovery,
    activeEngines,
    worldTicker,
    focusMemory,
    isMasterPlannerMode,
    isParallelFuturesMode,
    isFutureMergeMode,
    mergeDraftFuture,
    liveMergeMetrics,
    mergeConflicts: discovery.mergeConflicts,
    mergeHistory: discovery.mergeHistory,
    mergeCollaborators: discovery.mergeCollaborators,
    mergeComments: discovery.mergeComments,
    mergeLabActive: discovery.mergeLabActive,
    selectedPlan,
    activeParallelFuture,
    parallelFuturesComparison,
    activeParallelFutureWalk,
    parallelFutureCommitPreview,
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
    selectParallelFuture,
    walkParallelFuture,
    approveParallelFuture,
    forkActiveParallelFuture,
    reviveLibraryFuture,
    openMergeLab,
    closeMergeLab,
    runFutureMerge,
    resolveMergeConflict,
    moveMergeBuilding,
    formatGenomeLines,
    liveMergeMetricLines,
    formatMergeReplay,
    setSelectedPlanId,
  };
}
