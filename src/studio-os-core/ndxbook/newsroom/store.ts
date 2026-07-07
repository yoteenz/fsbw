import {
  NDXBOOK_NEWSROOM_STORAGE_KEY,
  NDXBOOK_NEWSROOM_VERSION,
  NEWSROOM_DEPARTMENTS,
  NEWSROOM_PIPELINE_STAGES,
  QUALITY_GATE_LAYERS,
  STAGE_ORDER,
} from './constants';
import type { NewsroomPipelineStageId, NewsroomStore, ProductionPage } from './types';
import { readStudioOsJson, writeStudioOsJson } from '../../../utils/studioOsBrowserStorage';

function emptyStore(): NewsroomStore {
  return {
    version: NDXBOOK_NEWSROOM_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    workspaceId: 'ai-media',
    dashboard: {
      summary: '',
      pagesInProduction: 0,
      pagesPublishingToday: 0,
      bottlenecks: 0,
      overallHealthPct: 0,
      cosOrchestrationStatus: 'INITIALIZING',
    },
    pipelineStages: NEWSROOM_PIPELINE_STAGES.map((s) => ({
      id: s.id,
      label: s.label,
      pageIds: [],
      assignedExecutive: s.executive,
      estimatedCompletionMins: 0,
      healthPct: 0,
    })),
    pages: [],
    departments: NEWSROOM_DEPARTMENTS.map((d) => ({
      id: d.id,
      label: d.label,
      capacityPct: 0,
      currentWorkload: 0,
      estimatedCompletionMins: 0,
      healthPct: 0,
      activePages: [],
      executiveLead: d.lead,
    })),
    editorialCalendar: [],
    activityWall: [],
    productionIntelligence: [],
    orchestrationQueue: [],
    talentRouting: [],
    experiments: [],
    assetLineage: [],
    operationalDna: [],
    knowledgeOutputs: [],
    qualityGateLayers: [...QUALITY_GATE_LAYERS],
    selectedPageId: null,
  };
}

function rebuildPipelineColumns(pages: ProductionPage[]): NewsroomStore['pipelineStages'] {
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

function refreshDashboard(store: NewsroomStore): NewsroomStore['dashboard'] {
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
    pagesInProduction: inProduction,
    pagesPublishingToday: publishingToday,
    bottlenecks,
    overallHealthPct: avgHealth,
  };
}

export function readNdxbookNewsroomStore(): NewsroomStore {
  return readStudioOsJson(NDXBOOK_NEWSROOM_STORAGE_KEY, emptyStore);
}

export function writeNdxbookNewsroomStore(store: NewsroomStore): void {
  writeStudioOsJson(NDXBOOK_NEWSROOM_STORAGE_KEY, {
    ...store,
    lastUpdatedAt: new Date().toISOString(),
    version: NDXBOOK_NEWSROOM_VERSION,
  });
}

export function bootstrapNdxbookNewsroomStore(seed?: Partial<NewsroomStore>, options?: { force?: boolean }): void {
  const existing = readNdxbookNewsroomStore();
  if (!options?.force && existing.pages.length > 0) return;
  const merged = { ...emptyStore(), ...seed };
  const pipelineStages = rebuildPipelineColumns(merged.pages);
  writeNdxbookNewsroomStore({ ...merged, pipelineStages, dashboard: refreshDashboard({ ...merged, pipelineStages }) });
}

export function movePageToStage(pageId: string, targetStageId: NewsroomPipelineStageId): void {
  const store = readNdxbookNewsroomStore();
  const page = store.pages.find((p) => p.id === pageId);
  if (!page || page.stageId === targetStageId) return;

  const pages = store.pages.map((p) =>
    p.id === pageId ? { ...p, stageId: targetStageId, updatedAt: new Date().toISOString() } : p
  );

  const activity = {
    id: `act-${Date.now()}`,
    timestamp: new Date().toISOString(),
    message: `${page.pageLabel} moved to ${NEWSROOM_PIPELINE_STAGES.find((s) => s.id === targetStageId)?.label ?? targetStageId}`,
    executive: 'Chief of Staff · Orchestration',
    confidencePct: page.confidencePct,
    pageLabel: page.pageLabel,
    category: 'creation' as const,
  };

  const next = {
    ...store,
    pages,
    pipelineStages: rebuildPipelineColumns(pages),
    activityWall: [activity, ...store.activityWall].slice(0, 50),
  };

  writeNdxbookNewsroomStore({ ...next, dashboard: refreshDashboard(next) });
}

export function selectNewsroomPage(pageId: string | null): void {
  const store = readNdxbookNewsroomStore();
  writeNdxbookNewsroomStore({ ...store, selectedPageId: pageId });
}

export function rescheduleEditorialEntry(entryId: string, newScheduledAt: string): void {
  const store = readNdxbookNewsroomStore();
  const editorialCalendar = store.editorialCalendar.map((e) =>
    e.id === entryId ? { ...e, scheduledAt: newScheduledAt } : e
  );
  writeNdxbookNewsroomStore({ ...store, editorialCalendar });
}

export function advancePageToNextStage(pageId: string): void {
  const store = readNdxbookNewsroomStore();
  const page = store.pages.find((p) => p.id === pageId);
  if (!page) return;
  const next = nextStageId(page.stageId);
  if (next) movePageToStage(pageId, next);
}

function nextStageId(current: NewsroomPipelineStageId): NewsroomPipelineStageId | null {
  const idx = STAGE_ORDER.indexOf(current);
  if (idx < 0 || idx >= STAGE_ORDER.length - 1) return null;
  return STAGE_ORDER[idx + 1] ?? null;
}

export function refreshNewsroomDashboard(): void {
  const store = readNdxbookNewsroomStore();
  const pipelineStages = rebuildPipelineColumns(store.pages);
  const next = { ...store, pipelineStages };
  writeNdxbookNewsroomStore({ ...next, dashboard: refreshDashboard(next) });
}
