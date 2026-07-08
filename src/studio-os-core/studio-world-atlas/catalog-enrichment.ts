import type {
  AtlasDiscoveryStore,
  AtlasMapMode,
  AtlasMasterPlanReservation,
  AtlasNode,
  AtlasTravelMode,
  AtlasViewState,
} from './types';
import { resolveEnginesForNode, nodeVisibleInMapMode } from './engine-registry';
import {
  boostActivityForEngines,
  resolveLivingSignals,
  resolveMonumentType,
  type LivingWorldContext,
} from './living-world-signals';
import { constructionExtrusionScale, resolveConstructionPhaseForNode } from './world-construction';
import { buildDiscoveryNodes } from './world-discovery';
import { getBuildingMemory } from './world-memory';
import { buildPotentialRoadPaths } from './master-planner';
import { buildParallelFutureRoadPaths } from './parallel-futures';
import { planPhaseProgress } from './master-planner-phases';

export type AtlasEnrichmentInput = {
  mapMode: AtlasMapMode;
  discovery: AtlasDiscoveryStore;
  liveTick?: number;
  view?: Pick<AtlasViewState, 'travelingRoads' | 'travelMode'>;
};

export function buildPlannerFeatureNodes(features: AtlasDiscoveryStore['planFeatures']): AtlasNode[] {
  return features.map(
    (f): AtlasNode => ({
      id: `feat-${f.id}`,
      displayName: f.label,
      level: 1,
      parentId: 'atlas-world-root',
      physicalType: f.type,
      mapX: f.mapX,
      mapY: f.mapY,
      mapZ: 0.1,
      extrusion: 0.08,
      travelPath: '/admin/studio/world-atlas',
      unlocked: true,
      fogged: false,
      hidden: false,
      activity: 'dormant',
      childIds: [],
      modes: ['master-planner', 'future-vision'],
      isPlanned: true,
      livingSignals: f.type === 'road' ? [] : ['pulse'],
    })
  );
}

export function buildFutureVisionNodes(concepts: AtlasDiscoveryStore['futureVisionConcepts']): AtlasNode[] {
  return concepts.map(
    (c): AtlasNode => ({
      id: `vision-${c.id}`,
      displayName: c.label,
      level: 1,
      parentId: 'atlas-world-root',
      physicalType: 'district',
      mapX: c.mapX,
      mapY: c.mapY,
      mapZ: 0.15,
      extrusion: 0.1,
      travelPath: '/admin/studio/world-atlas',
      unlocked: true,
      fogged: false,
      hidden: false,
      activity: 'dormant',
      childIds: [],
      modes: ['future-vision', 'master-planner'],
      isPlanned: true,
      isConcept: true,
    })
  );
}

function masterPlanNodes(plans: AtlasMasterPlanReservation[]): AtlasNode[] {
  return plans.map(
    (p): AtlasNode => ({
      id: `plan-${p.id}`,
      displayName: p.label,
      level: 1,
      parentId: 'atlas-world-root',
      physicalType: 'district',
      mapX: p.mapX,
      mapY: p.mapY,
      mapZ: 0.25,
      extrusion: 0.12 + planPhaseProgress(p.phase ?? 'reserved-land') / 500,
      travelPath: '/admin/studio/world-atlas',
      unlocked: true,
      fogged: false,
      hidden: false,
      activity: p.phase === 'operational' ? 'active' : 'dormant',
      childIds: [],
      modes: ['master-planner', 'future-vision', 'construction', 'creative-budget'],
      isPlanned: true,
      isConcept: p.isConcept,
      planId: p.id,
      planPhase: p.phase,
      livingSignals: ['construction-crane'],
    })
  );
}

