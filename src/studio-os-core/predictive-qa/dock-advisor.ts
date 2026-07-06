import { explainPrediction, queryPredictiveQa } from './discovery-engine';
import { summarizePredictiveQa } from './pattern-engine';
import {
  ensureOrganizationPredictiveQaProfile,
  getOrganizationPredictiveQaProfile,
  mitigatePrediction,
} from './store';
import type { PredictiveQaDockAdvice } from './types';

export function resolvePredictiveQaAdvice(input: string, organizationId: string): PredictiveQaDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationPredictiveQaProfile(organizationId) ?? ensureOrganizationPredictiveQaProfile(organizationId);

  if (/predictive qa|future risk|tomorrow.*problem|prevent.*before|what will break|upcoming risk/i.test(trimmed)) {
    return {
      response: summarizePredictiveQa(profile),
      concierge: 'Chief Concierge',
      activePredictions: profile.activePredictions,
      predictiveQaScore: profile.predictiveQaScore,
    };
  }

  if (/onboarding.*bottleneck|staffing.*demand|brain.*inconsistent|trust.*declin/i.test(trimmed)) {
    const match = profile.predictions.find((p) => trimmed.toLowerCase().includes(p.patternType.replace(/-/g, ' ').split(' ')[0]));
    if (match) {
      return {
        response: `${match.statement} Confidence: ${match.confidencePct}%. Timeline: ${match.timelineLabel}. Prevent: ${match.recommendedPreventativeAction.slice(0, 120)}…`,
        concierge: 'Chief Concierge',
        activePredictions: profile.activePredictions,
      };
    }
  }

  if (/mitigate|start prevention|address prediction/i.test(trimmed)) {
    const top = profile.predictions.find((p) => p.status === 'active' && p.severity === 'critical')
      ?? profile.predictions.find((p) => p.status === 'active');
    if (top) {
      mitigatePrediction(organizationId, top.id);
      return {
        response: `Mitigation started for "${top.title}" — ${top.recommendedPreventativeAction.slice(0, 100)}…`,
        concierge: 'Chief Concierge',
      };
    }
  }

  const explainMatch = trimmed.match(/explain (?:prediction|risk) (.+)/i);
  if (explainMatch) {
    const hits = queryPredictiveQa(explainMatch[1], profile, 1);
    if (hits[0]) {
      return { response: explainPrediction(hits[0].id, profile) ?? hits[0].label, concierge: 'Chief Concierge' };
    }
  }

  const hits = queryPredictiveQa(trimmed, profile, 3);
  if (hits.length > 0 && /find|search|show|list|predict/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.label} (${h.matchReason})`).join(' · '),
      concierge: 'Chief Concierge',
      activePredictions: profile.activePredictions,
      predictiveQaScore: profile.predictiveQaScore,
    };
  }

  return null;
}

export function buildProactivePredictiveQaSuggestion(organizationId: string): string | null {
  const profile = getOrganizationPredictiveQaProfile(organizationId);
  if (!profile) return null;
  return summarizePredictiveQa(profile);
}

export function buildPredictiveQaOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationPredictiveQaProfile(organizationId);
  return profile.dockPredictiveQaLine;
}
