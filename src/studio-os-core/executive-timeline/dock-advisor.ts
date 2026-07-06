import { filterExecutiveHistoryEvents, getMilestoneEvents } from './history-events';
import { summarizeExecutiveHistoryProfile } from './history-builder';
import { summarizeTimelineInsights } from './history-insights';
import {
  ensureOrganizationExecutiveHistoryProfile,
  getOrganizationExecutiveHistoryProfile,
} from './history-store';
import type { ExecutiveTimelineHistoryDockAdvice } from './history-types';

export function resolveExecutiveTimelineHistoryAdvice(
  input: string,
  organizationId: string
): ExecutiveTimelineHistoryDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationExecutiveHistoryProfile(organizationId) ??
    ensureOrganizationExecutiveHistoryProfile(organizationId);

  if (
    /executive timeline|organizational history|permanent history|how we arrived|our journey|company history/i.test(
      trimmed
    )
  ) {
    return {
      response: summarizeExecutiveHistoryProfile(profile),
      concierge: 'Chief Concierge',
      historyDepthScore: profile.historyDepthScore,
      totalEvents: profile.totalEvents,
    };
  }

  if (/anniversary|years ago|this week marks|founded|founding/i.test(trimmed)) {
    return {
      response: [
        profile.anniversaryContext ?? 'No anniversary context this week.',
        `Founded ${new Date(profile.foundedAt).toLocaleDateString()} — ${profile.yearsSpan} years of history preserved.`,
      ].join(' '),
      concierge: 'Chief Concierge',
    };
  }

  if (/insight|pattern|fastest growth|campaign impact|brain expansion|decision outcome/i.test(trimmed)) {
    return {
      response: summarizeTimelineInsights(profile.timelineInsights),
      concierge: 'Chief Concierge',
      historyDepthScore: profile.historyDepthScore,
    };
  }

  if (/milestone|jump to|major event|founding/i.test(trimmed)) {
    const milestones = getMilestoneEvents(profile.events);
    return {
      response: milestones
        .slice(0, 6)
        .map((e) => `${e.year}: ${e.title} — ${e.summary.slice(0, 80)}…`)
        .join('\n'),
      concierge: 'Chief Concierge',
      totalEvents: profile.totalEvents,
    };
  }

  if (/replay|scroll|year|compare growth|historical dashboard|archived headquarters/i.test(trimmed)) {
    const years = profile.yearSnapshots.map((y) => `${y.year}: ${y.headline}`).join('\n');
    return {
      response: [
        `Replay ${profile.yearsSpan} years of organizational history.`,
        years.slice(0, 400),
        profile.growthComparison.length > 1
          ? 'Growth comparison available across knowledge, health, and revenue indices.'
          : '',
      ]
        .filter(Boolean)
        .join(' '),
      concierge: 'Chief Concierge',
    };
  }

  if (/filter|department|project|marketing|hiring|product/i.test(trimmed)) {
    const dept = trimmed.match(/marketing|product|people|finance|knowledge|executive/i)?.[0]?.toLowerCase();
    const filtered = filterExecutiveHistoryEvents(profile.events, {
      department: dept === 'people' ? 'people' : dept ?? 'all',
    });
    return {
      response: filtered
        .slice(-5)
        .map((e) => `${e.year} · ${e.title}`)
        .join('\n'),
      concierge: 'Chief Concierge',
      totalEvents: filtered.length,
    };
  }

  if (/blueprint|headquarters|brain|commerce|legacy|health|consciousness/i.test(trimmed)) {
    const match = profile.events.find((e) =>
      new RegExp(trimmed.split(/\s+/)[0] ?? '', 'i').test(e.type + e.title)
    );
    return {
      response: match
        ? `${match.year}: ${match.title} — ${match.summary}`
        : profile.events
            .slice(-4)
            .map((e) => `${e.year}: ${e.title}`)
            .join('\n'),
      concierge: 'Chief Concierge',
    };
  }

  return null;
}

export function listExecutiveTimelineHistoryDockSuggestions(organizationId: string): string[] {
  ensureOrganizationExecutiveHistoryProfile(organizationId);
  return [
    'Show our Executive Timeline — how did we arrive here?',
    'What patterns does organizational history reveal?',
    'Jump to our founding milestones.',
    'Compare organizational growth across years.',
  ].slice(0, 4);
}

export function buildProactiveExecutiveTimelineHistorySuggestion(organizationId: string): string | null {
  const profile = getOrganizationExecutiveHistoryProfile(organizationId);
  if (!profile) return null;
  if (profile.anniversaryContext) return profile.anniversaryContext;
  return summarizeExecutiveHistoryProfile(profile);
}

export function buildHistoryOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationExecutiveHistoryProfile(organizationId);
  return profile.dockHistoryLine;
}

export function buildAnniversaryDockContext(organizationId: string): string | null {
  const profile = getOrganizationExecutiveHistoryProfile(organizationId);
  return profile?.anniversaryContext ?? null;
}
