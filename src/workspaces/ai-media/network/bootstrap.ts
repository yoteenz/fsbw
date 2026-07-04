/**
 * AI Media Network — demo seeds & bootstrap.
 */

import type { AiMediaNetworkStore, CalendarSlot, MonetizationRecord, NetworkEpisode, SeasonPlan } from '../../../studio-os-core/ai-media-network/types';
import {
  AI_MEDIA_WORKSPACE_ID,
  bootstrapAiMediaNetworkStore,
  buildCrossPlatformPackages,
  mergeAiMediaNetworkPatch,
  readAiMediaNetworkStore,
} from '../../../studio-os-core/ai-media-network/store';
import { publishEpisodeToLabs } from '../../../studio-os-core/ai-media-network/labsBridge';

const WS = AI_MEDIA_WORKSPACE_ID;

export const DEMO_EPISODES: NetworkEpisode[] = [
  {
    id: 'ep-mm-s2e12',
    workspaceId: WS,
    showId: 'money-monday',
    pillarId: 'money',
    title: 'Credit Score Myths Debunked',
    topic: 'credit score myths',
    season: 2,
    episodeNumber: 12,
    status: 'published',
    scheduledAt: '2026-06-16T18:00:00.000Z',
    publishedAt: '2026-06-16T18:30:00.000Z',
    hook: 'Did you know this credit myth is costing you money?',
    platforms: ['tiktok', 'instagram', 'youtube-shorts'],
    experimentId: 'exp-ai-money-myth-01',
    metrics: { views: 84200, averageWatchTimeSec: 30, revenue: 412.5, affiliateClicks: 340 },
  },
  {
    id: 'ep-tt-s2e10',
    workspaceId: WS,
    showId: 'truth-tuesday',
    pillarId: 'health',
    title: 'Sleep Supplement Truth',
    topic: 'sleep myths',
    season: 2,
    episodeNumber: 10,
    status: 'published',
    scheduledAt: '2026-06-17T19:00:00.000Z',
    publishedAt: '2026-06-17T19:00:00.000Z',
    hook: 'This sleep hack is actually making you tired.',
    platforms: ['instagram', 'tiktok', 'facebook'],
    experimentId: 'exp-ai-health-myth-02',
    metrics: { views: 52100, averageWatchTimeSec: 36, revenue: 186, affiliateClicks: 180 },
  },
  {
    id: 'ep-ww-s1e8',
    workspaceId: WS,
    showId: 'workflow-wednesday',
    pillarId: 'psychology',
    title: 'Why Your Brain Ignores Good Advice',
    topic: 'cognitive biases',
    season: 1,
    episodeNumber: 8,
    status: 'scheduled',
    scheduledAt: '2026-07-09T17:00:00.000Z',
    hook: 'Your brain is wired to ignore this type of advice.',
    platforms: ['youtube-shorts', 'tiktok', 'threads'],
    metrics: { views: 0, averageWatchTimeSec: 0, revenue: 0, affiliateClicks: 0 },
  },
  {
    id: 'ep-sl-s1e6',
    workspaceId: WS,
    showId: 'smart-living-thursday',
    pillarId: 'consumer-intelligence',
    title: 'Subscription Traps Exposed',
    topic: 'subscriptions',
    season: 1,
    episodeNumber: 6,
    status: 'in-production',
    scheduledAt: '2026-07-10T18:30:00.000Z',
    hook: "You're paying for subscriptions you forgot about.",
    platforms: ['tiktok', 'instagram', 'pinterest'],
    metrics: { views: 0, averageWatchTimeSec: 0, revenue: 0, affiliateClicks: 0 },
  },
  {
    id: 'ep-ff-s2e9',
    workspaceId: WS,
    showId: 'future-friday',
    pillarId: 'ai-technology',
    title: 'AI Tool That Edits Videos in 60 Seconds',
    topic: 'ai tools',
    season: 2,
    episodeNumber: 9,
    status: 'published',
    scheduledAt: '2026-07-04T12:00:00.000Z',
    publishedAt: '2026-07-04T12:00:00.000Z',
    hook: 'This AI tool replaced my entire editing workflow.',
    platforms: ['tiktok', 'youtube-shorts', 'x'],
    experimentId: 'exp-ai-tools-04',
    metrics: { views: 3200, averageWatchTimeSec: 30, revenue: 89.4, affiliateClicks: 95 },
  },
];

