import { summarizePredictiveOrganizationProfile } from './predictive-builder';
import { ensureOrganizationPredictiveProfile, getOrganizationPredictiveProfile } from './store';
import type { PredictiveOrganizationDockAdvice } from './types';

export function resolvePredictiveOrganizationAdvice(
  input: string,
  organizationId: string
): PredictiveOrganizationDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationPredictiveProfile(organizationId) ?? ensureOrganizationPredictiveProfile(organizationId);

  if (/predictive organization|forecast|prediction|anticipate future|prepare for tomorrow/i.test(trimmed)) {
    return {
      response: summarizePredictiveOrganizationProfile(profile),
      concierge: 'Chief Concierge',
      predictiveScore: profile.predictiveScore,
      predictionsActive: profile.predictionsActive,
    };
  }

  if (/30.?day|90.?day|annual outlook|executive forecast/i.test(trimmed)) {
    const forecasts = profile.executiveForecasts.filter((f) =>
      /30-day|90-day|annual/.test(f.horizon) ? /30|90|annual/i.test(trimmed) : true
    );
    return {
      response: forecasts
        .slice(0, 3)
        .map((f) => `${f.label}: ${f.summary} (${f.probabilityPct}% · ${f.riskLevel} risk)`)
        .join('\n'),
      concierge: 'Chief Concierge',
      predictiveScore: profile.predictiveScore,
    };
  }

  if (/busy season|busiest quarter|peak season/i.test(trimmed)) {
    const pred = profile.predictions.find((p) => p.category === 'busy-season');
    const forecast = profile.executiveForecasts.find((f) => f.horizon === '30-day');
    return {
      response: [pred?.prediction, pred?.reasoning, forecast?.summary].filter(Boolean).join(' '),
      concierge: 'Chief Concierge',
    };
  }

  if (/hiring|headcount|staff/i.test(trimmed)) {
    const pred = profile.predictions.find((p) => p.category === 'hiring');
    return {
      response: pred
        ? `${pred.prediction} Reasoning: ${pred.reasoning} Recommended: ${pred.recommendedAction} (${pred.confidencePct}% confidence).`
        : 'No hiring prediction active — capacity within historical range.',
      concierge: 'Chief Concierge',
    };
  }

  if (/marketing|campaign|promotional/i.test(trimmed)) {
    const pred = profile.predictions.find((p) => p.category === 'marketing');
    const intel = profile.intelligenceSnapshots.find((s) => s.domain === 'marketing-results');
    return {
      response: [pred?.prediction, intel?.summary].filter(Boolean).join(' ') || 'Marketing performance stable.',
      concierge: 'Chief Concierge',
    };
  }

  if (/churn|customer risk|retention/i.test(trimmed)) {
    const pred = profile.predictions.find((p) => p.category === 'customer-churn');
    return {
      response: pred
        ? `${pred.prediction} ${pred.recommendedAction} (${pred.confidencePct}% confidence).`
        : 'Customer churn risk within normal range.',
      concierge: 'Chief Concierge',
    };
  }

  if (/burnout|founder workload|cognitive/i.test(trimmed)) {
    const pred = profile.predictions.find((p) => p.category === 'founder-burnout');
    const intel = profile.intelligenceSnapshots.find((s) => s.domain === 'founder-workload');
    return {
      response: [pred?.prediction, intel?.summary, pred?.recommendedAction].filter(Boolean).join(' '),
      concierge: 'Chief Concierge',
    };
  }

  if (/cash flow|revenue trend|financial/i.test(trimmed)) {
    const pred = profile.predictions.find((p) => p.category === 'cash-flow');
    const intel = profile.intelligenceSnapshots.find((s) => s.domain === 'revenue-trends');
    return {
      response: [pred?.prediction, intel?.summary].filter(Boolean).join(' ') || 'Revenue trends stable.',
      concierge: 'Chief Concierge',
    };
  }

  if (/capacity|operations|department support|bottleneck/i.test(trimmed)) {
    const pred = profile.predictions.find((p) => p.category === 'capacity');
    return {
      response: pred
        ? `${pred.recommendedAction} Reasoning: ${pred.reasoning} (${pred.confidencePct}% confidence).`
        : 'Department capacity within historical limits.',
      concierge: 'Chief Concierge',
    };
  }

  if (/launch|preparation|next week/i.test(trimmed)) {
    const pred = profile.predictions.find((p) => p.category === 'launch');
    return {
      response: pred
        ? `${pred.recommendedAction} ${pred.reasoning} (${pred.confidencePct}% confidence).`
        : 'No launch window predicted in current intelligence cycle.',
      concierge: 'Chief Concierge',
    };
  }

  if (/risk|growth probability|readiness|automation|knowledge expansion/i.test(trimmed)) {
    return {
      response: profile.executiveForecasts
        .filter((f) =>
          /risk|growth|readiness|automation|knowledge/.test(trimmed)
            ? new RegExp(trimmed.split(/\s+/)[0] ?? '', 'i').test(f.label + f.horizon)
            : true
        )
        .slice(0, 4)
        .map((f) => `${f.label}: ${f.summary}`)
        .join('\n'),
      concierge: 'Chief Concierge',
      predictiveScore: profile.predictiveScore,
    };
  }

  if (/historical pattern|trend|analyze|intelligence domain/i.test(trimmed)) {
    return {
      response: profile.intelligenceSnapshots
        .slice(0, 6)
        .map((s) => `${s.label} (${s.trend}): ${s.summary.slice(0, 80)}…`)
        .join('\n'),
      concierge: 'Chief Concierge',
    };
  }

  return null;
}

export function listPredictiveOrganizationDockSuggestions(organizationId: string): string[] {
  ensureOrganizationPredictiveProfile(organizationId);
  return [
    'What does Predictive Organization forecast for the next 30 days?',
    'Are there hiring or capacity predictions I should know about?',
    'What is our risk forecast and growth probability?',
    'Based on historical patterns, what should we prepare for next week?',
  ].slice(0, 4);
}

export function buildProactivePredictiveOrganizationSuggestion(organizationId: string): string | null {
  const profile = getOrganizationPredictiveProfile(organizationId);
  if (!profile) return null;
  return summarizePredictiveOrganizationProfile(profile);
}

export function buildPredictiveOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationPredictiveProfile(organizationId);
  return profile.dockPredictionLine;
}
