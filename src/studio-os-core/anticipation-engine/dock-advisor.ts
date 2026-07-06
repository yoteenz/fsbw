import { summarizeAnticipationProfile } from './anticipation-builder';
import {
  ensureOrganizationAnticipationProfile,
  getOrganizationAnticipationProfile,
} from './store';
import type { AnticipationEngineDockAdvice } from './types';

export function resolveAnticipationEngineAdvice(
  input: string,
  organizationId: string
): AnticipationEngineDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationAnticipationProfile(organizationId) ?? ensureOrganizationAnticipationProfile(organizationId);

  if (
    /anticipation engine|what have you prepared|what('s| is) prepared|prepare for|predict|anticipate|what do i need/i.test(
      trimmed
    )
  ) {
    return {
      response: summarizeAnticipationProfile(profile),
      concierge: 'Chief Concierge',
      preparationsReady: profile.preparationsReady,
      anticipationScore: profile.anticipationScore,
    };
  }

  if (/meeting agenda|tomorrow('s| is) meeting|prepared everything/i.test(trimmed)) {
    const meeting = profile.proactivePreparations.find((p) => p.type === 'meetings');
    return {
      response: meeting
        ? meeting.description
        : "I've already prepared tomorrow's meeting agenda — review in Anticipation Engine.",
      concierge: 'Chief Concierge',
      preparationsReady: profile.preparationsReady,
      anticipationScore: profile.anticipationScore,
    };
  }

  if (/launch week|launch approaching|promotional concept|marketing concept/i.test(trimmed)) {
    const launch = profile.proactivePreparations.find((p) => p.type === 'launch-assets' || p.type === 'content-queue');
    return {
      response: launch
        ? launch.description
        : profile.dockHeadline,
      concierge: 'Chief Concierge',
      preparationsReady: profile.preparationsReady,
      anticipationScore: profile.anticipationScore,
    };
  }

  if (/quarterly review|annual event|busy season|pattern/i.test(trimmed)) {
    const pattern = profile.organizationalPatterns[0];
    return {
      response: pattern
        ? `${pattern.pattern} — ${pattern.insight} ${pattern.preparationAction}`
        : `${profile.anticipationsIdentified} organizational needs anticipated.`,
      concierge: 'Chief Concierge',
      anticipationScore: profile.anticipationScore,
    };
  }

  if (/upcoming|deadline|bottleneck|hiring|knowledge gap|revenue opportunity/i.test(trimmed)) {
    const top = profile.anticipationItems.slice(0, 3);
    return {
      response: top.length
        ? top.map((a) => `${a.label}: ${a.summary}`).join('\n')
        : 'Anticipation Engine monitoring organizational rhythm.',
      concierge: 'Chief Concierge',
      anticipationScore: profile.anticipationScore,
    };
  }

  return null;
}

export function listAnticipationEngineDockSuggestions(organizationId: string): string[] {
  ensureOrganizationAnticipationProfile(organizationId);
  return [
    'What have you prepared for me?',
    'What organizational needs are approaching?',
    'Show me pending preparations awaiting approval',
    'What patterns has Studio OS recognized?',
  ].slice(0, 4);
}

export function buildProactiveAnticipationSuggestion(organizationId: string): string | null {
  const profile = getOrganizationAnticipationProfile(organizationId);
  if (!profile) return null;
  return summarizeAnticipationProfile(profile);
}
