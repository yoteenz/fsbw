/**
 * Labs integration — every ndxbook page automatically becomes a Studio OS Labs experiment.
 */

import { registerPublishedAsset } from '../labs/store';
import type { ContentPillar, PublishingPlatform } from '../labs/types';
import type { NdxbookPage, NdxbookPlatformId, NdxbookVolumeId } from './types';
import { mergeNdxbookPatch, readNdxbookStore, writeNdxbookStore } from './store';

const VOLUME_TO_LABS_PILLAR: Record<NdxbookVolumeId, ContentPillar> = {
  money: 'money',
  body: 'health',
  mind: 'psychology',
  tech: 'technology',
  consumer: 'consumer-protection',
};

const PLATFORM_TO_LABS: Record<NdxbookPlatformId, PublishingPlatform> = {
  instagram: 'instagram-reels',
  tiktok: 'tiktok',
  'youtube-shorts': 'youtube-shorts',
  facebook: 'facebook',
  threads: 'other',
  x: 'twitter',
  pinterest: 'pinterest',
};

export function publishPageToLabs(page: NdxbookPage): string {
  const primaryPlatform = page.platforms[0] ?? 'tiktok';
  const experiment = registerPublishedAsset({
    workspaceId: page.workspaceId,
    topic: page.chapter,
    pillar: VOLUME_TO_LABS_PILLAR[page.volumeId],
    series: page.pageLabel.toUpperCase(),
    campaign: `${page.volumeId} · ${page.chapter}`,
    hook: page.hook || page.title,
    publishingPlatform: PLATFORM_TO_LABS[primaryPlatform],
    publishDate: page.publishDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    publishTime: page.publishDate?.slice(11, 16) ?? '18:00',
    caption: page.caption,
    hashtags: page.hashtags,
    thumbnail: page.thumbnail,
    script: page.script,
    creativeDnaVersion: 'ndxbook-v1',
    writingBibleVersion: 'ndxbook-v1',
    companyDnaVersion: 'ndxbook-v1',
  });

  const store = readNdxbookStore();
  const pages = store.pages.map((p) =>
    p.id === page.id
      ? {
          ...p,
          status: 'published' as const,
          experimentId: experiment.id,
          publishDate: p.publishDate ?? new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      : p
  );
  writeNdxbookStore({ ...store, pages });
  refreshNdxbookDashboard();

  return experiment.id;
}

export function getLabsTrackingFields(): readonly string[] {
  return [
    'hook',
    'topic',
    'volume',
    'chapter',
    'host',
    'thumbnail',
    'caption',
    'hashtags',
    'publish time',
    'platform',
    'retention',
    'engagement',
    'shares',
    'saves',
    'clicks',
    'revenue',
    'learnings',
  ];
}

function refreshNdxbookDashboard(): void {
  const store = readNdxbookStore();
  const pagesCreated = store.pages.length;
  const pagesScheduled = store.pages.filter((p) => p.status === 'scheduled').length;
  const socialsConnected = store.socialAccounts.filter((s) => s.status === 'connected').length;
  const labsExperiments = store.pages.filter((p) => p.experimentId).length;

  mergeNdxbookPatch({
    dashboard: {
      brand: store.brand?.publicName ?? 'ndxbook',
      positioning: store.brand?.positioning ?? '',
      launchVolumes: store.volumes.length,
      pagesCreated,
      pagesScheduled,
      socialsConnected,
      labsExperiments,
      nextAction: pagesCreated === 0 ? 'connect socials & create first 10 pages' : store.dashboard.nextAction,
    },
  });
}

export function syncPageExperimentLink(pageId: string, experimentId: string): void {
  const store = readNdxbookStore();
  const pages = store.pages.map((p) => (p.id === pageId ? { ...p, experimentId } : p));
  mergeNdxbookPatch({ pages });
}
