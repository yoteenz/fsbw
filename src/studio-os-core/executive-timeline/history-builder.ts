import { getOrganizationHealthIndexProfile } from '../company-health-index/store';
import { getOrganizationMemoryProfile } from '../memory-engine/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { buildExecutiveHistoryEvents } from './history-events';
import {
  buildGrowthComparison,
  buildTimelineInsights,
  buildYearSnapshots,
  summarizeTimelineInsights,
} from './history-insights';
import type { ExecutiveHistoryEvent, OrganizationExecutiveHistoryProfile } from './history-types';

export function computeHistoryDepthScore(eventCount: number, yearsSpan: number, insightCount: number): number {
  return Math.min(99, Math.round(eventCount * 2.5 + yearsSpan * 8 + insightCount * 5));
}

export function buildAnniversaryContext(events: ExecutiveHistoryEvent[], companyName: string): string | undefined {
  const now = new Date();
  const candidates = events.filter((e) => e.significance === 'foundational' || e.significance === 'major');

  for (const event of candidates) {
    const eventDate = new Date(event.occurredAt);
    const dayDiff = Math.abs(
      (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const yearDiff = now.getFullYear() - eventDate.getFullYear();

    if (dayDiff <= 7 && yearDiff >= 1) {
      if (event.type === 'major-customer') {
        return `This week marks the anniversary of your first major client — "${event.title}" was recorded ${yearDiff} year${yearDiff > 1 ? 's' : ''} ago.`;
      }
      if (event.type === 'product-release') {
        return `Two years ago this week, you launched "${event.title}" — one of your highest-performing products in executive history.`;
      }
      if (event.type === 'organization-founded') {
        return `Today your organization reached its ${yearDiff}${yearDiff === 5 ? 'th' : ''} year — ${companyName}'s journey preserved forever in Executive Timeline™.`;
      }
      return `This week marks the anniversary of "${event.title}" — ${yearDiff} year${yearDiff > 1 ? 's' : ''} of organizational evolution.`;
    }
  }

  const founded = events.find((e) => e.type === 'organization-founded');
  if (founded) {
    const years = now.getFullYear() - new Date(founded.occurredAt).getFullYear();
    if (years >= 5 && now.getMonth() === new Date(founded.occurredAt).getMonth()) {
      return `Today ${companyName} celebrates ${years} years — explore how you arrived here in Executive Timeline™.`;
    }
  }

  return undefined;
}

export function buildDockHistoryLine(profile: OrganizationExecutiveHistoryProfile): string {
  const topInsight = profile.timelineInsights[0];
  if (topInsight) return topInsight.narrative.slice(0, 140);
  if (profile.anniversaryContext) return profile.anniversaryContext;
  return `${profile.totalEvents} events across ${profile.yearsSpan} year${profile.yearsSpan !== 1 ? 's' : ''} — history becomes actionable intelligence.`;
}

export function buildOrganizationExecutiveHistoryProfile(
  organizationId: string
): OrganizationExecutiveHistoryProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const industryId = brain?.industryId ?? organizationId;

  const events = buildExecutiveHistoryEvents(organizationId);
  const founded = events.find((e) => e.type === 'organization-founded');
  const foundedAt = founded?.occurredAt ?? new Date().toISOString();
  const years = events.map((e) => e.year);
  const yearsSpan = years.length > 0 ? Math.max(...years) - Math.min(...years) + 1 : 1;

  const memory = getOrganizationMemoryProfile(organizationId);
  const health = getOrganizationHealthIndexProfile(organizationId);
  const knowledgeScore = memory?.memoryDepthScore ?? 45;
  const healthScore = health?.executiveHealthScore ?? 55;

  const timelineInsights = buildTimelineInsights(events);
  const yearSnapshots = buildYearSnapshots(events);
  const growthComparison = buildGrowthComparison(events, healthScore, knowledgeScore);

  const profile: OrganizationExecutiveHistoryProfile = {
    organizationId,
    companyName,
    industryId,
    updatedAt: new Date().toISOString(),
    foundedAt,
    historyDepthScore: 0,
    totalEvents: events.length,
    yearsSpan,
    events,
    timelineInsights,
    yearSnapshots,
    growthComparison,
    dockHistoryLine: '',
    replayAvailable: true,
    syncedSources: [
      'business-discovery-blueprint',
      'organization-inauguration',
      'profession-brain',
      'knowledge-commerce',
      'memory-engine',
      'legacy-vault',
      'company-health-index',
      'organizational-consciousness',
      'predictive-organization',
      'executive-timeline-history',
    ],
  };

  profile.historyDepthScore = computeHistoryDepthScore(
    profile.totalEvents,
    profile.yearsSpan,
    profile.timelineInsights.length
  );
  profile.anniversaryContext = buildAnniversaryContext(events, companyName);
  profile.dockHistoryLine = buildDockHistoryLine(profile);
  return profile;
}

export function summarizeExecutiveHistoryProfile(profile: OrganizationExecutiveHistoryProfile): string {
  return [
    profile.dockHistoryLine,
    `${profile.totalEvents} events · ${profile.yearsSpan} years · history depth ${profile.historyDepthScore}%.`,
    summarizeTimelineInsights(profile.timelineInsights),
    profile.anniversaryContext ?? '',
    'Executive Timeline™ — understand not only where you are, but how you arrived there.',
  ]
    .filter(Boolean)
    .join(' ');
}
