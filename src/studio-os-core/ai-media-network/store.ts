import {
  AI_MEDIA_NETWORK_STORAGE_KEY,
  AI_MEDIA_NETWORK_VERSION,
  AI_MEDIA_WORKSPACE_ID,
  DEFAULT_PILLARS,
  DEFAULT_SHOWS,
} from './constants';
import { generateAiMediaCompanyDna } from './companyDna';
import type {
  AiMediaNetworkStore,
  CrossPlatformPackage,
  NetworkEpisode,
  NetworkShowId,
  ShowAnalytics,
} from './types';

function defaultShowAnalytics(): Record<NetworkShowId, ShowAnalytics> {
  return {
    'money-monday': {
      episodes: 12,
      season: 2,
      publishingCadence: 'Weekly · Monday 18:00',
      bestPerformingTopics: ['credit myths', 'debt payoff', 'passive income'],
      averageWatchTimeSec: 31,
      audienceGrowth: 18,
      revenue: 1240,
      affiliatePerformance: 340,
      recommendations: ['Expand credit myth series', 'Test Voice B on investing topics'],
    },
    'truth-tuesday': {
      episodes: 10,
      season: 2,
      publishingCadence: 'Weekly · Tuesday 19:00',
      bestPerformingTopics: ['sleep myths', 'supplement truth', 'nutrition facts'],
      averageWatchTimeSec: 36,
      audienceGrowth: 22,
      revenue: 680,
      affiliatePerformance: 120,
      recommendations: ['Double down on save-worthy sleep content'],
    },
    'workflow-wednesday': {
      episodes: 8,
      season: 1,
      publishingCadence: 'Weekly · Wednesday 17:00',
      bestPerformingTopics: ['habit stacking', 'cognitive biases', 'productivity'],
      averageWatchTimeSec: 32,
      audienceGrowth: 15,
      revenue: 420,
      affiliatePerformance: 85,
      recommendations: ['Add comment-driven habit prompts'],
    },
    'smart-living-thursday': {
      episodes: 6,
      season: 1,
      publishingCadence: 'Weekly · Thursday 18:30',
      bestPerformingTopics: ['subscription traps', 'hidden fees', 'warranty rights'],
      averageWatchTimeSec: 28,
      audienceGrowth: 12,
      revenue: 890,
      affiliatePerformance: 210,
      recommendations: ['Partner with consumer advocacy affiliates'],
    },
    'future-friday': {
      episodes: 9,
      season: 2,
      publishingCadence: 'Weekly · Friday 12:00',
      bestPerformingTopics: ['ai video editors', 'automation stacks', 'cybersecurity basics'],
      averageWatchTimeSec: 30,
      audienceGrowth: 28,
      revenue: 1120,
      affiliatePerformance: 420,
      recommendations: ['Highest affiliate CTR — increase Friday frequency in Q3'],
    },
  };
}

function emptyStore(): AiMediaNetworkStore {
  return {
    companyDna: null,
    pillars: [],
    shows: [],
    showAnalytics: defaultShowAnalytics(),
    episodes: [],
    calendar: [],
    seasonPlans: [],
    crossPlatform: [],
    monetization: [],
    version: AI_MEDIA_NETWORK_VERSION,
  };
}

export function readAiMediaNetworkStore(): AiMediaNetworkStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(AI_MEDIA_NETWORK_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as AiMediaNetworkStore;
    return { ...emptyStore(), ...parsed, version: AI_MEDIA_NETWORK_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeAiMediaNetworkStore(store: AiMediaNetworkStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(AI_MEDIA_NETWORK_STORAGE_KEY, JSON.stringify(store));
}

export function mergeAiMediaNetworkPatch(patch: Partial<AiMediaNetworkStore>): void {
  const store = readAiMediaNetworkStore();
  writeAiMediaNetworkStore({ ...store, ...patch, version: AI_MEDIA_NETWORK_VERSION });
}

export function bootstrapAiMediaNetworkStore(): AiMediaNetworkStore {
  const store = readAiMediaNetworkStore();
  if (store.companyDna) return store;

  writeAiMediaNetworkStore({
    ...store,
    companyDna: generateAiMediaCompanyDna(),
    pillars: DEFAULT_PILLARS,
    shows: DEFAULT_SHOWS,
    showAnalytics: store.showAnalytics['money-monday'] ? store.showAnalytics : defaultShowAnalytics(),
  });

  return readAiMediaNetworkStore();
}

export function getEpisodesForShow(showId: NetworkShowId): NetworkEpisode[] {
  return readAiMediaNetworkStore().episodes.filter((e) => e.showId === showId);
}

export function buildCrossPlatformPackages(episode: NetworkEpisode): CrossPlatformPackage[] {
  const ratios: Record<string, string> = {
    instagram: '9:16',
    tiktok: '9:16',
    'youtube-shorts': '9:16',
    facebook: '9:16',
    threads: '1:1',
    x: '16:9',
    pinterest: '2:3',
  };

  return episode.platforms.map((platform) => ({
    episodeId: episode.id,
    platform,
    ready: episode.status === 'published' || episode.status === 'scheduled',
    aspectRatio: ratios[platform] ?? '9:16',
    captionVariant: platform === 'x' ? 'short-link' : 'full-caption',
    hashtagSet: [`#${episode.showId.replace(/-/g, '')}`, `#${episode.pillarId}`, '#aimedia'],
  }));
}

export { AI_MEDIA_WORKSPACE_ID };
