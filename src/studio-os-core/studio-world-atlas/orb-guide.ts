import type { AtlasDiscoveryStore, AtlasNode, AtlasOrbRecommendation } from './types';
import { ATLAS_ENGINE_LABELS } from './types';
import { listActiveEnginesInCatalog } from './engine-registry';
import { buildMasterPlannerOrbRecommendations } from './master-planner-orb';
import { buildParallelFuturesOrbRecommendations } from './parallel-futures-orb';
import { isUnderConstruction } from './world-construction';
import { ATLAS_HIDDEN_DISCOVERIES } from './world-discovery';

function uid(): string {
  return `orb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Studio Orb™ World Guide — curator of Studio World™ */
export function buildAtlasOrbRecommendations(
  nodes: AtlasNode[],
  discovery?: AtlasDiscoveryStore,
  options?: { mapMode?: string; selectedPlanId?: string | null }
): AtlasOrbRecommendation[] {
  if (discovery && options?.mapMode === 'parallel-futures') {
    return buildParallelFuturesOrbRecommendations(
      discovery.parallelFutures ?? [],
      discovery.activeParallelFutureId
    );
  }
  if (
    discovery &&
    (options?.mapMode === 'master-planner' || options?.mapMode === 'future-vision')
  ) {
    return buildMasterPlannerOrbRecommendations(nodes, discovery, options.selectedPlanId ?? undefined);
  }
  const recs: AtlasOrbRecommendation[] = [];
  const active = nodes.filter((n) => n.activity === 'generating' || n.activity === 'pulse');
  const fogged = nodes.filter((n) => n.fogged && n.unlocked);
  const constructing = (discovery?.activeConstructions ?? []).filter((j) =>
    isUnderConstruction(j.phase)
  );
  const engines = listActiveEnginesInCatalog(nodes);

  const command = nodes.find((n) => n.id.includes('studio-command-center') && n.level === 1);
  if (command?.activity === 'pulse') {
    recs.push({
      id: uid(),
      message: 'Studio Command Center™ is highly active — Organization Pulse Core awaits your review.',
      targetNodeId: command.id,
      priority: 'high',
      kind: 'attention',
      engineId: 'architecture-auditor',
    });
  }

  const creative = nodes.find((n) => n.flagshipId === 'creative-direction-studio' && n.level === 1);
  if (creative && (creative.activity === 'generating' || creative.livingSignals?.includes('ai-glow'))) {
    recs.push({
      id: uid(),
      message: 'Creative Direction Studio™ — Scene Stack™ assembling Golden Build layers. AI is working.',
      targetNodeId: creative.id,
      priority: 'high',
      kind: 'ai-active',
      engineId: 'scene-stack',
    });
  }

  const archives = nodes.find((n) => n.flagshipId === 'studio-archives' && n.level === 1);
  if (archives) {
    recs.push({
      id: uid(),
      message: 'Studio Archives™ — Museum exhibits illuminated. New assets ready in Asset Registry™.',
      targetNodeId: archives.id,
      priority: 'medium',
      kind: 'opportunity',
      engineId: 'asset-registry',
    });
  }

  if (constructing.length > 0) {
    const job = constructing[0]!;
    recs.push({
      id: uid(),
      message: `${job.displayName} is under construction (${job.phase.replace(/-/g, ' ')}) — watch the city evolve.`,
      targetNodeId: job.nodeId,
      priority: 'high',
      kind: 'construction',
      engineId: 'blueprint-archive',
    });
  }

  if (discovery?.masterPlan.length) {
    recs.push({
      id: uid(),
      message: `Master Planner™ — ${discovery.masterPlan.length} future districts reserved. Simulate before you generate.`,
      targetNodeId: 'atlas-world-root',
      priority: 'medium',
      kind: 'master-plan',
      engineId: 'expedition-hub',
    });
  }

  const expedition = nodes.find((n) => n.flagshipId === 'expedition-hub' && n.level === 1);
  if (expedition) {
    recs.push({
      id: uid(),
      message: 'Expedition Hub™ — guided expansions available. Reserve land before building.',
      targetNodeId: expedition.id,
      priority: 'medium',
      kind: 'expedition',
      engineId: 'expedition-hub',
    });
  }

  const intel = nodes.find(
    (n) => n.displayName.includes('Intelligence') || n.id.includes('experience-observatory')
  );
  if (intel) {
    recs.push({
      id: uid(),
      message: 'Experience Intelligence™ flagged three destinations worth your attention today.',
      targetNodeId: intel.id,
      priority: 'medium',
      kind: 'opportunity',
      engineId: 'experience-intelligence',
    });
  }

  const undiscovered = ATLAS_HIDDEN_DISCOVERIES.filter(
    (d) => !discovery?.hiddenFinds.includes(d.id)
  );
  if (undiscovered.length > 0) {
    recs.push({
      id: uid(),
      message: 'Fog of Discovery™ hides observatories and monuments — walk the campus to find them.',
      targetNodeId: undiscovered[0]!.parentId,
      priority: 'low',
      kind: 'discovery',
    });
  }

  if (fogged.length > 0) {
    recs.push({
      id: uid(),
      message: `${fogged.length} wings remain fogged — expand via Expedition Hub™ to reveal them.`,
      targetNodeId: fogged[0]!.id,
      priority: 'low',
      kind: 'expansion',
      engineId: 'expedition-hub',
    });
  }

  if (engines.includes('creative-budget')) {
    recs.push({
      id: uid(),
      message: 'Creative Budget™ — switch to budget mode to see spend across generating buildings.',
      targetNodeId: creative?.id ?? 'atlas-world-root',
      priority: 'low',
      kind: 'attention',
      engineId: 'creative-budget',
    });
  }

  if (active.length === 0 && constructing.length === 0) {
    recs.push({
      id: uid(),
      message: `Walk the campus — ${ATLAS_ENGINE_LABELS['company-genome']} remembers every expansion you've made.`,
      targetNodeId: 'atlas-world-root',
      priority: 'low',
      kind: 'discovery',
      engineId: 'company-genome',
    });
  }

  return recs.slice(0, 6);
}
