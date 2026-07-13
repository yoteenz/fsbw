import type { ManufacturingQueue } from '../manufacturing-engine/manufacturing-queue';
import type { ManufacturingJobStatus } from '../manufacturing-engine/contract';
import { formatProgressBar } from '../manufacturing-engine/live-manufacturing';

export const LIVE_CONSTRUCTION_VERSION = 'live-construction.v1';

export type LiveConstructionStage = {
  jobId: string;
  jobNumber: string;
  label: string;
  status: ManufacturingJobStatus | 'pending';
  progressPercent: number;
  progressBar: string;
  detail: string;
};

export type LiveConstructionView = {
  viewVersion: typeof LIVE_CONSTRUCTION_VERSION;
  planId: string;
  stages: LiveConstructionStage[];
  overallProgressPercent: number;
  currentStage: string | null;
};

export function initLiveConstructionView(queue: ManufacturingQueue): LiveConstructionView {
  return {
    viewVersion: LIVE_CONSTRUCTION_VERSION,
    planId: queue.planId,
    stages: queue.jobs.map((j) => ({
      jobId: j.jobId,
      jobNumber: j.jobNumber,
      label: j.assetId,
      status: 'pending',
      progressPercent: 0,
      progressBar: formatProgressBar(0),
      detail: 'Pending',
    })),
    overallProgressPercent: 0,
    currentStage: null,
  };
}

export function updateLiveConstructionStage(
  view: LiveConstructionView,
  jobId: string,
  status: LiveConstructionStage['status'],
  progressPercent: number,
  detail: string
): LiveConstructionView {
  const stages = view.stages.map((s) =>
    s.jobId === jobId
      ? { ...s, status, progressPercent, progressBar: formatProgressBar(progressPercent), detail }
      : s
  );
  const overallProgressPercent = Math.round(stages.reduce((sum, s) => sum + s.progressPercent, 0) / stages.length);
  const current = stages.find((s) => s.status === 'rendering' || s.status === 'inspecting') ?? null;

  return {
    ...view,
    stages,
    overallProgressPercent,
    currentStage: current?.label ?? null,
  };
}
