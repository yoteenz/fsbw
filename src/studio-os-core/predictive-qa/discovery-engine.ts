import type { OrganizationPredictiveQaProfile } from './types';

export function queryPredictiveQa(query: string, profile: OrganizationPredictiveQaProfile, limit = 8) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits = [];

  for (const p of profile.predictions) {
    const hay = `${p.title} ${p.statement} ${p.patternLabel} ${p.businessImpact} ${p.recommendedPreventativeAction}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'prediction' as const,
        id: p.id,
        label: p.title,
        score: p.confidencePct,
        matchReason: `${p.patternLabel} · ${p.confidencePct}% · ${p.timelineLabel}`,
      });
    }
  }

  for (const pat of profile.patterns) {
    const hay = `${pat.label} ${pat.description}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'pattern' as const,
        id: pat.id,
        label: pat.label,
        score: pat.signalStrength,
        matchReason: `${pat.relatedPredictions} predictions · ${pat.trend}`,
      });
    }
  }

  for (const a of profile.preventativeActions) {
    const hay = a.action.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'action' as const,
        id: a.id,
        label: a.action.slice(0, 60),
        score: a.priority === 'immediate' ? 95 : a.priority === 'this-week' ? 80 : 65,
        matchReason: `${a.priority} · ${a.ownerDepartment}`,
      });
    }
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function explainPrediction(predictionId: string, profile: OrganizationPredictiveQaProfile): string | null {
  const p = profile.predictions.find((x) => x.id === predictionId);
  if (!p) return null;
  return `${p.title}: ${p.statement} Impact: ${p.businessImpact} Action: ${p.recommendedPreventativeAction}`;
}
