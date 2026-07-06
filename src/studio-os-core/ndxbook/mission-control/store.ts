import {
  NDXBOOK_MISSION_CONTROL_STORAGE_KEY,
  NDXBOOK_MISSION_CONTROL_VERSION,
} from './constants';
import type { NdxbookMissionControlStore, PublishingScheduleItem } from './types';

function emptyStore(): NdxbookMissionControlStore {
  return {
    version: NDXBOOK_MISSION_CONTROL_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    briefing: {
      greeting: 'good morning',
      pagesPublishingToday: 0,
      pagesInProduction: 0,
      pendingApprovals: 0,
      estimatedReachToday: 0,
      estimatedRevenueToday: 0,
      highestPerformingPage: '—',
      highestPerformingVolume: '—',
      highestPerformingHost: '—',
      studioRecommendation: 'connect socials & create first 10 pages',
      topOpportunity: '—',
      topRisk: '—',
      nextSuggestedAction: 'open ndxbook brand setup',
    },
    companyHealth: [],
    newsroomStages: [],
    publishingSchedule: [],
    pageOfTheDay: {
      pageNumber: 1,
      pageLabel: 'page 001',
      title: '—',
      volumeId: 'money',
      chapter: '—',
      hostName: '—',
      thumbnailNote: '—',
      platforms: [],
      status: 'draft',
      predictedPerformance: '—',
      launchAt: new Date().toISOString(),
    },
    library: {
      latestPages: [],
      recentlyUpdated: [],
      mostBookmarked: [],
      highestShared: [],
      highestRetention: [],
      recentCollections: [],
    },
    volumes: [],
    chaptersByVolume: {},
    readerIntelligence: {
      newReaders: 0,
      returningReaders: 0,
      retentionPct: 0,
      bookmarks: 0,
      shares: 0,
      comments: 0,
      watchTimeHours: 0,
      avgCompletionPct: 0,
      bestPublishingHour: '—',
      topCountries: [],
      topAgeGroups: [],
      topInterests: [],
    },
    intelligence: [],
    revenue: {
      today: 0,
      yesterday: 0,
      changeVsYesterdayPct: 0,
      topChannel: 'youtube',
      projectedEndOfDay: 0,
      thisWeek: 0,
      thisMonth: 0,
      thisYear: 0,
      breakdown: {
        youtube: 0,
        instagram: 0,
        tiktok: 0,
        facebook: 0,
        affiliate: 0,
        brandPartnerships: 0,
        marketplace: 0,
        digitalProducts: 0,
        futureMemberships: 0,
      },
      forecastNextMonth: 0,
      forecastConfidencePct: 0,
    },
    experiments: [],
    talentBoard: [],
    missionActions: [],
    activityFeed: [],
  };
}

export function readNdxbookMissionControlStore(): NdxbookMissionControlStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(NDXBOOK_MISSION_CONTROL_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as NdxbookMissionControlStore;
    return { ...emptyStore(), ...parsed, version: NDXBOOK_MISSION_CONTROL_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeNdxbookMissionControlStore(store: NdxbookMissionControlStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    NDXBOOK_MISSION_CONTROL_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: NDXBOOK_MISSION_CONTROL_VERSION })
  );
}

export function mergeNdxbookMissionControlPatch(patch: Partial<NdxbookMissionControlStore>): void {
  const store = readNdxbookMissionControlStore();
  writeNdxbookMissionControlStore({ ...store, ...patch });
}

export function bootstrapNdxbookMissionControlStore(seed?: Partial<NdxbookMissionControlStore>): void {
  const existing = readNdxbookMissionControlStore();
  if (existing.companyHealth.length > 0 && existing.newsroomStages.length > 0) return;
  writeNdxbookMissionControlStore({ ...emptyStore(), ...seed });
}

export function reschedulePublishingItem(itemId: string, newScheduledAt: string): PublishingScheduleItem[] {
  const store = readNdxbookMissionControlStore();
  const updated = store.publishingSchedule.map((item) =>
    item.id === itemId ? { ...item, scheduledAt: newScheduledAt, estimatedPublishAt: newScheduledAt } : item
  );
  writeNdxbookMissionControlStore({ ...store, publishingSchedule: updated });
  return updated;
}

export function touchMissionControlLiveMetrics(): void {
  const store = readNdxbookMissionControlStore();
  if (store.companyHealth.length === 0) return;

  const jitter = (n: number, pct: number) => Math.max(0, Math.round(n + n * pct * (Math.random() - 0.5)));

  const briefing = {
    ...store.briefing,
    estimatedReachToday: jitter(store.briefing.estimatedReachToday, 0.02),
    estimatedRevenueToday: Math.round(jitter(store.briefing.estimatedRevenueToday, 0.01) * 100) / 100,
  };

  const readerIntelligence = {
    ...store.readerIntelligence,
    watchTimeHours: Math.round(jitter(store.readerIntelligence.watchTimeHours, 0.015) * 10) / 10,
    newReaders: jitter(store.readerIntelligence.newReaders, 0.03),
  };

  writeNdxbookMissionControlStore({ ...store, briefing, readerIntelligence });
}
