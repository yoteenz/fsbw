export const OS_SCHEDULER_VERSION = 'os-scheduler.v1' as const;

export const JOB_CLASSES = [
  'implementation',
  'ai-generation',
  'construction',
  'certification',
  'governance',
  'maintenance',
  'automation',
  'analytics',
  'marketplace',
  'financial',
] as const;

export type JobClass = (typeof JOB_CLASSES)[number];

export const JOB_PRIORITIES = ['CRITICAL', 'HIGH', 'NORMAL', 'LOW', 'BACKGROUND'] as const;
export type JobPriority = (typeof JOB_PRIORITIES)[number];

export const JOB_STATUSES = [
  'BACKLOG',
  'PLANNING',
  'BLOCKED',
  'READY',
  'QUEUED',
  'RUNNING',
  'PAUSED',
  'TESTING',
  'FOUNDER_REVIEW',
  'VERIFICATION',
  'DEPLOYING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'ARCHIVED',
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export const JOB_LIFECYCLE_EVENTS = [
  'created',
  'queued',
  'started',
  'paused',
  'retried',
  'completed',
  'failed',
  'cancelled',
  'approved',
  'rejected',
  'blocked',
  'unblocked',
  'rerouted',
  'escalated',
] as const;

export type JobLifecycleEvent = (typeof JOB_LIFECYCLE_EVENTS)[number];

export type ResourceEstimate = {
  gpuUnits: number;
  cpuUnits: number;
  apiCostUsd: number;
  storageMb: number;
  expectedTokens: number;
  expectedRenders: number;
  expectedRetries: number;
  queueDepthImpact: number;
  budgetImpactUsd: number;
};

export type RetryPolicy = {
  maxRetries: number;
  backoffMs: number;
  escalationAfterRetries: number;
  currentRetry: number;
};

export type ApprovalRequirement = {
  type: 'founder' | 'budget' | 'permit' | 'constitutional' | 'asset';
  required: boolean;
  satisfied: boolean;
  label: string;
};

export type JobAuditEvent = {
  event: JobLifecycleEvent;
  at: string;
  reason?: string;
  actor?: string;
  metadata?: Record<string, string | number | boolean>;
};

/** Universal Studio World Operating System Scheduler™ job model. */
export type StudioOsJob = {
  jobVersion: typeof OS_SCHEDULER_VERSION;
  jobId: string;
  jobType: string;
  jobClass: JobClass;
  title: string;
  description: string;
  priority: JobPriority;
  priorityScore: number;
  owner: string;
  originDepartment: string;
  status: JobStatus;
  dependencies: string[];
  blockedBy: string[];
  resourceEstimate: ResourceEstimate;
  estimatedCost: string;
  estimatedDuration: string;
  assignedWorkers: string[];
  approvalRequirements: ApprovalRequirement[];
  retryPolicy: RetryPolicy;
  auditHistory: JobAuditEvent[];
  implementationTaskId?: string;
  createdDate: string;
  updatedDate: string;
};

export type SchedulerBudgetConfig = {
  dailyBudgetUsd: number;
  perJobApprovalThresholdUsd: number;
  gpuCapacityUnits: number;
  cpuCapacityUnits: number;
  maxQueueDepth: number;
};

export const DEFAULT_SCHEDULER_BUDGET: SchedulerBudgetConfig = {
  dailyBudgetUsd: 250,
  perJobApprovalThresholdUsd: 15,
  gpuCapacityUnits: 8,
  cpuCapacityUnits: 16,
  maxQueueDepth: 48,
};
