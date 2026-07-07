import type { LibraryPageCard, PublishingScheduleItem } from './types';
import { readNdxbookStore } from '../store';
import { readNdxbookMissionControlStore, writeNdxbookMissionControlStore } from './store';

export function syncMissionControlFromRegistry(): void {
  const ndx = readNdxbookStore();
  const mc = readNdxbookMissionControlStore();
  const pages = ndx.pages;

  const inProduction = pages.filter((p) => !['published', 'archived'].includes(p.status)).length;
  const pendingApprovals = pages.filter((p) => p.status === 'review').length;
  const publishingToday = pages.filter((p) => p.status === 'scheduled' || p.status === 'published').length;
  const primary = pages.find((p) => p.pageNumber === 1) ?? pages[0];

  const briefing = {
    ...mc.briefing,
    pagesInProduction: inProduction,
    pagesPublishingToday: publishingToday,
    pendingApprovals,
    nextSuggestedAction:
      pages.length === 0
        ? 'enter production wing · start project 001'
        : primary?.status === 'published'
          ? 'monitor project 001 · plan project 002'
          : primary?.status === 'scheduled'
            ? `track ${primary.pageLabel} scheduled post`
            : primary?.status === 'review'
              ? `approve ${primary.pageLabel} for production`
              : `complete ${primary?.pageLabel ?? 'page'} pipeline`,
    studioRecommendation:
      pages.length === 0
        ? 'learning — publish 5 posts to unlock basic recommendations'
        : 'Studio Intelligence learning from first authentic NDXBook data',
    topOpportunity: pages.length === 0 ? 'connect instagram & start project 001' : `${primary?.pageLabel ?? 'project'} · instagram pilot`,
  };

  const pageOfTheDay = primary
    ? {
        pageNumber: primary.pageNumber,
        pageLabel: primary.pageLabel,
        title: primary.title,
        volumeId: primary.volumeId,
        chapter: primary.chapter,
        hostName: 'Unassigned',
        thumbnailNote: primary.thumbnail ? 'ndxbook visual · generated' : 'Awaiting visual',
        platforms: primary.platforms,
        status: primary.status,
        predictedPerformance: primary.pageNumber === 1 ? 'pilot baseline' : '—',
        launchAt: primary.publishDate ?? primary.pipeline?.scheduledAt ?? new Date(Date.now() + 3600_000).toISOString(),
      }
    : mc.pageOfTheDay;

  const toLibraryCard = (p: (typeof pages)[0]): LibraryPageCard => ({
    id: p.id,
    pageNumber: p.pageNumber,
    pageLabel: p.pageLabel,
    volumeId: p.volumeId,
    chapter: p.chapter,
    title: p.title,
    status: p.status,
    performanceSnapshot: p.status === 'published' ? 'awaiting insights' : '—',
    updatedAt: p.updatedAt,
  });

  const library = {
    ...mc.library,
    latestPages: pages.filter((p) => p.status === 'published').map(toLibraryCard),
    recentlyUpdated: [...pages].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5).map(toLibraryCard),
  };

  const publishingSchedule: PublishingScheduleItem[] = pages
    .filter((p) => p.status === 'scheduled' || p.status === 'published')
    .flatMap((p) =>
      p.platforms.map((platform) => ({
        id: `sched-${p.id}-${platform}`,
        pageLabel: p.pageLabel,
        pageNumber: p.pageNumber,
        volumeId: p.volumeId,
        chapter: p.chapter,
        platform,
        scheduledAt: p.publishDate ?? p.pipeline?.scheduledAt ?? p.updatedAt,
        estimatedPublishAt: p.publishDate ?? p.pipeline?.scheduledAt ?? p.updatedAt,
        status: p.status === 'published' ? ('published' as const) : ('ready' as const),
      }))
    );

  const newsroomStages = mc.newsroomStages.map((stage) => {
    const count = pages.filter((p) => {
      if (stage.id === 'script' && p.status === 'draft') return true;
      if (stage.id === 'review' && p.status === 'review') return true;
      if (stage.id === 'scheduled' && p.status === 'scheduled') return true;
      if (stage.id === 'published' && p.status === 'published') return true;
      return false;
    }).length;
    return { ...stage, pageCount: count, activeItems: count };
  });

  writeNdxbookMissionControlStore({
    ...mc,
    briefing,
    pageOfTheDay,
    library,
    publishingSchedule,
    newsroomStages,
  });
}
