import type { AtlasOrbRecommendation, AtlasParallelFuture, MergeConflict } from './types';

function uid(): string {
  return `orb-fm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Orb™ Design Partner — merge recommendations with WHY. */
export function buildFutureMergeOrbRecommendations(
  draft: AtlasParallelFuture | undefined,
  conflicts: MergeConflict[],
  sources: AtlasParallelFuture[]
): AtlasOrbRecommendation[] {
  const recs: AtlasOrbRecommendation[] = [];

  if (draft) {
    const navGain = draft.analysis.navigationEfficiency - Math.min(...sources.map((s) => s.analysis.navigationEfficiency));
    if (navGain > 0) {
      recs.push({
        id: uid(),
        message: `Merging these districts improves navigation efficiency by ${navGain}% — walking distance optimized.`,
        targetNodeId: draft.buildings[0] ? `pf-node-${draft.buildings[0].id}` : 'atlas-world-root',
        priority: 'high',
        kind: 'placement',
        engineId: 'experience-intelligence',
      });
    }

    if (draft.genome && draft.genome.brandConsistency < 80) {
      recs.push({
        id: uid(),
        message: 'This lighting system conflicts with your Company Genome™ — unify atmosphere presets before commit.',
        targetNodeId: 'atlas-world-root',
        priority: 'high',
        kind: 'attention',
        engineId: 'company-genome',
      });
    }

    if (draft.analysis.marketplacePotential.includes('142') || draft.analysis.marketplacePotential.includes('84')) {
      recs.push({
        id: uid(),
        message: `This Blueprint mix increases Marketplace value to ${draft.analysis.marketplacePotential} — experimental wings export well.`,
        targetNodeId: 'atlas-world-root',
        priority: 'medium',
        kind: 'opportunity',
        engineId: 'asset-registry',
      });
    }

    recs.push({
      id: uid(),
      message: 'I recommend relocating Innovation Hall closer to Studio Archives™ — improves AI traffic and discovery.',
      targetNodeId: draft.buildings.find((b) => /Innovation|Archive/i.test(b.label))
        ? `pf-node-${draft.buildings.find((b) => /Innovation|Archive/i.test(b.label))!.id}`
        : 'atlas-world-root',
      priority: 'medium',
      kind: 'placement',
    });
  }

  const critical = conflicts.filter((c) => !c.resolved && c.severity === 'critical');
  for (const c of critical.slice(0, 2)) {
    recs.push({
      id: uid(),
      message: `${c.description} Recommendation: ${c.recommendation}`,
      targetNodeId: 'atlas-world-root',
      priority: 'high',
      kind: 'simulation',
    });
  }

  recs.push({
    id: uid(),
    message: 'Drag buildings on the Merge Lab™ table — live metrics update with every design decision.',
    targetNodeId: 'atlas-world-root',
    priority: 'low',
    kind: 'master-plan',
  });

  return recs.slice(0, 6);
}
