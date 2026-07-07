/**
 * Sync production floor pages from ndxbook registry.
 */

import { NEWSROOM_PIPELINE_STAGES } from './constants';
import { readNdxbookNewsroomStore, writeNdxbookNewsroomStore } from './store';
import type { EditorialCalendarEntry, ProductionPage } from './types';
import type { NdxbookPage } from '../types';

function rebuildPipelineColumns(pages: ProductionPage[]) {
  return NEWSROOM_PIPELINE_STAGES.map((s) => {
    const stagePages = pages.filter((p) => p.stageId === s.id);
    const avgEta =
      stagePages.length > 0
        ? Math.round(stagePages.reduce((sum, p) => sum + p.estimatedCompletionMins, 0) / stagePages.length)
        : 0;
    const healthPct =
      stagePages.length === 0
        ? 100
        : Math.round(
            stagePages.reduce((sum, p) => {
              const h = p.health === 'on-track' ? 95 : p.health === 'at-risk' ? 70 : p.health === 'blocked' ? 40 : 100;
              return sum + h;
            }, 0) / stagePages.length
          );
    return {
      id: s.id,
      label: s.label,
      pageIds: stagePages.map((p) => p.id),
      assignedExecutive: s.executive,
      estimatedCompletionMins: avgEta,
      healthPct,
    };
  });
}

function refreshDashboard(store: ReturnType<typeof readNdxbookNewsroomStore>) {
  const inProduction = store.pages.filter((p) => p.stageId !== 'published' && p.stageId !== 'institutional-knowledge').length;
  const publishingToday = store.pages.filter((p) => p.stageId === 'scheduled' || p.stageId === 'published').length;
  const bottlenecks = store.pages.filter((p) => p.health === 'blocked' || p.health === 'at-risk').length;
  const avgHealth =
    store.pages.length > 0
      ? Math.round(
          store.pages.reduce((s, p) => {
            const h = p.health === 'on-track' ? 90 : p.health === 'at-risk' ? 65 : p.health === 'blocked' ? 35 : 100;
            return s + h;
          }, 0) / store.pages.length
        )
      : 0;

  return {
    ...store.dashboard,
    summary:
      store.pages.length === 0
        ? 'Production floor ready — start Project 001 to begin NDXBook history.'
        : `${store.pages.length} page(s) in pipeline · ${inProduction} in production`,
    pagesInProduction: inProduction,
    pagesPublishingToday: publishingToday,
    bottlenecks,
    overallHealthPct: avgHealth,
    cosOrchestrationStatus: store.pages.length > 0 ? 'ACTIVE' : 'AWAITING PROJECT 001',
  };
}

export function productionPageFromRegistry(page: NdxbookPage): ProductionPage {
  const review = page.pipeline?.studioReview;
  const approvalHistory: string[] = [];
  if (review) {
    approvalHistory.push(`Studio Intelligence · ${review.overallPass ? 'PASS' : 'REVIEW'} · ${new Date(review.reviewedAt).toLocaleString()}`);
  }
  if (page.pipeline?.approvedAt) {
    approvalHistory.push(`Executive approval · ${new Date(page.pipeline.approvedAt).toLocaleString()}`);
  }

  const stageId =
    page.status === 'published'
      ? 'published'
      : page.status === 'scheduled'
        ? 'scheduled'
        : page.status === 'review'
          ? 'quality-assurance'
          : 'script';

  return {
    id: page.id,
    pageNumber: page.pageNumber,
    pageLabel: page.pageLabel,
    title: page.title,
    volumeId: page.volumeId,
    chapter: page.chapter,
    stageId,
    assignedExecutive: 'Chief Content Officer',
    priority: page.pageNumber === 1 ? 'critical' : 'normal',
    confidencePct: review?.overallPass ? 92 : 78,
    health: 'on-track',
    estimatedCompletionMins: 45,
    updatedAt: page.updatedAt,
    researchNotes: ['Money / credit / business education — pilot category'],
    knowledgeSources: ['Consumer credit fundamentals · FICO utilization guidance'],
    scriptExcerpt: page.script,
    storyboardStatus: 'minimal carousel · 3 slides',
    voiceStatus: 'text-first pilot',
    animationStatus: 'static carousel',
    thumbnailStatus: page.thumbnail ? 'generated · ndxbook identity' : 'pending',
    captionStatus: page.caption ? 'draft locked' : 'pending',
    hashtags: page.hashtags,
    platformVersions: page.platforms,
    approvalHistory,
    experiments: [],
    analyticsSnapshot: page.status === 'published' ? 'awaiting Instagram insights' : '—',
    comments: page.pageNumber === 1 ? ['First official NDXBook knowledge asset'] : [],
    revisionHistory: [`Created ${new Date(page.createdAt).toLocaleString()}`],
    knowledgeGraphNodeIds: [`node-${page.volumeId}`, `node-${page.chapter}`, 'node-ndxbook'],
    memoryReferences: ['ndxbook-v1 creative dna · money volume'],
    institutionalLearnings: page.status === 'published' ? [`${page.pageLabel} — first authentic publish`] : [],
    strategyConnection: {
      strategyId: 'str-ndx-pilot',
      strategyLabel: 'FIRST POST PIPELINE',
      initiativeId: 'init-page-001',
      initiativeLabel: 'PROJECT 001 PILOT',
      campaignId: 'camp-instagram-only',
      volumeId: page.volumeId,
      chapter: page.chapter,
      experimentId: page.experimentId ?? 'pending',
      expectedOutcome: 'Validate Instagram-only pipeline before multi-platform',
      aligned: true,
    },
  };
}

