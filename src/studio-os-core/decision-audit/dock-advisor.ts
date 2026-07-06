import { explainDecisionRecord, queryDecisionAudit } from './discovery-engine';
import { explainDecision, summarizeDecisionAudit } from './timeline-engine';
import {
  ensureOrganizationDecisionAuditProfile,
  getOrganizationDecisionAuditProfile,
  selectDecision,
} from './store';
import type { DecisionAuditDockAdvice } from './types';

export function resolveDecisionAuditAdvice(input: string, organizationId: string): DecisionAuditDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationDecisionAuditProfile(organizationId) ?? ensureOrganizationDecisionAuditProfile(organizationId);

  if (/decision audit|why did this happen|who approved|decision timeline|explain.*decision|accountability/i.test(trimmed)) {
    return {
      response: summarizeDecisionAudit(profile),
      concierge: 'Chief Concierge',
      accountabilityScore: profile.accountabilityScore,
      totalDecisions: profile.totalDecisions,
    };
  }

  if (/approve workflow|reject marketplace|approve refund|escalate risk/i.test(trimmed)) {
    const match = profile.decisions.find((d) =>
      trimmed.toLowerCase().includes(d.decisionType.replace(/-/g, ' ').split(' ')[0])
    );
    if (match) {
      selectDecision(organizationId, match.id);
      return {
        response: explainDecision(match),
        concierge: 'Chief Concierge',
        totalDecisions: profile.totalDecisions,
      };
    }
  }

  const explainMatch = trimmed.match(/explain decision (.+)/i);
  if (explainMatch) {
    const hits = queryDecisionAudit(explainMatch[1], profile, 1);
    if (hits[0]) {
      return {
        response: explainDecisionRecord(hits[0].id, profile) ?? hits[0].label,
        concierge: 'Chief Concierge',
      };
    }
  }

  const hits = queryDecisionAudit(trimmed, profile, 3);
  if (hits.length > 0 && /find|search|show|list|decision/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.label} (${h.matchReason})`).join(' · '),
      concierge: 'Chief Concierge',
      accountabilityScore: profile.accountabilityScore,
      totalDecisions: profile.totalDecisions,
    };
  }

  return null;
}

export function buildProactiveDecisionAuditSuggestion(organizationId: string): string | null {
  const profile = getOrganizationDecisionAuditProfile(organizationId);
  if (!profile) return null;
  return summarizeDecisionAudit(profile);
}

export function buildDecisionAuditOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationDecisionAuditProfile(organizationId);
  return profile.dockDecisionAuditLine;
}
