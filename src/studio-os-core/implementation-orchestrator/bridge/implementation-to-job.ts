import type { ImplementationTask, ImplementationStatus } from '../schemas/implementation-task';
import type { StudioOsJob, JobClass, JobStatus, ResourceEstimate } from '../schemas/os-job';
import { OS_SCHEDULER_VERSION } from '../schemas/os-job';
import { mapLegacyPriority, priorityToScore } from '../scheduler/priority-engine';

const STATUS_MAP: Record<ImplementationStatus, JobStatus> = {
  BACKLOG: 'BACKLOG',
  PLANNING: 'PLANNING',
  BLOCKED: 'BLOCKED',
  READY: 'READY',
  QUEUED: 'QUEUED',
  RUNNING: 'RUNNING',
  TESTING: 'TESTING',
  FOUNDER_REVIEW: 'FOUNDER_REVIEW',
  VERIFICATION: 'VERIFICATION',
  DEPLOYING: 'DEPLOYING',
  DEPLOYED: 'COMPLETED',
  FAILED: 'FAILED',
  ARCHIVED: 'ARCHIVED',
};

const CATEGORY_CLASS: Partial<Record<ImplementationTask['category'], JobClass>> = {
  architecture: 'implementation',
  schema: 'implementation',
  permissions: 'governance',
  'ai-routing': 'ai-generation',
  documentation: 'implementation',
  tests: 'implementation',
  diagnostics: 'maintenance',
  refactor: 'implementation',
  governance: 'governance',
  marketplace: 'marketplace',
  billing: 'financial',
  licensing: 'financial',
  pipeline: 'construction',
  infrastructure: 'maintenance',
};

function parseCostUsd(cost: string): number {
  const match = cost.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 5;
}

function estimateResources(task: ImplementationTask): ResourceEstimate {
  const cost = parseCostUsd(task.estimatedCost);
  const isAi = task.category === 'ai-routing' || task.category === 'pipeline';
  return {
    gpuUnits: isAi ? 2 : 0.5,
    cpuUnits: isAi ? 1 : 2,
    apiCostUsd: cost * 0.6,
    storageMb: isAi ? 128 : 32,
    expectedTokens: isAi ? 12000 : 2000,
    expectedRenders: isAi ? 4 : 0,
    expectedRetries: 1,
    queueDepthImpact: 1,
    budgetImpactUsd: cost,
  };
}

export function implementationTaskToJob(task: ImplementationTask): StudioOsJob {
  const priority = mapLegacyPriority(task.priority);
  const jobClass = CATEGORY_CLASS[task.category] ?? 'implementation';
  return {
    jobVersion: OS_SCHEDULER_VERSION,
    jobId: `impl-${task.taskId}`,
    jobType: 'implementation',
    jobClass,
    title: task.title,
    description: task.description,
    priority,
    priorityScore: priorityToScore(priority),
    owner: task.owner,
    originDepartment: task.category === 'pipeline' ? 'construction-mode' : 'experience-lab',
    status: STATUS_MAP[task.status],
    dependencies: task.dependencies.map((d) => `impl-${d}`),
    blockedBy: task.blockedBy.map((b) => `impl-${b}`),
    resourceEstimate: estimateResources(task),
    estimatedCost: task.estimatedCost,
    estimatedDuration: task.estimatedEffort,
    assignedWorkers: task.assignedWorker ? [task.assignedWorker] : [],
    approvalRequirements: [
      {
        type: 'founder',
        required: task.founderApprovalRequired,
        satisfied: !!task.founderApproved,
        label: 'Founder approval',
      },
      {
        type: 'budget',
        required: parseCostUsd(task.estimatedCost) >= 15,
        satisfied: !!task.founderApproved,
        label: 'Budget approval',
      },
    ],
    retryPolicy: { maxRetries: 3, backoffMs: 5000, escalationAfterRetries: 2, currentRetry: 0 },
    auditHistory: task.history.map((h) => ({
      event: h.to === 'DEPLOYED' ? 'completed' : h.to === 'FAILED' ? 'failed' : h.to === 'BLOCKED' ? 'blocked' : 'queued',
      at: h.at,
      reason: h.reason,
      metadata: { from: h.from ?? '', to: h.to },
    })),
    implementationTaskId: task.taskId,
    createdDate: task.createdDate,
    updatedDate: task.updatedDate,
  };
}

export function jobToImplementationStatus(status: JobStatus): ImplementationStatus {
  const reverse: Partial<Record<JobStatus, ImplementationStatus>> = {
    COMPLETED: 'DEPLOYED',
    CANCELLED: 'ARCHIVED',
    PAUSED: 'RUNNING',
  };
  return (reverse[status] ?? status) as ImplementationStatus;
}

export function syncImplementationTasksToJobs(tasks: ImplementationTask[]): StudioOsJob[] {
  return tasks.map(implementationTaskToJob);
}
