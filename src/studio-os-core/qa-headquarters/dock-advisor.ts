import { explainTrustScore, queryQaHeadquarters } from './discovery-engine';
import { summarizeQaHeadquarters } from './engine-profile-builder';
import {
  ensureOrganizationQaHeadquartersProfile,
  getOrganizationQaHeadquartersProfile,
  triggerContinuousValidation,
} from './store';
import type { QaHeadquartersDockAdvice } from './types';

export function resolveQaHeadquartersAdvice(input: string, organizationId: string): QaHeadquartersDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationQaHeadquartersProfile(organizationId) ??
    ensureOrganizationQaHeadquartersProfile(organizationId);

  if (/qa headquarters|trust score|quality assurance|trust infrastructure|organizational integrity/i.test(trimmed)) {
    return {
      response: summarizeQaHeadquarters(profile),
      concierge: 'Chief Concierge',
      overallTrustScore: profile.overallTrustScore,
    };
  }

  if (/run validation|validate change|continuous validation|trigger qa/i.test(trimmed)) {
    triggerContinuousValidation(organizationId, 'new-workflow');
    return {
      response: 'Continuous validation triggered — QA Inspector notified · simulation gate active.',
      concierge: 'Chief Concierge',
      overallTrustScore: profile.overallTrustScore,
    };
  }

  if (/trust score|how trusted|organization trust/i.test(trimmed)) {
    const top = profile.trustScores
      .slice()
      .sort((a, b) => b.scorePct - a.scorePct)
      .slice(0, 3)
      .map((t) => `${t.label} ${t.scorePct}%`)
      .join(' · ');
    return {
      response: `Overall trust ${profile.overallTrustScore}% — strongest: ${top}.`,
      concierge: 'Chief Concierge',
      overallTrustScore: profile.overallTrustScore,
    };
  }

  if (/at.?risk|declining trust|low trust/i.test(trimmed)) {
    const atRisk = profile.trustScores.filter((t) => t.status !== 'trusted');
    if (atRisk.length === 0) {
      return { response: 'All systems within trust threshold — QA layer protecting quietly.', concierge: 'Chief Concierge' };
    }
    return {
      response: `Monitoring: ${atRisk.map((t) => `${t.label} ${t.scorePct}%`).join(' · ')}.`,
      concierge: 'Chief Concierge',
    };
  }

  const explainMatch = trimmed.match(/explain trust (?:for |in )?(.+)/i);
  if (explainMatch) {
    const hits = queryQaHeadquarters(explainMatch[1], profile, 1);
    if (hits[0]?.type === 'trust') {
      return { response: explainTrustScore(hits[0].id, profile) ?? hits[0].label, concierge: 'Chief Concierge' };
    }
  }

  const hits = queryQaHeadquarters(trimmed, profile, 3);
  if (hits.length > 0 && /find|search|show|list|which/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.label} (${h.matchReason})`).join(' · '),
      concierge: 'Chief Concierge',
      overallTrustScore: profile.overallTrustScore,
    };
  }

  return null;
}

export function buildProactiveQaHeadquartersSuggestion(organizationId: string): string | null {
  const profile = getOrganizationQaHeadquartersProfile(organizationId);
  if (!profile) return null;
  return summarizeQaHeadquarters(profile);
}

export function buildQaHeadquartersOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationQaHeadquartersProfile(organizationId);
  return profile.dockQaLine;
}
