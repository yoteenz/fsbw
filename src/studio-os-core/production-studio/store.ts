import {
  PRODUCTION_STUDIO_CONNECTED_SYSTEMS,
  PRODUCTION_STUDIO_PHILOSOPHY,
  PRODUCTION_STUDIO_STORAGE_KEY,
  PRODUCTION_STUDIO_VERSION,
} from './constants';
import { readScopedStore, writeScopedStore } from '../workspace/scoped-store';
import type {
  ProductionAssetTypeId,
  ProductionJob,
  ProductionPipelineStageId,
  ProductionQueueStatusId,
  ProductionStudioStore,
} from './types';

function emptyStore(): ProductionStudioStore {
  return {
    version: PRODUCTION_STUDIO_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    companyName: 'COMPANY',
    selectedJobId: null,
    queueFilter: 'all',
    dashboard: {
      summary: 'PRODUCTION STUDIO — cinematic headquarters where approved pages become production-ready media.',
      jobsReady: 0,
      jobsInProduction: 0,
      jobsRendering: 0,
      jobsNeedsReview: 0,
      jobsCompleted: 0,
      avgConfidencePct: 0,
      pagesAwaitingProduction: 0,
    },
    philosophy: [...PRODUCTION_STUDIO_PHILOSOPHY],
    jobs: [],
  };
}

function countByStatus(jobs: ProductionJob[], status: ProductionQueueStatusId): number {
  return jobs.filter((j) => j.queueStatus === status).length;
}

function refreshDashboard(store: ProductionStudioStore): ProductionStudioStore['dashboard'] {
  const jobs = store.jobs;
  const avgConfidence =
    jobs.length === 0
      ? 0
      : Math.round(jobs.reduce((sum, j) => sum + j.intelligence.confidenceScore, 0) / jobs.length);
  return {
    ...store.dashboard,
    jobsReady: countByStatus(jobs, 'ready'),
    jobsInProduction: countByStatus(jobs, 'in-production'),
    jobsRendering: countByStatus(jobs, 'rendering'),
    jobsNeedsReview: countByStatus(jobs, 'needs-review'),
    jobsCompleted: countByStatus(jobs, 'completed'),
    avgConfidencePct: avgConfidence,
    pagesAwaitingProduction: countByStatus(jobs, 'ready'),
  };
}

export function readProductionStudioStore(): ProductionStudioStore {
  if (typeof window === 'undefined') return emptyStore();
  const merged = readScopedStore(PRODUCTION_STUDIO_STORAGE_KEY, emptyStore);
  return { ...merged, dashboard: refreshDashboard(merged) };
}

export function writeProductionStudioStore(store: ProductionStudioStore): void {
  if (typeof window === 'undefined') return;
  const next = { ...store, dashboard: refreshDashboard(store), lastUpdatedAt: new Date().toISOString() };
  writeScopedStore(PRODUCTION_STUDIO_STORAGE_KEY, next);
}

export function bootstrapProductionStudioStore(seed?: Partial<ProductionStudioStore>): void {
  const existing = readProductionStudioStore();
  if (existing.jobs.length > 0 && !seed) return;
  const jobs = seed?.jobs ?? [];
  const selectedJobId = seed?.selectedJobId ?? jobs[0]?.id ?? null;
  writeProductionStudioStore({
    ...emptyStore(),
    ...seed,
    selectedJobId,
    philosophy: seed?.philosophy ?? [...PRODUCTION_STUDIO_PHILOSOPHY],
  });
}

export function selectProductionStudioJob(jobId: string | null): void {
  const store = readProductionStudioStore();
  writeProductionStudioStore({ ...store, selectedJobId: jobId });
}

export function setProductionStudioQueueFilter(filter: ProductionQueueStatusId | 'all'): void {
  const store = readProductionStudioStore();
  writeProductionStudioStore({ ...store, queueFilter: filter });
}

export function setProductionAssetOverride(
  jobId: string,
  assetType: ProductionAssetTypeId,
  value: string
): void {
  const store = readProductionStudioStore();
  const jobs = store.jobs.map((job) => {
    if (job.id !== jobId) return job;
    return {
      ...job,
      assets: job.assets.map((asset) =>
        asset.type === assetType
          ? { ...asset, founderOverride: value, status: 'overridden' as const }
          : asset
      ),
    };
  });
  writeProductionStudioStore({ ...store, jobs });
}

export function clearProductionAssetOverride(jobId: string, assetType: ProductionAssetTypeId): void {
  const store = readProductionStudioStore();
  const jobs = store.jobs.map((job) => {
    if (job.id !== jobId) return job;
    return {
      ...job,
      assets: job.assets.map((asset) =>
        asset.type === assetType
          ? { ...asset, founderOverride: undefined, status: 'ready' as const }
          : asset
      ),
    };
  });
  writeProductionStudioStore({ ...store, jobs });
}

export function advanceProductionPipelineStage(jobId: string): void {
  const store = readProductionStudioStore();
  const stageOrder: ProductionPipelineStageId[] = [
    'page-ready',
    'production-brief',
    'voice-generation',
    'host-assignment',
    'visual-generation',
    'motion-graphics',
    'captions',
    'thumbnail',
    'platform-optimization',
    'preview',
    'render-queue',
  ];
  const jobs = store.jobs.map((job) => {
    if (job.id !== jobId) return job;
    const idx = stageOrder.indexOf(job.pipelineStage);
    const nextStage = idx < stageOrder.length - 1 ? stageOrder[idx + 1] : job.pipelineStage;
    let queueStatus = job.queueStatus;
    if (nextStage === 'render-queue') queueStatus = 'rendering';
    if (nextStage === 'preview') queueStatus = 'needs-review';
    if (nextStage === 'page-ready' && idx === stageOrder.length - 1) queueStatus = 'completed';
    return { ...job, pipelineStage: nextStage, queueStatus };
  });
  writeProductionStudioStore({ ...store, jobs });
}

export function setProductionJobQueueStatus(jobId: string, status: ProductionQueueStatusId): void {
  const store = readProductionStudioStore();
  const jobs = store.jobs.map((job) => (job.id === jobId ? { ...job, queueStatus: status } : job));
  writeProductionStudioStore({ ...store, jobs });
}

export { PRODUCTION_STUDIO_CONNECTED_SYSTEMS };
