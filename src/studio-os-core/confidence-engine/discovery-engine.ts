import type { OrganizationConfidenceEngineProfile } from './types';

export function queryConfidenceEngine(
  query: string,
  profile: OrganizationConfidenceEngineProfile,
  limit = 8
) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits = [];

  for (const r of profile.recommendations) {
    const hay = `${r.recommendation} ${r.categoryLabel} ${r.reasoningSummary} ${r.conversationalExplanation}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'recommendation' as const,
        id: r.id,
        label: r.recommendation.slice(0, 60),
        score: r.confidenceScore,
        matchReason: `${r.confidenceLevelLabel} · ${r.confidenceScore}% · ${r.riskLevel} risk`,
      });
    }
  }

  for (const e of profile.explorerHistory) {
    const hay = `${e.label} ${e.changeReasons.join(' ')}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'explorer' as const,
        id: e.id,
        label: e.label,
        score: Math.abs(e.delta) + 50,
        matchReason: `${e.previousScore}% → ${e.currentScore}% (${e.delta >= 0 ? '+' : ''}${e.delta})`,
      });
    }
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function explainRecommendation(recommendationId: string, profile: OrganizationConfidenceEngineProfile): string | null {
  const r = profile.recommendations.find((x) => x.id === recommendationId);
  if (!r) return null;
  return r.conversationalExplanation;
}
