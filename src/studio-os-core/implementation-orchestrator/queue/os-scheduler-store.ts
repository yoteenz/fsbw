import type { StudioOsJob, SchedulerBudgetConfig } from '../schemas/os-job';
import { OS_SCHEDULER_VERSION, DEFAULT_SCHEDULER_BUDGET } from '../schemas/os-job';
import { CANONICAL_IMPLEMENTATION_TASKS } from '../registry/canonical-pipeline-tasks';
import { MUNICIPAL_JOBS } from '../registry/municipal-jobs';
import { FOUNDER_AUTOMATION_JOBS } from '../registry/founder-automation-jobs';
import { syncImplementationTasksToJobs } from '../bridge/implementation-to-job';
import { reconcileJobStatuses } from '../scheduler/dependency-validator';
import { runSchedulerDispatch, approveJobFounder, approveJobBudget } from '../scheduler/os-scheduler-engine';
import { buildSchedulerDashboard } from '../diagnostics/scheduler-diagnostics';
import { applyRecoveryAction, type RecoveryAction } from '../scheduler/recovery-engine';
import { recordJobLifecycle, persistJobAuditEvents, resetObservabilityLogForTests } from '../scheduler/observability';
import type { CommandCenterSchedulerSnapshot } from '../schemas/scheduler-dashboard';
import { aggregateResourceEstimates } from '../scheduler/resource-governor';
import { reconcileImplementationQueue } from './implementation-store';

export const OS_SCHEDULER_STORE_VERSION = 'os-scheduler-store.v1' as const;
const STORAGE_KEY = 'studioOsScheduler_v1';

export type OsSchedulerStore = {
  storeVersion: typeof OS_SCHEDULER_STORE_VERSION;
  schedulerVersion: typeof OS_SCHEDULER_VERSION;
  jobs: StudioOsJob[];
  paused: boolean;
  budgetConfig: SchedulerBudgetConfig;
  lastReconciledAt: string;
  lastDispatchAt?: string;
};

let memorySchedulerStore: OsSchedulerStore | null = null;

function seedSchedulerStore(): OsSchedulerStore {
  const implJobs = syncImplementationTasksToJobs(CANONICAL_IMPLEMENTATION_TASKS);
  const jobs = reconcileJobStatuses([...implJobs, ...MUNICIPAL_JOBS, ...FOUNDER_AUTOMATION_JOBS]);
  return {
    storeVersion: OS_SCHEDULER_STORE_VERSION,
    schedulerVersion: OS_SCHEDULER_VERSION,
    jobs,
    paused: false,
    budgetConfig: { ...DEFAULT_SCHEDULER_BUDGET },
    lastReconciledAt: new Date().toISOString(),
  };
}

export function readOsSchedulerStore(): OsSchedulerStore {
  if (memorySchedulerStore) return memorySchedulerStore;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as OsSchedulerStore;
        memorySchedulerStore = {
          ...parsed,
          jobs: reconcileJobStatuses(parsed.jobs),
          lastReconciledAt: new Date().toISOString(),
        };
        return memorySchedulerStore;
      }
    } catch {
      /* seed */
    }
  }
  memorySchedulerStore = seedSchedulerStore();
  return memorySchedulerStore;
}

export function writeOsSchedulerStore(store: OsSchedulerStore): void {
  memorySchedulerStore = store;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      /* memory */
    }
  }
}

export function resetOsSchedulerStoreForTests(): void {
  memorySchedulerStore = null;
  resetObservabilityLogForTests();
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}

export function refreshImplementationJobsInScheduler(): OsSchedulerStore {
  const store = readOsSchedulerStore();
  const implStore = reconcileImplementationQueue();
  const existingById = Object.fromEntries(store.jobs.map((j) => [j.jobId, j]));
  const implJobs = syncImplementationTasksToJobs(implStore.tasks).map((job) => {
    const existing = existingById[job.jobId];
    if (!existing) return job;
    return {
      ...job,
      approvalRequirements: existing.approvalRequirements,
      assignedWorkers: existing.assignedWorkers.length ? existing.assignedWorkers : job.assignedWorkers,
      status: existing.status === 'QUEUED' || existing.status === 'RUNNING' || existing.status === 'PAUSED' ? existing.status : job.status,
      auditHistory: [...job.auditHistory, ...existing.auditHistory.filter((e) => e.reason === 'founder-approved' || e.event === 'approved')],
    };
  });
  const nonImpl = store.jobs.filter((j) => !j.implementationTaskId);
  const jobs = reconcileJobStatuses([...implJobs, ...nonImpl]);
  const next = { ...store, jobs, lastReconciledAt: new Date().toISOString() };
  writeOsSchedulerStore(next);
  return next;
}

