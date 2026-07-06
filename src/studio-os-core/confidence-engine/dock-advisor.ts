import { explainRecommendation, queryConfidenceEngine } from './discovery-engine';
import { explainConfidenceChange, formatRecommendationConversation, summarizeConfidenceEngine } from './explorer-engine';
import {
  ensureOrganizationConfidenceEngineProfile,
  getOrganizationConfidenceEngineProfile,
  selectRecommendation,
} from './store';
import type { ConfidenceEngineDockAdvice } from './types';

export function resolveConfidenceEngineAdvice(input: string, organizationId: string): ConfidenceEngineDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationConfidenceEngineProfile(organizationId) ??
    ensureOrganizationConfidenceEngineProfile(organizationId);

  if (/confidence engine|how confident|confidence score|why do you believe|what do you know/i.test(trimmed)) {
    return {
      response: summarizeConfidenceEngine(profile),
      concierge: 'Chief Concierge',
      overallConfidenceScore: profile.overallConfidenceScore,
    };
  }

  if (/publish tuesday|publishing schedule|why tuesday/i.test(trimmed)) {
    const match = profile.recommendations.find((r) => r.category === 'publishing-schedule');
    if (match) {
      selectRecommendation(organizationId, match.id);
      return {
        response: formatRecommendationConversation(match),
        concierge: 'Chief Concierge',
        overallConfidenceScore: match.confidenceScore,
        confidenceLevel: match.confidenceLevel,
      };
    }
  }

  if (/confidence changed|confidence explorer|why.*confidence.*increase|yesterday.*today/i.test(trimmed)) {
    const entry = profile.explorerHistory[0];
    if (entry) {
      return { response: explainConfidenceChange(entry), concierge: 'Chief Concierge' };
    }
  }

  if (/not enough|limited evidence|low confidence|insufficient/i.test(trimmed)) {
    const low = profile.recommendations.find(
      (r) => r.confidenceLevel === 'low' || r.confidenceLevel === 'insufficient-evidence'
    );
    if (low) {
      return {
        response: `${low.recommendation} Confidence: ${low.confidenceScore}%. ${low.lowConfidenceDisclaimer ?? 'Based on limited evidence.'}`,
        concierge: 'Chief Concierge',
        confidenceLevel: low.confidenceLevel,
      };
    }
  }

  const explainMatch = trimmed.match(/explain (?:confidence|recommendation) (.+)/i);
  if (explainMatch) {
    const hits = queryConfidenceEngine(explainMatch[1], profile, 1);
    if (hits[0]) {
      return { response: explainRecommendation(hits[0].id, profile) ?? hits[0].label, concierge: 'Chief Concierge' };
    }
  }

  const hits = queryConfidenceEngine(trimmed, profile, 3);
  if (hits.length > 0 && /find|search|show|list|confidence/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.label} (${h.matchReason})`).join(' · '),
      concierge: 'Chief Concierge',
      overallConfidenceScore: profile.overallConfidenceScore,
    };
  }

  return null;
}

export function buildProactiveConfidenceEngineSuggestion(organizationId: string): string | null {
  const profile = getOrganizationConfidenceEngineProfile(organizationId);
  if (!profile) return null;
  return summarizeConfidenceEngine(profile);
}

export function buildConfidenceEngineOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationConfidenceEngineProfile(organizationId);
  return profile.dockConfidenceLine;
}
