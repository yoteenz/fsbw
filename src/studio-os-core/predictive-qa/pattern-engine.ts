import { PREDICTION_PATTERN_LABELS } from './constants';
import type { PreventativeAction, PreventativeActionPriority, PredictiveQaPattern, PredictiveQaPrediction } from './types';

export function buildPredictiveQaPatterns(predictions: PredictiveQaPrediction[]): PredictiveQaPattern[] {
  const byType = new Map<string, PredictiveQaPrediction[]>();

  for (const p of predictions) {
    const list = byType.get(p.patternType) ?? [];
    list.push(p);
    byType.set(p.patternType, list);
  }

  return Array.from(byType.entries()).map(([patternType, related]) => {
    const avgConfidence = Math.round(related.reduce((s, p) => s + p.confidencePct, 0) / related.length);
    const highSeverity = related.filter((p) => p.severity === 'high' || p.severity === 'critical').length;
    const sources = [...new Set(related.flatMap((p) => p.analysisSources))];

    let trend: PredictiveQaPattern['trend'] = 'stable';
    if (highSeverity >= 2 || avgConfidence >= 88) trend = 'accelerating';
    else if (related.length === 1 && avgConfidence < 82) trend = 'emerging';

    const type = related[0].patternType;
    return {
      id: `pattern-${patternType}`,
      patternType: type,
      label: PREDICTION_PATTERN_LABELS[type],
      description: `${related.length} related prediction${related.length === 1 ? '' : 's'} · avg confidence ${avgConfidence}% · ${highSeverity} high-severity signal${highSeverity === 1 ? '' : 's'}`,
      signalStrength: avgConfidence,
      relatedPredictions: related.length,
      trend,
      analysisSources: sources,
    };
  }).sort((a, b) => b.signalStrength - a.signalStrength);
}

export function buildPreventativeActions(predictions: PredictiveQaPrediction[]): PreventativeAction[] {
  return predictions
    .filter((p) => p.status === 'active')
    .slice(0, 8)
    .map((p) => {
      const priority: PreventativeActionPriority =
        p.severity === 'critical' ? 'immediate' : p.severity === 'high' ? 'this-week' : 'this-month';
      return {
        id: `action-${p.id}`,
        predictionId: p.id,
        action: p.recommendedPreventativeAction,
        priority,
        ownerDepartment: p.departmentsAffected[0] ?? 'Operations',
        estimatedEffort: p.severity === 'critical' ? '2–4 hours' : p.severity === 'high' ? '1–2 days' : '3–5 days',
      };
    })
    .sort((a, b) => {
      const order = { immediate: 0, 'this-week': 1, 'this-month': 2 };
      return order[a.priority] - order[b.priority];
    });
}

export function summarizePredictiveQa(profile: {
  predictiveQaScore: number;
  activePredictions: number;
  highRiskPredictions: number;
  preventableRisks: number;
  predictions: PredictiveQaPrediction[];
}): string {
  const top = profile.predictions.filter((p) => p.status === 'active')[0];
  const topLine = top ? ` Next: "${top.title}" (${top.confidencePct}% confidence · ${top.timelineLabel}).` : '';
  return `Predictive QA™ ${profile.predictiveQaScore}% future protection · ${profile.activePredictions} active predictions · ${profile.highRiskPredictions} high-risk · ${profile.preventableRisks} preventable now.${topLine}`;
}