export function reconcileOsScheduler(): OsSchedulerStore {
  const store = refreshImplementationJobsInScheduler();
  const jobs = reconcileJobStatuses(store.jobs);
  const next = { ...store, jobs, lastReconciledAt: new Date().toISOString() };
  writeOsSchedulerStore(next);
  return next;
}

export function listOsJobs(): StudioOsJob[] {
  return reconcileOsScheduler().jobs;
}

export function getOsJob(jobId: string): StudioOsJob | undefined {
  return listOsJobs().find((j) => j.jobId === jobId);
}

export function setSchedulerPaused(paused: boolean): void {
  const store = readOsSchedulerStore();
  writeOsSchedulerStore({ ...store, paused });
}

export function isSchedulerPaused(): boolean {
  return readOsSchedulerStore().paused;
}

export function getOsSchedulerDashboard() {
  return buildSchedulerDashboard(listOsJobs());
}

export function trySchedulerDispatch() {
  const store = readOsSchedulerStore();
  const { jobs, result } = runSchedulerDispatch(store.jobs, store.paused, store.budgetConfig);
  const next = { ...store, jobs, lastDispatchAt: new Date().toISOString(), lastReconciledAt: new Date().toISOString() };
  writeOsSchedulerStore(next);
  return result;
}

export function approveOsJob(jobId: string): StudioOsJob | undefined {
  const store = readOsSchedulerStore();
  const idx = store.jobs.findIndex((j) => j.jobId === jobId);
  if (idx < 0) return undefined;
  let job = approveJobFounder(store.jobs[idx]!);
  job = approveJobBudget(job);
  recordJobLifecycle(jobId, 'approved', 'founder-approved');
  store.jobs[idx] = job;
  writeOsSchedulerStore({ ...store, jobs: reconcileJobStatuses(store.jobs), lastReconciledAt: new Date().toISOString() });
  return getOsJob(jobId);
}

export function recoverOsJob(jobId: string, action: RecoveryAction): StudioOsJob | undefined {
  const store = readOsSchedulerStore();
  const idx = store.jobs.findIndex((j) => j.jobId === jobId);
  if (idx < 0) return undefined;
  const recovered = applyRecoveryAction(store.jobs[idx]!, action);
  if (!recovered) return undefined;
  store.jobs[idx] = recovered;
  persistJobAuditEvents(jobId, recovered.auditHistory.slice(-1));
  writeOsSchedulerStore({ ...store, jobs: reconcileJobStatuses(store.jobs) });
  return getOsJob(jobId);
}

export function markOsJobCompleted(jobId: string): StudioOsJob | undefined {
  const store = readOsSchedulerStore();
  const idx = store.jobs.findIndex((j) => j.jobId === jobId);
  if (idx < 0) return undefined;
  const job = store.jobs[idx]!;
  const updated: StudioOsJob = {
    ...job,
    status: 'COMPLETED',
    updatedDate: new Date().toISOString(),
    auditHistory: [...job.auditHistory, { event: 'completed', at: new Date().toISOString(), reason: 'manual-complete' }],
  };
  store.jobs[idx] = updated;
  recordJobLifecycle(jobId, 'completed', 'manual-complete');
  writeOsSchedulerStore(reconcileOsScheduler());
  return getOsJob(jobId);
}

export function exportCommandCenterSchedulerSnapshot(): CommandCenterSchedulerSnapshot {
  const dashboard = getOsSchedulerDashboard();
  const active = [...dashboard.running, ...dashboard.queued];
  const aggregate = aggregateResourceEstimates(active.map((j) => j.resourceEstimate));
  const healthScore = dashboard.queueHealth.ok ? (dashboard.alerts.length ? 75 : 92) : 45;
  const capacityStatus =
    dashboard.resources.gpuUtilizationPct > 90
      ? 'critical'
      : dashboard.resources.gpuUtilizationPct > 70
        ? 'strained'
        : 'healthy';

  return {
    source: 'os-scheduler',
    schedulerVersion: OS_SCHEDULER_VERSION,
    dashboard,
    aggregateResources: aggregate,
    healthScore,
    capacityStatus,
  };
}
