import {
  RENDER_PIPELINE_STAGES,
  RENDER_QUEUE_PHILOSOPHY,
  RENDER_QUEUE_STORAGE_KEY,
  RENDER_QUEUE_VERSION,
} from './constants';
import { readScopedStore, writeScopedStore } from '../workspace/scoped-store';
import type { RenderJob, RenderPipelineStageId, RenderQueueStore } from './types';

function emptyStore(): RenderQueueStore {
  return {
    version: RENDER_QUEUE_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    companyName: 'COMPANY',
    selectedRenderId: null,
    batchMode: false,
    selectedBatchIds: [],
    dashboard: {
      summary: 'RENDER QUEUE — centralized production floor · every AI worker visible.',
      activeRenders: 0,
      pausedRenders: 0,
      queuedCount: 0,
      readyForReview: 0,
      avgConfidencePct: 0,
      floorActivityPct: 0,
    },
    philosophy: [...RENDER_QUEUE_PHILOSOPHY],
    renders: [],
    intelligenceAlerts: [],
  };
}

function refreshDashboard(store: RenderQueueStore): RenderQueueStore['dashboard'] {
  const renders = store.renders.filter((r) => r.controlState !== 'cancelled');
  const active = renders.filter((r) => r.controlState === 'running' && r.stage !== 'ready-for-review' && r.stage !== 'queued');
  const paused = renders.filter((r) => r.controlState === 'paused');
  const queued = renders.filter((r) => r.stage === 'queued');
  const ready = renders.filter((r) => r.stage === 'ready-for-review');
  const avgConf =
    renders.length === 0 ? 0 : Math.round(renders.reduce((s, r) => s + r.confidencePct, 0) / renders.length);
  const activity = renders.length === 0 ? 0 : Math.round((active.length / renders.length) * 100);
  return {
    ...store.dashboard,
    activeRenders: active.length,
    pausedRenders: paused.length,
    queuedCount: queued.length,
    readyForReview: ready.length,
    avgConfidencePct: avgConf,
    floorActivityPct: activity,
  };
}

export function readRenderQueueStore(): RenderQueueStore {
  if (typeof window === 'undefined') return emptyStore();
  const merged = readScopedStore(RENDER_QUEUE_STORAGE_KEY, emptyStore);
  return { ...merged, dashboard: refreshDashboard(merged) };
}

export function writeRenderQueueStore(store: RenderQueueStore): void {
  if (typeof window === 'undefined') return;
  const next = { ...store, dashboard: refreshDashboard(store), lastUpdatedAt: new Date().toISOString() };
  writeScopedStore(RENDER_QUEUE_STORAGE_KEY, next);
}

export function bootstrapRenderQueueStore(seed?: Partial<RenderQueueStore>): void {
  const existing = readRenderQueueStore();
  if (existing.renders.length > 0 && !seed) return;
  const renders = seed?.renders ?? [];
  writeRenderQueueStore({
    ...emptyStore(),
    ...seed,
    selectedRenderId: seed?.selectedRenderId ?? renders[0]?.id ?? null,
    philosophy: seed?.philosophy ?? [...RENDER_QUEUE_PHILOSOPHY],
  });
}

export function selectRenderJob(renderId: string | null): void {
  const store = readRenderQueueStore();
  writeRenderQueueStore({ ...store, selectedRenderId: renderId });
}

export function setRenderQueueBatchMode(enabled: boolean): void {
  const store = readRenderQueueStore();
  writeRenderQueueStore({ ...store, batchMode: enabled, selectedBatchIds: enabled ? store.selectedBatchIds : [] });
}

export function toggleRenderBatchSelection(renderId: string): void {
  const store = readRenderQueueStore();
  const ids = store.selectedBatchIds.includes(renderId)
    ? store.selectedBatchIds.filter((id) => id !== renderId)
    : [...store.selectedBatchIds, renderId];
  writeRenderQueueStore({ ...store, selectedBatchIds: ids });
}

export function pauseRenderJob(renderId: string): void {
  updateRender(renderId, (r) => ({ ...r, controlState: 'paused' }));
}

export function resumeRenderJob(renderId: string): void {
  updateRender(renderId, (r) => ({ ...r, controlState: 'running' }));
}

export function cancelRenderJob(renderId: string): void {
  updateRender(renderId, (r) => ({ ...r, controlState: 'cancelled', progressPct: 0 }));
}

export function duplicateRenderJob(renderId: string): void {
  const store = readRenderQueueStore();
  const source = store.renders.find((r) => r.id === renderId);
  if (!source) return;
  const copy: RenderJob = {
    ...source,
    id: `${source.id}-dup-${Date.now()}`,
    stage: 'queued',
    controlState: 'running',
    progressPct: 0,
    startedAt: new Date().toISOString(),
    elapsedSec: 0,
    warnings: [],
  };
  writeRenderQueueStore({ ...store, renders: [...store.renders, copy], selectedRenderId: copy.id });
}

export function setRenderPriority(renderId: string, priority: RenderJob['priority']): void {
  updateRender(renderId, (r) => ({ ...r, priority }));
}

export function startBatchRender(renderIds: string[]): void {
  const store = readRenderQueueStore();
  const ids = new Set(renderIds);
  const batchId = `batch-${Date.now()}`;
  const renders = store.renders.map((r) =>
    ids.has(r.id) ? { ...r, batchId, controlState: 'running' as const, stage: r.stage === 'ready-for-review' ? r.stage : ('generating-script' as RenderPipelineStageId) } : r
  );
  writeRenderQueueStore({ ...store, renders, batchMode: false, selectedBatchIds: [] });
}

function updateRender(renderId: string, fn: (r: RenderJob) => RenderJob): void {
  const store = readRenderQueueStore();
  const renders = store.renders.map((r) => (r.id === renderId ? fn(r) : r));
  writeRenderQueueStore({ ...store, renders });
}

/** Demo tick — advance progress on running jobs for alive floor feel. */
export function tickRenderQueueSimulation(): void {
  const store = readRenderQueueStore();
  const stageOrder = RENDER_PIPELINE_STAGES.map((s) => s.id);
  let changed = false;

  const renders = store.renders.map((job) => {
    if (job.controlState !== 'running' || job.stage === 'ready-for-review' || job.stage === 'queued') {
      if (job.controlState === 'running' && job.stage !== 'ready-for-review') {
        return { ...job, elapsedSec: job.elapsedSec + 2 };
      }
      return job;
    }

    changed = true;
    const increment = job.priority === 'high' ? 4 : 2;
    let progress = Math.min(100, job.progressPct + increment);
    let stage: RenderPipelineStageId = job.stage;
    let elapsedSec = job.elapsedSec + 2;

    if (progress >= 100) {
      const idx = stageOrder.indexOf(job.stage);
      if (idx < stageOrder.length - 1) {
        const nextStage = stageOrder[idx + 1] as RenderPipelineStageId;
        stage = nextStage;
        progress = nextStage === 'ready-for-review' ? 100 : 8 + Math.floor(Math.random() * 12);
        if (nextStage === 'ready-for-review') {
          return { ...job, stage: nextStage, progressPct: 100, elapsedSec, controlState: 'complete' as const };
        }
      }
    }

    return { ...job, stage, progressPct: progress, elapsedSec };
  });

  if (changed) {
    writeRenderQueueStore({ ...store, renders });
  }
}

export function getStageIndex(stage: RenderPipelineStageId): number {
  return RENDER_PIPELINE_STAGES.findIndex((s) => s.id === stage);
}
