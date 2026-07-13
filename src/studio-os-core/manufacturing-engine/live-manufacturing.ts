import type { ManufacturingQueue } from './manufacturing-queue';
import type { ManufacturingJobStatus } from './contract';

export const LIVE_MANUFACTURING_VERSION = 'live-manufacturing.v1';

export type LiveManufacturingStage = {
  jobId: string;
  jobNumber: string;
  label: string;
  status: ManufacturingJobStatus;
  progressPercent: number;
  detail: string;
};

export type LiveManufacturingView = {
  viewVersion: typeof LIVE_MANUFACTURING_VERSION;
  planId: string;
  stages: LiveManufacturingStage[];
  overallProgressPercent: number;
  currentStage: string | null;
  completedCount: number;
  totalCount: number;
};

export function initLiveManufacturingView(queue: ManufacturingQueue): LiveManufacturingView {
  return {
    viewVersion: LIVE_MANUFACTURING_VERSION,
    planId: queue.planId,
    stages: queue.jobs.map((j) => ({
      jobId: j.jobId,
      jobNumber: j.jobNumber,
      label: j.assetId,
      status: 'pending',
      progressPercent: 0,
      detail: 'Pending',
    })),
    overallProgressPercent: 0,
    currentStage: null,
    completedCount: 0,
    totalCount: queue.jobs.length,
  };
}

export function updateLiveManufacturingStage(
  view: LiveManufacturingView,
  jobId: string,
  status: ManufacturingJobStatus,
  progressPercent: number,
  detail: string
): LiveManufacturingView {
  const stages = view.stages.map((s) =>
    s.jobId === jobId ? { ...s, status, progressPercent, detail } : s
  );
  const completedCount = stages.filter((s) => s.status === 'completed').length;
  const overallProgressPercent = Math.round(
    stages.reduce((sum, s) => sum + s.progressPercent, 0) / stages.length
  );
  const current = stages.find((s) => s.status === 'rendering' || s.status === 'inspecting') ?? null;

  return {
    ...view,
    stages,
    overallProgressPercent,
    currentStage: current?.label ?? null,
    completedCount,
  };
}

export function formatProgressBar(percent: number, width = 10): string {
  const filled = Math.round((percent / 100) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}
