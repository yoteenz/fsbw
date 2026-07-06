import { queryEngineeringExcellence } from './discovery-engine';
import { summarizeEngineeringExcellence } from './report-engine';
import {
  ensureOrganizationEngineeringExcellenceProfile,
  getOrganizationEngineeringExcellenceProfile,
} from './store';
import type { EngineeringExcellenceDockAdvice } from './types';

export function resolveEngineeringExcellenceAdvice(
  input: string,
  organizationId: string
): EngineeringExcellenceDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationEngineeringExcellenceProfile(organizationId) ??
    ensureOrganizationEngineeringExcellenceProfile(organizationId);

  if (/engineering excellence|engineering score|engineering dashboard|engineering health/i.test(trimmed)) {
    return {
      response: summarizeEngineeringExcellence(profile),
      concierge: 'Chief Concierge',
      overallEngineeringScore: profile.overallEngineeringScore,
    };
  }

  if (/executive briefing|engineering achievements|growing risks|suggested investments/i.test(trimmed)) {
    return {
      response: profile.executiveBrief.studioIntelligenceSummary,
      concierge: 'Chief Concierge',
      overallEngineeringScore: profile.overallEngineeringScore,
    };
  }

  if (/engineering culture|zero.regression|celebrate|craftsmanship|world.class/i.test(trimmed)) {
    const celebrations = profile.cultureCelebrations.slice(0, 3);
    if (celebrations.length > 0) {
      return {
        response: celebrations.map((c) => `${c.title}: ${c.impactSummary}`).join(' · '),
        concierge: 'Chief Concierge',
      };
    }
  }

  if (/historical excellence|quality improving|organization lifetime/i.test(trimmed)) {
    const lifetime = profile.historicalExcellence.find((h) => h.period === 'organization-lifetime');
    if (lifetime) {
      return { response: `${lifetime.periodLabel}: ${lifetime.engineeringScore}% · ${lifetime.summary}`, concierge: 'Chief Concierge' };
    }
  }

  const hits = queryEngineeringExcellence(trimmed, profile, 3);
  if (hits.length > 0 && /find|search|show|list|engineering|health|kpi/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.label} (${h.matchReason})`).join(' · '),
      concierge: 'Chief Concierge',
      overallEngineeringScore: profile.overallEngineeringScore,
    };
  }

  return null;
}

export function buildProactiveExcellenceSuggestion(organizationId: string): string | null {
  const profile = getOrganizationEngineeringExcellenceProfile(organizationId);
  if (!profile) return null;
  return summarizeEngineeringExcellence(profile);
}

export function buildEngineeringExcellenceOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationEngineeringExcellenceProfile(organizationId);
  return profile.dockExcellenceLine;
}