export function buildParallelFutureNodes(
  futures: AtlasDiscoveryStore['parallelFutures'],
  activeFutureId: string | null
): AtlasNode[] {
  const nodes: AtlasNode[] = [];
  for (const future of futures) {
    const isActive = future.id === activeFutureId;
    for (const b of future.buildings) {
      nodes.push({
        id: `pf-node-${b.id}`,
        displayName: `${future.tagline} · ${b.label}`,
        level: 1,
        parentId: 'atlas-world-root',
        physicalType: 'district',
        mapX: b.mapX,
        mapY: b.mapY,
        mapZ: isActive ? 0.28 : 0.12,
        extrusion: isActive ? 0.14 : 0.06,
        travelPath: '/admin/studio/world-atlas',
        unlocked: true,
        fogged: false,
        hidden: false,
        activity: isActive ? 'pulse' : 'dormant',
        childIds: [],
        modes: ['parallel-futures', 'master-planner', 'future-vision'],
        isPlanned: true,
        isConcept: !isActive,
        isParallelFuture: true,
        parallelFutureId: future.id,
        livingSignals: isActive ? ['ai-glow'] : [],
      });
    }
  }
  return nodes;
}

export function enrichAtlasNodes(nodes: AtlasNode[], input: AtlasEnrichmentInput): AtlasNode[] {
  const ctx: LivingWorldContext = {
    mapMode: input.mapMode,
    view: {
      travelingRoads: input.view?.travelingRoads ?? false,
      travelMode: (input.view?.travelMode ?? 'fast-travel') as AtlasTravelMode,
    },
    constructions: input.discovery.activeConstructions,
    hiddenFinds: input.discovery.hiddenFinds,
    tick: input.liveTick ?? 0,
  };

  const discoveryNodes = buildDiscoveryNodes(
    new Set(input.discovery.discoveredNodeIds),
    input.discovery.hiddenFinds
  );

  const planNodes =
    input.mapMode === 'master-planner' ||
    input.mapMode === 'future-vision' ||
    input.mapMode === 'parallel-futures'
      ? [
          ...(input.mapMode === 'parallel-futures'
            ? buildParallelFutureNodes(
                input.discovery.parallelFutures,
                input.discovery.activeParallelFutureId
              )
            : []),
          ...(input.mapMode !== 'parallel-futures'
            ? [
                ...masterPlanNodes(input.discovery.masterPlan),
                ...buildPlannerFeatureNodes(input.discovery.planFeatures),
                ...buildFutureVisionNodes(input.discovery.futureVisionConcepts),
              ]
            : []),
        ]
      : [];

  const enriched = [...nodes, ...discoveryNodes, ...planNodes].map((node) => {
    const engineIds = resolveEnginesForNode(node);
    const constructionPhase = resolveConstructionPhaseForNode(node, input.discovery.activeConstructions);
    const memory = getBuildingMemory(node.id, input.discovery.buildingMemories);
    const activity = boostActivityForEngines(node.activity, engineIds.length);
    const monumentType = resolveMonumentType(node, input.discovery.hiddenFinds);
    const scale = constructionExtrusionScale(constructionPhase);
    const base: AtlasNode = {
      ...node,
      engineIds,
      constructionPhase,
      activity,
      monumentType,
      worldMemoryId: memory ? node.id : node.worldMemoryId,
      extrusion: node.extrusion * scale,
      livingSignals: resolveLivingSignals(
        { ...node, engineIds, constructionPhase, activity, monumentType },
        ctx
      ),
      modes: [...new Set([...node.modes, 'architectural-blueprint' as AtlasMapMode])],
    };
    return base;
  });

  return enriched;
}

export function filterNodesForMapMode(nodes: AtlasNode[], mapMode: AtlasMapMode): AtlasNode[] {
  if (mapMode === 'architectural-blueprint') return nodes;
  return nodes.filter((n) => nodeVisibleInMapMode(n, mapMode));
}

export function buildPlannerRoadPaths(
  input: AtlasEnrichmentInput,
  anchor: { mapX: number; mapY: number }
): string[] {
  if (
    input.mapMode !== 'master-planner' &&
    input.mapMode !== 'future-vision' &&
    input.mapMode !== 'parallel-futures'
  )
    return [];
  if (input.mapMode === 'parallel-futures') {
    const active = input.discovery.parallelFutures.find(
      (f) => f.id === input.discovery.activeParallelFutureId
    );
    if (!active) return [];
    return buildParallelFutureRoadPaths(active, anchor);
  }
  return buildPotentialRoadPaths(input.discovery.masterPlan, input.discovery.planFeatures, anchor);
}
