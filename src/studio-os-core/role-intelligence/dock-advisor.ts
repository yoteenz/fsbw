import {
  explainRoleIntelligence,
  getRoleEvolutionSummary,
  getSelectedRoleSummary,
  getTitleWorkGapSummary,
  queryRoleIntelligence,
  summarizeRoleSearch,
} from './discovery-engine';
import { summarizeRoleIntelligence } from './role-builder';
import {
  ensureOrganizationRoleIntelligenceProfile,
  getOrganizationRoleIntelligenceProfile,
  selectRole,
} from './store';
import type { RoleIntelligenceDockAdvice } from './types';

export function resolveRoleIntelligenceAdvice(
  input: string,
  organizationId: string
): RoleIntelligenceDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationRoleIntelligenceProfile(organizationId) ??
    ensureOrganizationRoleIntelligenceProfile(organizationId);

  if (
    /role intelligence|understand work|not titles|title mismatch|title\/work|actual responsibilities|role evolution/i.test(
      trimmed
    )
  ) {
    return {
      response: summarizeRoleIntelligence(profile),
      concierge: 'Chief Concierge',
      intelligenceScore: profile.intelligenceScore,
      rolesDefined: profile.rolesDefined,
    };
  }

  if (/title.*perform|same title|different work|title vs work|work gap/i.test(trimmed)) {
    return {
      response: getTitleWorkGapSummary(profile),
      concierge: 'Chief Concierge',
      rolesDefined: profile.rolesDefined,
    };
  }

  if (/role evolution|evolving role|organization grows|roles evolve/i.test(trimmed)) {
    return {
      response: getRoleEvolutionSummary(profile),
      concierge: 'Chief Concierge',
      intelligenceScore: profile.intelligenceScore,
    };
  }

  const explainMatch = trimmed.match(/explain role (.+)/i);
  if (explainMatch) {
    const hits = queryRoleIntelligence(explainMatch[1], profile, 1);
    if (hits[0]?.type === 'role') {
      selectRole(organizationId, hits[0].id);
      return {
        response: explainRoleIntelligence(hits[0].id, profile) ?? hits[0].label,
        concierge: 'Chief Concierge',
      };
    }
  }

  const selectedSummary = getSelectedRoleSummary(profile);
  if (selectedSummary && /selected role|current role definition/i.test(trimmed)) {
    return { response: selectedSummary, concierge: 'Chief Concierge' };
  }

  const hits = queryRoleIntelligence(trimmed, profile, 3);
  if (hits.length > 0 && /find|search|show|list|role|responsibilit|workflow|dispatcher|receptionist|estimator/i.test(trimmed)) {
    return {
      response: summarizeRoleSearch(profile, trimmed),
      concierge: 'Chief Concierge',
      intelligenceScore: profile.intelligenceScore,
      rolesDefined: profile.rolesDefined,
    };
  }

  const insight = profile.insights.find((i) => trimmed.toLowerCase().includes(i.insight.toLowerCase().slice(0, 24)));
  if (insight) {
    return {
      response: `${insight.insight} Action: ${insight.recommendedAction}`,
      concierge: 'Chief Concierge',
    };
  }

  return null;
}

export function buildProactiveRoleIntelligenceSuggestion(organizationId: string): string | null {
  const profile = getOrganizationRoleIntelligenceProfile(organizationId);
  if (!profile) return null;
  return summarizeRoleIntelligence(profile);
}

export function buildRoleIntelligenceOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationRoleIntelligenceProfile(organizationId);
  return profile.dockRoleLine;
}