function calendarEntryFromPage(page: NdxbookPage): EditorialCalendarEntry | null {
  if (!page.publishDate && page.status !== 'scheduled') return null;
  const scheduledAt = page.publishDate ?? page.pipeline?.scheduledAt;
  if (!scheduledAt) return null;
  return {
    id: `cal-${page.id}`,
    title: page.title,
    pageLabel: page.pageLabel,
    scheduledAt,
    view: 'daily',
    volumeId: page.volumeId,
    platforms: page.platforms,
    status: page.status === 'published' ? 'published' : page.status === 'scheduled' ? 'ready' : 'in-production',
  };
}

export function createProductionPageFromRegistry(page: NdxbookPage): ProductionPage {
  const store = readNdxbookNewsroomStore();
  const productionPage = productionPageFromRegistry(page);
  const pages = [...store.pages.filter((p) => p.id !== page.id), productionPage];
  const pipelineStages = rebuildPipelineColumns(pages);
  const calendarEntry = calendarEntryFromPage(page);
  const editorialCalendar = calendarEntry
    ? [...store.editorialCalendar.filter((e) => e.id !== calendarEntry.id), calendarEntry]
    : store.editorialCalendar;

  const activity = {
    id: `act-create-${Date.now()}`,
    timestamp: new Date().toISOString(),
    message: `${page.pageLabel} created — first official knowledge asset`,
    executive: 'Chief Content Officer',
    confidencePct: 85,
    pageLabel: page.pageLabel,
    category: 'creation' as const,
  };

  const next = {
    ...store,
    pages,
    pipelineStages,
    editorialCalendar,
    selectedPageId: page.id,
    activityWall: [activity, ...store.activityWall].slice(0, 50),
  };

  writeNdxbookNewsroomStore({ ...next, dashboard: refreshDashboard(next) });
  return productionPage;
}

export function syncNewsroomPageFromRegistry(page: NdxbookPage): void {
  const store = readNdxbookNewsroomStore();
  if (!store.pages.some((p) => p.id === page.id)) {
    createProductionPageFromRegistry(page);
    return;
  }

  const productionPage = productionPageFromRegistry(page);
  const pages = store.pages.map((p) => (p.id === page.id ? productionPage : p));
  const pipelineStages = rebuildPipelineColumns(pages);
  const calendarEntry = calendarEntryFromPage(page);
  const editorialCalendar = calendarEntry
    ? [...store.editorialCalendar.filter((e) => e.id !== calendarEntry.id), calendarEntry]
    : store.editorialCalendar.filter((e) => e.pageLabel !== page.pageLabel);

  const next = { ...store, pages, pipelineStages, editorialCalendar };
  writeNdxbookNewsroomStore({ ...next, dashboard: refreshDashboard(next) });
}
