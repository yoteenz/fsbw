import type { AtlasDiscoveryStore, AtlasMasterPlanReservation, AtlasNode, AtlasOrbRecommendation } from './types';
import { estimatePlanBudget } from './master-planner-budget';
import { buildExpansionRecommendations } from './master-planner-expansion';
import { buildWorldForecast, forecastHorizonLabel } from './master-planner-forecast';
import { isPlanApprovedForConstruction, planPhaseProgress } from './master-planner-phases';

function uid(): string {
  return `orb-mp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Studio Orb™ as Master Planner — campus architect advisor */
export function buildMasterPlannerOrbRecommendations(
  nodes: AtlasNode[],
  discovery: AtlasDiscoveryStore,
  selectedPlanId?: string
): AtlasOrbRecommendation[] {
  const recs: AtlasOrbRecommendation[] = [];
  const plan = discovery.masterPlan.find((p) => p.id === selectedPlanId) ?? discovery.masterPlan[0];
  const forecast = buildWorldForecast(discovery.forecastHorizon, discovery);
  const expansions = buildExpansionRecommendations(nodes, discovery.masterPlan);

  recs.push({
    id: uid(),
    message: `World Forecast™ (${forecastHorizonLabel(discovery.forecastHorizon)}): ${forecast.buildingCount} buildings · ${forecast.districtCount} districts — ${forecast.narrative.slice(0, 80)}…`,
    targetNodeId: 'atlas-world-root',
    priority: 'medium',
    kind: 'forecast',
    engineId: 'creative-budget',
  });

  if (plan) {
    const budget = plan.budget ?? estimatePlanBudget(plan);
    const progress = planPhaseProgress(plan.phase ?? 'reserved-land');
    recs.push({
      id: uid(),
      message: `${plan.label} at ${progress}% — Gen ${budget.generationCost} · Budget +${budget.budgetImpactPct}% · Equity ${budget.projectedEquity}`,
      targetNodeId: `plan-${plan.id}`,
      priority: 'high',
      kind: 'budget',
      engineId: 'creative-budget',
    });

    if (!isPlanApprovedForConstruction(plan.phase ?? 'reserved-land')) {
      recs.push({
        id: uid(),
        message: 'Run Simulation Mode™ before approving blueprint — generation should be the final step.',
        targetNodeId: `plan-${plan.id}`,
        priority: 'high',
        kind: 'simulation',
      });
    }

    if (plan.mapX > 55) {
      recs.push({
        id: uid(),
        message: 'Consider shifting east — improves walking distance to Command Center™ and AI traffic balance.',
        targetNodeId: `plan-${plan.id}`,
        priority: 'medium',
        kind: 'placement',
      });
    }
  }

  for (const exp of expansions.slice(0, 2)) {
    recs.push({
      id: uid(),
      message: exp.message,
      targetNodeId: 'atlas-world-root',
      priority: exp.priority,
      kind: 'expansion',
      engineId: 'expedition-hub',
    });
  }

  if (discovery.futureVisionConcepts.length === 0) {
    recs.push({
      id: uid(),
      message: 'Future Vision™ — sketch a Prototype District™ concept without committing generation budget.',
      targetNodeId: 'atlas-world-root',
      priority: 'low',
      kind: 'master-plan',
    });
  }

  recs.push({
    id: uid(),
    message: 'Add a transit hub or skybridge — architectural balance improves navigation and discoverability.',
    targetNodeId: plan ? `plan-${plan.id}` : 'atlas-world-root',
    priority: 'low',
    kind: 'placement',
  });

  return recs.slice(0, 6);
}

export function resolveSelectedPlan(
  discovery: AtlasDiscoveryStore,
  selectedNodeId?: string | null
): AtlasMasterPlanReservation | undefined {
  if (!selectedNodeId) return discovery.masterPlan[0];
  const planId = selectedNodeId.startsWith('plan-')
    ? selectedNodeId.replace('plan-', '')
    : selectedNodeId;
  return discovery.masterPlan.find((p) => p.id === planId) ?? discovery.masterPlan[0];
}
