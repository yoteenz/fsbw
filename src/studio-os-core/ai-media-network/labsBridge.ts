/**
 * Labs integration — every published episode becomes a Studio OS Labs experiment.
 */

import { registerPublishedAsset } from '../labs/store';
import type { ContentPillar } from '../labs/types';
import type { NetworkEpisode, NetworkPillarId } from './types';
import { readAiMediaNetworkStore, writeAiMediaNetworkStore } from './store';

const PILLAR_TO_LABS: Record<NetworkPillarId, ContentPillar> = {
  money: 'money',
  health: 'health',
  psychology: 'psychology',
  'ai-technology': 'ai',
  'consumer-intelligence': 'consumer-protection',
};

export function publishEpisodeToLabs(episode: NetworkEpisode): string {
  const experiment = registerPublishedAsset({
    workspaceId: episode.workspaceId,
    topic: episode.topic,
    pillar: PILLAR_TO_LABS[episode.pillarId],
    series: episode.showId.replace(/-/g, ' ').toUpperCase(),
    campaign: `S${episode.season}E${episode.episodeNumber}`,
    hook: episode.hook,
    publishingPlatform: episode.platforms.includes('tiktok') ? 'tiktok' : 'instagram-reels',
    publishDate: episode.publishedAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    publishTime: episode.publishedAt?.slice(11, 16) ?? '18:00',
    creativeDnaVersion: 'v1.2',
    writingBibleVersion: 'v1.1',
    companyDnaVersion: 'v1.0',
  });

  const store = readAiMediaNetworkStore();
  const episodes = store.episodes.map((e) =>
    e.id === episode.id
      ? { ...e, status: 'published' as const, publishedAt: new Date().toISOString(), experimentId: experiment.id }
      : e
  );
  writeAiMediaNetworkStore({ ...store, episodes });

  return experiment.id;
}

export function getLabsFeedTargets(): string[] {
  return [
    'Creative DNA',
    'Knowledge Graph',
    'Memory Bible',
    'Hook Library',
    'Thumbnail Library',
    'Recommendation Engine',
  ];
}
