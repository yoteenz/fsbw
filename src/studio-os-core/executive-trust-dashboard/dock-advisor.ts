import { explainSystemTrust, queryExecutiveTrustDashboard } from './discovery-engine';
import { summarizeExecutiveTrustDashboard } from './summary-engine';
import {
  ensureOrganizationExecutiveTrustDashboardProfile,
  getOrganizationExecutiveTrustDashboardProfile,
  refreshTrustDashboard,
} from './store';
import type { ExecutiveTrustDashboardDockAdvice } from './types';

export function resolveExecutiveTrustDashboardAdvice(
  input: string,
  organizationId: string
): ExecutiveTrustDashboardDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationExecutiveTrustDashboardProfile(organizationId) ??
    ensureOrganizationExecutiveTrustDashboardProfile(organizationId);

  if (/trust dashboard|executive trust|organizational trust|how much confidence|trust score/i.test(trimmed)) {
    return {
      response: summarizeExecutiveTrustDashboard(profile),
      concierge: 'Chief Concierge',
      overallTrustScore: profile.overallTrustScore,
    };
  }

  if (/systems.*attention|require attention|at risk/i.test(trimmed)) {
    const attention = profile.executiveSummary.systemsRequiringAttention;
    return {
      response:
        attention.length > 0
          ? `${attention.length} systems need attention: ${attention.join(' · ')}.`
          : 'All systems within trust threshold.',
      concierge: 'Chief Concierge',
      overallTrustScore: profile.overallTrustScore,
    };
  }

  if (/highest risk|operational risk|biggest risk/i.test(trimmed)) {
    const risks = profile.executiveSummary.highestOperationalRisks;
    return {
      response: risks.length > 0 ? risks.join(' · ') : 'No critical operational risks detected.',
      concierge: 'Chief Concierge',
    };
  }

  if (/refresh trust|update trust dashboard/i.test(trimmed)) {
    refreshTrustDashboard(organizationId);
    return {
      response: `Trust dashboard refreshed — overall ${profile.overallTrustScore}% · ${profile.systemsAtRisk} at risk.`,
      concierge: 'Chief Concierge',
      overallTrustScore: profile.overallTrustScore,
    };
  }

  const explainMatch = trimmed.match(/explain trust (?:for |in )?(.+)/i);
  if (explainMatch) {
    const hits = queryExecutiveTrustDashboard(explainMatch[1], profile, 1);
    if (hits[0]?.type === 'system') {
      return { response: explainSystemTrust(hits[0].id, profile) ?? hits[0].label, concierge: 'Chief Concierge' };
    }
  }

  const hits = queryExecutiveTrustDashboard(trimmed, profile, 3);
  if (hits.length > 0 && /find|search|show|list/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.label} (${h.matchReason})`).join(' · '),
      concierge: 'Chief Concierge',
      overallTrustScore: profile.overallTrustScore,
    };
  }

  return null;
}

export function buildProactiveExecutiveTrustDashboardSuggestion(organizationId: string): string | null {
  const profile = getOrganizationExecutiveTrustDashboardProfile(organizationId);
  if (!profile) return null;
  return profile.executiveSummary.studioIntelligenceBriefing;
}

export function buildExecutiveTrustDashboardOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationExecutiveTrustDashboardProfile(organizationId);
  return profile.dockTrustLine;
}