export const DEMO_CALENDAR: CalendarSlot[] = [
  { id: 'cal-mm', workspaceId: WS, date: '2026-07-07', time: '18:00', showId: 'money-monday', episodeId: 'ep-mm-s2e13', label: 'MONEY MONDAY · Debt Avalanche vs Snowball', type: 'weekly' },
  { id: 'cal-tt', workspaceId: WS, date: '2026-07-08', time: '19:00', showId: 'truth-tuesday', label: 'TRUTH TUESDAY · Nutrition Myths', type: 'weekly' },
  { id: 'cal-ww', workspaceId: WS, date: '2026-07-09', time: '17:00', showId: 'workflow-wednesday', episodeId: 'ep-ww-s1e8', label: 'WORKFLOW WEDNESDAY · Cognitive Biases', type: 'weekly' },
  { id: 'cal-sl', workspaceId: WS, date: '2026-07-10', time: '18:30', showId: 'smart-living-thursday', episodeId: 'ep-sl-s1e6', label: 'SMART LIVING · Subscription Traps', type: 'weekly' },
  { id: 'cal-ff', workspaceId: WS, date: '2026-07-11', time: '12:00', showId: 'future-friday', label: 'FUTURE FRIDAY · Automation Stack 2026', type: 'weekly' },
  { id: 'cal-special', workspaceId: WS, date: '2026-07-15', time: '18:00', showId: 'money-monday', label: 'SPECIAL · Q3 Finance Campaign Launch', type: 'campaign' },
];

export const DEMO_SEASON_PLANS: SeasonPlan[] = [
  { id: 'season-mm-2', workspaceId: WS, showId: 'money-monday', seasonNumber: 2, episodeCount: 12, theme: 'Credit & Debt Mastery', startDate: '2026-04-01', endDate: '2026-06-30' },
  { id: 'season-ff-2', workspaceId: WS, showId: 'future-friday', seasonNumber: 2, episodeCount: 9, theme: 'Creator AI Stack', startDate: '2026-05-01', endDate: '2026-07-31' },
];

export const DEMO_MONETIZATION: MonetizationRecord[] = [
  { id: 'mon-aff-mm', workspaceId: WS, channel: 'affiliate', seriesId: 'money-monday', pillarId: 'money', platform: 'tiktok', label: 'Credit checklist affiliate', amount: 412.5, period: '2026-06' },
  { id: 'mon-aff-ff', workspaceId: WS, channel: 'affiliate', seriesId: 'future-friday', pillarId: 'ai-technology', platform: 'tiktok', label: 'AI editor affiliate', amount: 89.4, period: '2026-07' },
  { id: 'mon-sponsor', workspaceId: WS, channel: 'sponsorship', seriesId: 'money-monday', pillarId: 'money', label: 'FinTech brand integration', amount: 2400, period: '2026-Q2' },
  { id: 'mon-digital', workspaceId: WS, channel: 'digital-products', pillarId: 'money', label: 'Budget planner PDF', amount: 620, period: '2026-06' },
  { id: 'mon-platform', workspaceId: WS, channel: 'platform-payouts', platform: 'youtube-shorts', label: 'Shorts RPM pool', amount: 950, period: '2026-06' },
  { id: 'mon-license', workspaceId: WS, channel: 'licensing', label: 'Clip licensing (future)', amount: 0, period: '2026-H2' },
];

export function buildAiMediaNetworkStorePatch(): Partial<AiMediaNetworkStore> {
  const crossPlatform = DEMO_EPISODES.flatMap(buildCrossPlatformPackages);
  return {
    episodes: DEMO_EPISODES,
    calendar: DEMO_CALENDAR,
    seasonPlans: DEMO_SEASON_PLANS,
    monetization: DEMO_MONETIZATION,
    crossPlatform,
  };
}

export function bootstrapAiMediaNetwork(): void {
  bootstrapAiMediaNetworkStore();
  const store = readAiMediaNetworkStore();
  if (store.episodes.length > 0) return;
  mergeAiMediaNetworkPatch(buildAiMediaNetworkStorePatch());
}

/** Demo: link published episodes that lack experiment IDs to Labs. */
export function syncPublishedEpisodesToLabs(): void {
  const store = readAiMediaNetworkStore();
  for (const ep of store.episodes) {
    if (ep.status === 'published' && !ep.experimentId) {
      publishEpisodeToLabs(ep);
    }
  }
}
