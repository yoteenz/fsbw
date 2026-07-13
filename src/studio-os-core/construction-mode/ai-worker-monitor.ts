import type { ManufacturingWorkerRole } from '../manufacturing-engine/contract';
import type { ManufacturingQueue } from '../manufacturing-engine/manufacturing-queue';
import { assignFactoryWorker } from '../manufacturing-engine/ai-factory-workers';

export const AI_WORKER_MONITOR_VERSION = 'ai-worker-monitor.v1';

export type WorkerMonitorStatus = 'running' | 'idle' | 'rendering' | 'queued' | 'offline' | 'inspecting';

export type WorkerMonitorNode = {
  workerRole: ManufacturingWorkerRole;
  label: string;
  status: WorkerMonitorStatus;
  currentJobId: string | null;
  currentAssetId: string | null;
  providerModel: string;
};

export type AiWorkerMonitor = {
  monitorVersion: typeof AI_WORKER_MONITOR_VERSION;
  planId: string;
  workers: WorkerMonitorNode[];
};

const WORKER_LABELS: Record<ManufacturingWorkerRole, string> = {
  'architect-worker': 'Architecture Worker',
  'hero-asset-worker': 'Hero Worker',
  'furniture-worker': 'Furniture Worker',
  'decor-worker': 'Decor Worker',
  'lighting-worker': 'Lighting Worker',
  'animation-worker': 'Animation Worker',
  'particle-worker': 'Particle Worker',
  'material-worker': 'Material Worker',
  'background-removal-worker': 'Background Worker',
  'upscaling-worker': 'Upscaling Worker',
  'optimization-worker': 'Quality Worker',
};

export function buildAiWorkerMonitor(input: {
  queue: ManufacturingQueue;
  organizationId: string;
  activeJobId?: string | null;
}): AiWorkerMonitor {
  const roleSet = new Set<ManufacturingWorkerRole>();
  const workers: WorkerMonitorNode[] = [];

  for (const job of input.queue.jobs) {
    const assignment = assignFactoryWorker({ job, organizationId: input.organizationId });
    if (roleSet.has(assignment.workerRole)) continue;
    roleSet.add(assignment.workerRole);

    const isActive = input.activeJobId === job.jobId;
    workers.push({
      workerRole: assignment.workerRole,
      label: WORKER_LABELS[assignment.workerRole],
      status: isActive ? 'running' : job.status === 'pending' ? 'queued' : 'idle',
      currentJobId: isActive ? job.jobId : null,
      currentAssetId: isActive ? job.assetId : null,
      providerModel: assignment.providerModel,
    });
  }

  return {
    monitorVersion: AI_WORKER_MONITOR_VERSION,
    planId: input.queue.planId,
    workers,
  };
}

export function updateWorkerMonitorStatus(
  monitor: AiWorkerMonitor,
  workerRole: ManufacturingWorkerRole,
  status: WorkerMonitorStatus,
  jobId?: string | null,
  assetId?: string | null
): AiWorkerMonitor {
  return {
    ...monitor,
    workers: monitor.workers.map((w) =>
      w.workerRole === workerRole
        ? { ...w, status, currentJobId: jobId ?? w.currentJobId, currentAssetId: assetId ?? w.currentAssetId }
        : w
    ),
  };
}
