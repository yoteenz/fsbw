import type { StudioOsJob } from '../schemas/os-job';

export function areJobDependenciesComplete(job: StudioOsJob, jobsById: Record<string, StudioOsJob>): boolean {
  return job.dependencies.every((depId) => {
    const dep = jobsById[depId];
    return dep?.status === 'COMPLETED' || dep?.status === 'ARCHIVED';
  });
}

export function areJobBlockersResolved(job: StudioOsJob, jobsById: Record<string, StudioOsJob>): boolean {
  return job.blockedBy.every((blockerId) => {
    const blocker = jobsById[blockerId];
    return blocker?.status === 'COMPLETED' || blocker?.status === 'ARCHIVED';
  });
}

export function areJobApprovalsSatisfied(job: StudioOsJob): boolean {
  return job.approvalRequirements.filter((a) => a.required).every((a) => a.satisfied);
}

export type DependencyValidationResult =
  | { ok: true; canDispatch: true }
  | { ok: false; code: 'DEPENDENCIES' | 'BLOCKERS' | 'APPROVALS' | 'PERMITS' | 'ASSETS'; message: string };

export function validateJobDispatch(job: StudioOsJob, jobsById: Record<string, StudioOsJob>): DependencyValidationResult {
  if (!areJobBlockersResolved(job, jobsById)) {
    return { ok: false, code: 'BLOCKERS', message: `${job.title} blocked by unresolved upstream jobs.` };
  }
  if (!areJobDependenciesComplete(job, jobsById)) {
    return { ok: false, code: 'DEPENDENCIES', message: `${job.title} waiting on dependencies.` };
  }
  if (!areJobApprovalsSatisfied(job)) {
    const pending = job.approvalRequirements.filter((a) => a.required && !a.satisfied).map((a) => a.label);
    return { ok: false, code: 'APPROVALS', message: `Pending approvals: ${pending.join(', ')}` };
  }
  const permit = job.approvalRequirements.find((a) => a.type === 'permit' && a.required && !a.satisfied);
  if (permit) {
    return { ok: false, code: 'PERMITS', message: `${job.title} requires municipal permit approval.` };
  }
  const asset = job.approvalRequirements.find((a) => a.type === 'asset' && a.required && !a.satisfied);
  if (asset) {
    return { ok: false, code: 'ASSETS', message: `${job.title} requires required assets before dispatch.` };
  }
  return { ok: true, canDispatch: true };
}

export function computeJobBlockedStatus(job: StudioOsJob, jobsById: Record<string, StudioOsJob>): StudioOsJob['status'] {
  if (job.status === 'COMPLETED' || job.status === 'ARCHIVED' || job.status === 'FAILED' || job.status === 'CANCELLED') {
    return job.status;
  }
  if (job.status === 'RUNNING' || job.status === 'TESTING' || job.status === 'DEPLOYING' || job.status === 'PAUSED') {
    return job.status;
  }
  if (!areJobBlockersResolved(job, jobsById) || !areJobDependenciesComplete(job, jobsById)) {
    return 'BLOCKED';
  }
  const founder = job.approvalRequirements.find((a) => a.type === 'founder' && a.required && !a.satisfied);
  if (founder) return 'FOUNDER_REVIEW';
  return 'READY';
}

export function reconcileJobStatuses(jobs: StudioOsJob[]): StudioOsJob[] {
  const byId = Object.fromEntries(jobs.map((j) => [j.jobId, j]));
  return jobs.map((job) => {
    const nextStatus = computeJobBlockedStatus(job, byId);
    if (nextStatus === job.status) return job;
    const event = nextStatus === 'READY' ? 'unblocked' : nextStatus === 'BLOCKED' ? 'blocked' : 'queued';
    return {
      ...job,
      status: nextStatus,
      updatedDate: new Date().toISOString(),
      auditHistory: [
        ...job.auditHistory,
        { event, at: new Date().toISOString(), reason: `status-${nextStatus}` },
      ],
    };
  });
}
