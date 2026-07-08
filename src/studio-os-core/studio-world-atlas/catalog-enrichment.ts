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

export type AtlasEnrichmentInput = {
  mapMode: AtlasMapMode;
  discovery: AtlasDiscoveryStore;
  liveTick?: number;
  view?: Pick<AtlasViewState, 'travelingRoads' | 'travelMode'>;
};

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
      extrusion: 0.12,
      travelPath: '/admin/studio/world-atlas',
      unlocked: true,
      fogged: false,
      hidden: false,
      activity: 'dormant',
      childIds: [],
      modes: ['master-planner', 'future-vision', 'construction'],
      isPlanned: true,
      livingSignals: ['construction-crane'],
    })
  );
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
    input.mapMode === 'master-planner' || input.mapMode === 'future-vision'
      ? masterPlanNodes(input.discovery.masterPlan)
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
