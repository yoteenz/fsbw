export const IMPLEMENTATION_ORCHESTRATOR_VERSION = 'implementation-orchestrator.v1' as const;

export const IMPLEMENTATION_STATUSES = [
  'BACKLOG',
  'PLANNING',
  'BLOCKED',
  'READY',
  'QUEUED',
  'RUNNING',
  'TESTING',
  'FOUNDER_REVIEW',
  'VERIFICATION',
  'DEPLOYING',
  'DEPLOYED',
  'FAILED',
  'ARCHIVED',
] as const;

export type ImplementationStatus = (typeof IMPLEMENTATION_STATUSES)[number];

export const EXECUTION_MODES = ['MANUAL', 'ASSISTED', 'AUTONOMOUS'] as const;
export type ExecutionMode = (typeof EXECUTION_MODES)[number];

export type ImplementationCategory =
  | 'architecture'
  | 'schema'
  | 'permissions'
  | 'ai-routing'
  | 'documentation'
  | 'tests'
  | 'diagnostics'
  | 'refactor'
  | 'governance'
  | 'marketplace'
  | 'billing'
  | 'licensing'
  | 'pipeline'
  | 'infrastructure';

export type StateTransition = {
  from: ImplementationStatus | null;
  to: ImplementationStatus;
  at: string;
  reason: string;
  commitSha?: string;
  deploymentSha?: string;
};

export type ImplementationTask = {
  taskVersion: typeof IMPLEMENTATION_ORCHESTRATOR_VERSION;
  taskId: string;
  title: string;
  description: string;
  category: ImplementationCategory;
  priority: number;
  status: ImplementationStatus;
  createdDate: string;
  updatedDate: string;
  blockedBy: string[];
  unlocks: string[];
  dependencies: string[];
  implementationSpec: string;
  acceptanceCriteria: string[];
  verificationCriteria: string[];
  requiredTests: string[];
  estimatedEffort: string;
  estimatedCost: string;
  executionMode: ExecutionMode;
  owner: string;
  assignedWorker?: string;
  currentCommit?: string;
  deployment?: string;
  founderApprovalRequired: boolean;
  founderApproved?: boolean;
  history: StateTransition[];
};

export type ImplementationPacket = {
  packetVersion: typeof IMPLEMENTATION_ORCHESTRATOR_VERSION;
  taskId: string;
  title: string;
  purpose: string;
  dependencies: string[];
  acceptanceCriteria: string[];
  tests: string[];
  implementationSpec: string;
  blockedItems: string[];
  expectedOutputs: string[];
  risk: 'low' | 'medium' | 'high';
  estimatedDuration: string;
  executionMode: ExecutionMode;
  founderApprovalRequired: boolean;
};

export type SprintHistoryRecord = {
  sprintId: string;
  title: string;
  commitSha?: string;
  deploymentSha?: string;
  completedAt: string;
  tasksCompleted: string[];
  tasksUnlocked: string[];
  testsPassed: string[];
  verificationNotes: string[];
  futureRecommendations: string[];
};
