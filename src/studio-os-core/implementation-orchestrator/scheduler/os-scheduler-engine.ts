import type { StudioOsJob, SchedulerBudgetConfig } from '../schemas/os-job';
import { DEFAULT_SCHEDULER_BUDGET } from '../schemas/os-job';
import { reconcileJobStatuses, validateJobDispatch } from './dependency-validator';
import { evaluateCostGovernor, approveJobBudget } from './cost-governor';
import { dispatchWorkersToJob, evaluateWorkforceDispatch } from './workforce-dispatcher';
import { sortJobsByPriority } from './priority-engine';
import { recordJobLifecycle } from './observability';

export type SchedulerDispatchResult = {
  dispatched: string[];
  blocked: string[];
  skipped: string[];
  reasons: Record<string, string>;
};

export function evaluateJobForDispatch(
  job: StudioOsJob,
  jobsById: Record<string, StudioOsJob>,
  activeJobs: StudioOsJob[],
  config: SchedulerBudgetConfig,
  paused: boolean
): { canDispatch: boolean; reason: string } {
  if (paused) return { canDispatch: false, reason: 'scheduler-paused' };
  if (job.status !== 'READY') return { canDispatch: false, reason: `status-${job.status}` };

  const deps = validateJobDispatch(job, jobsById);
  if (!deps.ok) return { canDispatch: false, reason: deps.message };

  const cost = evaluateCostGovernor(job, activeJobs, config);
  if (!cost.ok) return { canDispatch: false, reason: cost.message };

  const workforce = evaluateWorkforceDispatch(job);
  if (!workforce.dispatched) return { canDispatch: false, reason: workforce.reason };

  return { canDispatch: true, reason: 'dispatch-approved' };
}

export function runSchedulerDispatch(
  jobs: StudioOsJob[],
  paused: boolean,
  config: SchedulerBudgetConfig = DEFAULT_SCHEDULER_BUDGET
): { jobs: StudioOsJob[]; result: SchedulerDispatchResult } {
  const reconciled = reconcileJobStatuses(jobs);
  const byId = Object.fromEntries(reconciled.map((j) => [j.jobId, j]));
  const ready = sortJobsByPriority(reconciled.filter((j) => j.status === 'READY'));

  const dispatched: string[] = [];
  const blocked: string[] = [];
  const skipped: string[] = [];
  const reasons: Record<string, string> = {};

  const mutable = [...reconciled];

  for (const job of ready) {
    const active = mutable.filter((j) => j.status === 'RUNNING' || j.status === 'QUEUED');
    const eval_ = evaluateJobForDispatch(job, byId, active, config, paused);
    const idx = mutable.findIndex((j) => j.jobId === job.jobId);
    if (idx < 0) continue;

    if (!eval_.canDispatch) {
      if (eval_.reason.includes('approval') || eval_.reason.includes('budget')) {
        blocked.push(job.jobId);
      } else {
        skipped.push(job.jobId);
      }
      reasons[job.jobId] = eval_.reason;
      continue;
    }

    const dispatchedJob = dispatchWorkersToJob(mutable[idx]!);
    mutable[idx] = dispatchedJob;
    byId[job.jobId] = dispatchedJob;
    dispatched.push(job.jobId);
    recordJobLifecycle(job.jobId, 'queued', 'scheduler-dispatch');
  }

  return {
    jobs: reconcileJobStatuses(mutable),
    result: { dispatched, blocked, skipped, reasons },
  };
}

export function approveJobFounder(job: StudioOsJob): StudioOsJob {
  return {
    ...job,
    approvalRequirements: job.approvalRequirements.map((a) =>
      a.required ? { ...a, satisfied: true } : a
    ),
    status: job.status === 'FOUNDER_REVIEW' ? 'READY' : job.status,
    updatedDate: new Date().toISOString(),
    auditHistory: [
      ...job.auditHistory,
      { event: 'approved', at: new Date().toISOString(), reason: 'founder-approved', actor: 'founder' },
    ],
  };
}

export { approveJobBudget };
