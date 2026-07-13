import { exportCommandCenterSchedulerSnapshot, getOsSchedulerDashboard, reconcileOsScheduler } from './queue/os-scheduler-store';
import { OS_SCHEDULER_VERSION } from './schemas/os-job';

export type CommandCenterOperationalView = {
  schedulerVersion: string;
  throughput: number;
  healthScore: number;
  capacityStatus: 'healthy' | 'strained' | 'critical';
  workerUtilization: number;
  alerts: string[];
  runningCount: number;
  queuedCount: number;
  blockedCount: number;
  failedCount: number;
  gpuUtilizationPct: number;
  budgetConsumedUsd: number;
};

export function getCommandCenterOperationalView(): CommandCenterOperationalView {
  reconcileOsScheduler();
  const snap = exportCommandCenterSchedulerSnapshot();
  const d = snap.dashboard;
  const workerCount = Object.keys(d.resources.workerAllocation).length;
  const workerLoad = Object.values(d.resources.workerAllocation).reduce((s, n) => s + n, 0);

  return {
    schedulerVersion: OS_SCHEDULER_VERSION,
    throughput: d.throughputPerHour,
    healthScore: snap.healthScore,
    capacityStatus: snap.capacityStatus,
    workerUtilization: workerCount ? Math.round((workerLoad / workerCount) * 100) : 0,
    alerts: d.alerts,
    runningCount: d.running.length,
    queuedCount: d.queued.length,
    blockedCount: d.blocked.length,
    failedCount: d.failed.length,
    gpuUtilizationPct: d.resources.gpuUtilizationPct,
    budgetConsumedUsd: d.resources.budgetConsumedUsd,
  };
}

export { exportCommandCenterSchedulerSnapshot, getOsSchedulerDashboard };
