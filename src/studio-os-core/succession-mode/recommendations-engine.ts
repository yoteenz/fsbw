import type {
  KnowledgeDependencyNode,
  SuccessionDimensionScore,
  SuccessionRecommendation,
} from './types';

export function buildSuccessionRecommendations(
  dimensions: SuccessionDimensionScore[],
  dependencies: KnowledgeDependencyNode[]
): SuccessionRecommendation[] {
  const recs: SuccessionRecommendation[] = [];

  for (const dep of dependencies.filter((d) => d.riskLevel === 'high').slice(0, 3)) {
    recs.push({
      id: `rec-dep-${dep.id}`,
      type: dep.dependencyType === 'uncaptured' ? 'preserve-knowledge' : 'document-process',
      title: `Reduce ${dep.dependencyType.replace(/-/g, ' ')} risk: ${dep.area}`,
      rationale: dep.recommendation,
      priority: 'critical',
      targetBrainId: dep.preserveInBrainId,
    });
  }

  const weak = dimensions.filter((d) => d.scorePct < 60);
  for (const d of weak.slice(0, 4)) {
    const type =
      d.id === 'employee-readiness'
        ? 'institute-training'
        : d.id === 'leadership-delegation'
          ? 'delegate-leadership'
          : d.id === 'automation'
            ? 'automation'
            : d.id === 'documentation'
              ? 'missing-sop'
              : 'preserve-knowledge';

    recs.push({
      id: `rec-dim-${d.id}`,
      type,
      title: `Improve ${d.label} (${d.scorePct}%)`,
      rationale: d.improvesWhen,
      priority: d.scorePct < 45 ? 'critical' : 'high',
    });
  }

  if ((dimensions.find((d) => d.id === 'employee-readiness')?.scorePct ?? 0) < 70) {
    recs.push({
      id: 'rec-cross-train',
      type: 'cross-train',
      title: 'Identify employees requiring cross-training',
      rationale: 'Map founder-only tasks to backup roles via Studio Institute scenarios.',
      priority: 'high',
    });
  }

  return recs.slice(0, 8);
}
