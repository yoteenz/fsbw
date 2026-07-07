import { explainProfessionalProfileById, queryProfessionalProfiles } from './discovery-engine';
import { summarizeProfessionalProfiles } from './profile-builder';
import {
  ensureOrganizationProfessionalProfilesProfile,
  getOrganizationProfessionalProfilesProfile,
  selectProfessionalProfile,
} from './store';
import type { ProfessionalProfileDockAdvice } from './types';

export function resolveProfessionalProfileAdvice(
  input: string,
  organizationId: string
): ProfessionalProfileDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationProfessionalProfilesProfile(organizationId) ??
    ensureOrganizationProfessionalProfilesProfile(organizationId);

  if (/professional profile|career timeline|living profile|evolving career|not static resume/i.test(trimmed)) {
    return {
      response: summarizeProfessionalProfiles(profile),
      concierge: 'Chief Concierge',
      registryScore: profile.registryScore,
      profilesCount: profile.profilesCount,
    };
  }

  if (/timeline|promotion|certification earned|profession brain created|marketplace published/i.test(trimmed)) {
    const hits = queryProfessionalProfiles('timeline', profile, 3);
    if (hits.length > 0) {
      return {
        response: hits.map((h) => `${h.label} (${h.matchReason})`).join(' · '),
        concierge: 'Chief Concierge',
        profilesCount: profile.profilesCount,
      };
    }
  }

  const explainMatch = trimmed.match(/explain (?:profile|career) (.+)/i);
  if (explainMatch) {
    const hits = queryProfessionalProfiles(explainMatch[1], profile, 1);
    if (hits[0]?.type === 'profile') {
      selectProfessionalProfile(organizationId, hits[0].id);
      return { response: explainProfessionalProfileById(hits[0].id, profile) ?? hits[0].label, concierge: 'Chief Concierge' };
    }
  }

  const hits = queryProfessionalProfiles(trimmed, profile, 3);
  if (hits.length > 0 && /find|search|show|list|profile|skill|certification|career/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.label} (${h.matchReason})`).join(' · '),
      concierge: 'Chief Concierge',
      registryScore: profile.registryScore,
      profilesCount: profile.profilesCount,
    };
  }

  return null;
}

export function buildProactiveProfessionalProfileSuggestion(organizationId: string): string | null {
  const profile = getOrganizationProfessionalProfilesProfile(organizationId);
  if (!profile) return null;
  return summarizeProfessionalProfiles(profile);
}

export function buildProfessionalProfileOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationProfessionalProfilesProfile(organizationId);
  return profile.dockProfessionalLine;
}
