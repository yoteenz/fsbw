import {
  explainIdentityTimelineEvent,
  getKnowledgeSummary,
  getMentorshipSummary,
  getSelectedTimelineSummary,
  getTopContributorSummary,
  queryIdentityTimeline,
} from './discovery-engine';
import { summarizeIdentityTimeline } from './timeline-builder';
import {
  ensureOrganizationIdentityTimelineProfile,
  getOrganizationIdentityTimelineProfile,
  selectTimelinePerson,
} from './store';
import type { IdentityTimelineDockAdvice } from './types';

export function resolveIdentityTimelineAdvice(input: string, organizationId: string): IdentityTimelineDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationIdentityTimelineProfile(organizationId) ?? ensureOrganizationIdentityTimelineProfile(organizationId);

  if (/identity timeline|professional story|permanent.*journey|preserve.*individual/i.test(trimmed)) {
    return {
      response: summarizeIdentityTimeline(profile),
      concierge: 'Chief Concierge',
      timelineScore: profile.timelineScore,
      peopleWithTimelines: profile.peopleWithTimelines,
    };
  }

  if (/mentored|mentorship/i.test(trimmed)) {
    return { response: getMentorshipSummary(profile), concierge: 'Chief Concierge' };
  }

  if (/published.*knowledge|knowledge assets/i.test(trimmed)) {
    return { response: getKnowledgeSummary(profile), concierge: 'Chief Concierge' };
  }

  if (/top contributor|leading contributor/i.test(trimmed)) {
    return { response: getTopContributorSummary(profile), concierge: 'Chief Concierge', timelineScore: profile.timelineScore };
  }

  const explainMatch = trimmed.match(/explain (?:timeline|event|person) (.+)/i);
  if (explainMatch) {
    const hits = queryIdentityTimeline(explainMatch[1], profile, 1);
    if (hits[0]?.type === 'person') {
      selectTimelinePerson(organizationId, hits[0].id);
      return { response: getSelectedTimelineSummary(profile) ?? hits[0].label, concierge: 'Chief Concierge' };
    }
    if (hits[0]?.type === 'event') {
      return { response: explainIdentityTimelineEvent(hits[0].id, profile) ?? hits[0].label, concierge: 'Chief Concierge' };
    }
  }

  const selectedSummary = getSelectedTimelineSummary(profile);
  if (selectedSummary && /selected timeline|current person/i.test(trimmed)) {
    return { response: selectedSummary, concierge: 'Chief Concierge' };
  }

  const hits = queryIdentityTimeline(trimmed, profile, 3);
  if (hits.length > 0 && /find|search|show|list|timeline|journey|promotion|mentor/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.label} (${h.matchReason})`).join(' · '),
      concierge: 'Chief Concierge',
      timelineScore: profile.timelineScore,
      peopleWithTimelines: profile.peopleWithTimelines,
    };
  }

  const insight = profile.insights.find((i) => trimmed.toLowerCase().includes(i.insight.toLowerCase().slice(0, 24)));
  if (insight) {
    return { response: `${insight.insight} Action: ${insight.recommendedAction}`, concierge: 'Chief Concierge' };
  }

  return null;
}

export function buildProactiveIdentityTimelineSuggestion(organizationId: string): string | null {
  const profile = getOrganizationIdentityTimelineProfile(organizationId);
  if (!profile) return null;
  return summarizeIdentityTimeline(profile);
}

export function buildIdentityTimelineOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationIdentityTimelineProfile(organizationId);
  return profile.dockTimelineLine;
}
