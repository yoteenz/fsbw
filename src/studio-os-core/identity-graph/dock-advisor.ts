import { explainPersonById, queryIdentityGraph } from './discovery-engine';
import { summarizeIdentityGraph } from './graph-builder';
import {
  ensureOrganizationIdentityGraphProfile,
  getOrganizationIdentityGraphProfile,
  selectIdentityPerson,
} from './store';
import type { IdentityGraphDockAdvice } from './types';

export function resolveIdentityGraphAdvice(input: string, organizationId: string): IdentityGraphDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationIdentityGraphProfile(organizationId) ?? ensureOrganizationIdentityGraphProfile(organizationId);

  if (/identity graph|people graph|who works|organizational people|first.class citizen|living profile/i.test(trimmed)) {
    return {
      response: summarizeIdentityGraph(profile),
      concierge: 'Chief Concierge',
      graphScore: profile.graphScore,
      peopleCount: profile.peopleCount,
    };
  }

  if (/who is|find person|find people|search people|team member/i.test(trimmed)) {
    const hits = queryIdentityGraph(trimmed.replace(/who is|find person|find people|search people|team member/gi, '').trim() || 'founder', profile, 3);
    if (hits.length > 0) {
      return {
        response: hits.map((h) => `${h.label} (${h.matchReason})`).join(' · '),
        concierge: 'Chief Concierge',
        peopleCount: profile.peopleCount,
      };
    }
  }

  const explainMatch = trimmed.match(/explain (?:person|identity) (.+)/i);
  if (explainMatch) {
    const hits = queryIdentityGraph(explainMatch[1], profile, 1);
    if (hits[0]?.type === 'person') {
      selectIdentityPerson(organizationId, hits[0].id);
      return { response: explainPersonById(hits[0].id, profile) ?? hits[0].label, concierge: 'Chief Concierge' };
    }
  }

  const hits = queryIdentityGraph(trimmed, profile, 3);
  if (hits.length > 0 && /find|search|show|list|people|relationship|expertise|department/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.label} (${h.matchReason})`).join(' · '),
      concierge: 'Chief Concierge',
      graphScore: profile.graphScore,
      peopleCount: profile.peopleCount,
    };
  }

  return null;
}

export function buildProactiveIdentityGraphSuggestion(organizationId: string): string | null {
  const profile = getOrganizationIdentityGraphProfile(organizationId);
  if (!profile) return null;
  return summarizeIdentityGraph(profile);
}

export function buildIdentityGraphOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationIdentityGraphProfile(organizationId);
  return profile.dockIdentityLine;
}
