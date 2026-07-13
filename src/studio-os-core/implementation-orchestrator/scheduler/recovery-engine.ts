import type { JobLifecycleEvent, StudioOsJob } from '../schemas/os-job';

function audit(job: StudioOsJob, event: JobLifecycleEvent, reason: string): StudioOsJob {
  return {
    ...job,
    updatedDate: new Date().toISOString(),
    auditHistory: [...job.auditHistory, { event, at: new Date().toISOString(), reason, actor: 'os-scheduler' }],
  };
}

export function pauseJob(job: StudioOsJob): StudioOsJob {
  if (job.status !== 'RUNNING' && job.status !== 'QUEUED') return job;
  return { ...audit(job, 'paused', 'manual-pause'), status: 'PAUSED' };
}

export function resumeJob(job: StudioOsJob): StudioOsJob {
  if (job.status !== 'PAUSED') return job;
  return { ...audit(job, 'started', 'manual-resume'), status: 'RUNNING' };
}

export function retryJob(job: StudioOsJob): StudioOsJob | null {
  if (job.status !== 'FAILED') return null;
  const nextRetry = job.retryPolicy.currentRetry + 1;
  if (nextRetry > job.retryPolicy.maxRetries) {
    return { ...audit(job, 'escalated', 'max-retries-exceeded'), status: 'BLOCKED' };
  }
  return {
    ...audit(job, 'retried', `retry-${nextRetry}`),
    status: 'READY',
    retryPolicy: { ...job.retryPolicy, currentRetry: nextRetry },
  };
}

export function cancelJob(job: StudioOsJob): StudioOsJob {
  return { ...audit(job, 'cancelled', 'manual-cancel'), status: 'CANCELLED' };
}

export function failJob(job: StudioOsJob, reason: string): StudioOsJob {
  return { ...audit(job, 'failed', reason), status: 'FAILED' };
}

export function completeJob(job: StudioOsJob): StudioOsJob {
  return { ...audit(job, 'completed', 'job-finished'), status: 'COMPLETED' };
}

export function rerouteJob(job: StudioOsJob, newWorkers: string[]): StudioOsJob {
  return {
    ...audit(job, 'rerouted', 'worker-reroute'),
    assignedWorkers: newWorkers,
    status: job.status === 'FAILED' ? 'READY' : job.status,
  };
}

export function rollbackJob(job: StudioOsJob): StudioOsJob {
  return {
    ...audit(job, 'retried', 'rollback-to-ready'),
    status: 'READY',
    retryPolicy: { ...job.retryPolicy, currentRetry: 0 },
  };
}

export type RecoveryAction = 'retry' | 'pause' | 'resume' | 'rollback' | 'reroute' | 'cancel' | 'escalate';

export function applyRecoveryAction(job: StudioOsJob, action: RecoveryAction, payload?: { workers?: string[] }): StudioOsJob | null {
  switch (action) {
    case 'retry':
      return retryJob(job);
    case 'pause':
      return pauseJob(job);
    case 'resume':
      return resumeJob(job);
    case 'rollback':
      return rollbackJob(job);
    case 'reroute':
      return rerouteJob(job, payload?.workers ?? job.assignedWorkers);
    case 'cancel':
      return cancelJob(job);
    case 'escalate':
      return { ...audit(job, 'escalated', 'manual-escalation'), status: 'FOUNDER_REVIEW' };
    default:
      return job;
  }
}
