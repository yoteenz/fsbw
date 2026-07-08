import type { AtlasOrbRecommendation, AtlasParallelFuture } from './types';

function uid(): string {
  return `orb-pf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Orb™ strategic advisor for Parallel Futures™ — always explains WHY. */
export function buildParallelFuturesOrbRecommendations(
  futures: AtlasParallelFuture[],
  activeFutureId?: string | null
): AtlasOrbRecommendation[] {
  const recs: AtlasOrbRecommendation[] = [];
  const byArchetype = Object.fromEntries(futures.map((f) => [f.archetype, f])) as Record<
    string,
    AtlasParallelFuture | undefined
  >;

  const b = byArchetype['future-b'];
  const a = byArchetype['future-a'];
  const c = byArchetype['future-c'];
  const d = byArchetype['future-d'];

  if (b && c && b.analysis.assetReusePct < c.analysis.assetReusePct) {
    recs.push({
      id: uid(),
      message: `I recommend Future B (${b.label}) because it maximizes long-term expansion — ${b.analysis.expansionFlexibility}% flexibility vs ${c.analysis.expansionFlexibility}% for Lean Startup.`,
      targetNodeId: `pf-${b.id}`,
      priority: 'high',
      kind: 'expansion',
      engineId: 'creative-budget',
    });
  }

  if (c) {
    recs.push({
      id: uid(),
      message: `Future C (${c.label}) minimizes Creative Budget (${c.analysis.generationCostEstimate}) while preserving ${c.analysis.expansionFlexibility}% expansion flexibility.`,
      targetNodeId: `pf-${c.id}`,
      priority: 'high',
      kind: 'budget',
      engineId: 'creative-budget',
    });
  }

  if (a) {
    recs.push({
      id: uid(),
      message: `Future A (${a.label}) offers the strongest long-term brand presence — nav ${a.analysis.navigationEfficiency}% · equity ${a.analysis.creativeEquity}.`,
      targetNodeId: `pf-${a.id}`,
      priority: 'medium',
      kind: 'placement',
      engineId: 'experience-intelligence',
    });
  }

  if (d) {
    recs.push({
      id: uid(),
      message: `Future D (${d.label}) introduces experimental headquarters with ${d.analysis.marketplacePotential} Marketplace potential — higher risk, higher upside.`,
      targetNodeId: `pf-${d.id}`,
      priority: 'medium',
      kind: 'opportunity',
      engineId: 'asset-registry',
    });
  }

  const active = futures.find((f) => f.id === activeFutureId) ?? futures[0];
  if (active) {
    recs.push({
      id: uid(),
      message: `Simulate ${active.label} before committing — walk ${active.buildings.length} future buildings with zero generation spend.`,
      targetNodeId: `pf-node-${active.buildings[0]?.id ?? active.id}`,
      priority: 'high',
      kind: 'simulation',
    });
  }

  recs.push({
    id: uid(),
    message: 'Compare all four futures side-by-side — no guesswork on cost, equity, or expansion.',
    targetNodeId: 'atlas-world-root',
    priority: 'medium',
    kind: 'master-plan',
    engineId: 'blueprint-archive',
  });

  return recs.slice(0, 6);
}
