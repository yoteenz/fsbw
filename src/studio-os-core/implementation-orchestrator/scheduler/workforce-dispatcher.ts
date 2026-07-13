import type { JobLifecycleEvent, StudioOsJob } from '../schemas/os-job';
import { AI_WORKFORCE_DIRECTORY } from '../../department-bible/registry/ai-workforce-directory';

export type WorkforceDispatchResult = {
  jobId: string;
  dispatched: boolean;
  assignedWorkers: string[];
  reason: string;
};

const WORKER_ROLE_MAP: Record<string, string[]> = {
  implementation: ['Queue Dispatcher', 'Worker Orchestrator'],
  'ai-generation': ['Blueprint Architect', 'Prompt Compiler', 'Asset Artist'],
  construction: ['Assembly Worker', 'Manufacturing Validator'],
  certification: ['Parity Inspector', 'Composition Validator'],
  governance: ['Governance AI', 'IP Validator', 'Permit Reviewer'],
  maintenance: ['Recovery AI', 'Diagnostics AI'],
  automation: ['Queue Dispatcher', 'Capacity Planner'],
  analytics: ['Operations AI', 'Monitoring AI'],
  marketplace: ['Commerce AI', 'Marketplace Inspector', 'Compatibility Checker'],
  financial: ['Commerce AI', 'Licensing Agent'],
};

export function resolveWorkersForJob(job: StudioOsJob): string[] {
  const roleNames = WORKER_ROLE_MAP[job.jobClass] ?? ['Worker Orchestrator'];
  const workers = AI_WORKFORCE_DIRECTORY.workers.filter((w) =>
    roleNames.some((role) => w.displayName.includes(role) || role.includes(w.displayName))
  );
  const deptWorkers = AI_WORKFORCE_DIRECTORY.workers.filter((w) => w.departmentId === job.originDepartment);
  const combined = [...workers, ...deptWorkers];
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const w of combined) {
    if (!seen.has(w.workerId)) {
      seen.add(w.workerId);
      ids.push(w.workerId);
    }
  }
  return ids.slice(0, 3);
}

export function dispatchWorkersToJob(job: StudioOsJob): StudioOsJob {
  const workers = resolveWorkersForJob(job);
  return {
    ...job,
    assignedWorkers: workers,
    status: 'QUEUED',
    updatedDate: new Date().toISOString(),
    auditHistory: appendAudit(job, 'queued', 'workforce-dispatch', { workers: workers.join(',') }),
  };
}

function appendAudit(
  job: StudioOsJob,
  event: JobLifecycleEvent,
  reason: string,
  metadata?: Record<string, string | number | boolean>
): StudioOsJob['auditHistory'] {
  return [...job.auditHistory, { event, at: new Date().toISOString(), reason, actor: 'os-scheduler', metadata }];
}

export function evaluateWorkforceDispatch(job: StudioOsJob): WorkforceDispatchResult {
  if (job.status !== 'READY') {
    return { jobId: job.jobId, dispatched: false, assignedWorkers: [], reason: `status-${job.status}` };
  }
  const workers = resolveWorkersForJob(job);
  if (!workers.length) {
    return { jobId: job.jobId, dispatched: false, assignedWorkers: [], reason: 'no-workers-available' };
  }
  return { jobId: job.jobId, dispatched: true, assignedWorkers: workers, reason: 'scheduler-dispatch' };
}

export function countWorkerAllocation(jobs: StudioOsJob[]): Record<string, number> {
  const allocation: Record<string, number> = {};
  for (const job of jobs) {
    if (job.status !== 'RUNNING' && job.status !== 'QUEUED') continue;
    for (const workerId of job.assignedWorkers) {
      allocation[workerId] = (allocation[workerId] ?? 0) + 1;
    }
  }
  return allocation;
}
