import type {
  WORKFLOW_ANALYTICS_METRICS,
  WORKFLOW_ENGINE_PHILOSOPHY,
  WORKFLOW_NODE_TYPES,
  WORKFLOW_PROCESS_TYPES,
  WORKFLOW_TESTING_MODES,
} from './constants';

export type WorkflowNodeType = (typeof WORKFLOW_NODE_TYPES)[number];
export type WorkflowProcessType = (typeof WORKFLOW_PROCESS_TYPES)[number];
export type WorkflowTestingMode = (typeof WORKFLOW_TESTING_MODES)[number];
export type WorkflowAnalyticsMetricId = (typeof WORKFLOW_ANALYTICS_METRICS)[number];
export type WorkflowPhilosophyLine = (typeof WORKFLOW_ENGINE_PHILOSOPHY)[number];

export type WorkflowNodeEntry = {
  nodeType: WorkflowNodeType;
  label: string;
  description: string;
  draggable: true;
  category: 'flow' | 'intelligence' | 'communication' | 'integration' | 'terminal';
  iconHint: string;
};

export type WorkflowProcessTemplate = {
  processId: WorkflowProcessType;
  name: string;
  description: string;
  nodeCount: number;
  status: 'published' | 'draft' | 'testing';
  repeatable: true;
};

export type WorkflowDefinition = {
  workflowId: string;
  name: string;
  processType: WorkflowProcessType;
  status: 'published' | 'draft' | 'testing';
  nodeCount: number;
  lastRunAt?: string;
  completionRatePct: number;
};

export type WorkflowTestingCapability = {
  mode: WorkflowTestingMode;
  label: string;
  description: string;
  requiredBeforePublish: boolean;
};

export type WorkflowAnalyticsMetric = {
  metricId: WorkflowAnalyticsMetricId;
  label: string;
  value: string;
  scorePct: number;
  trend: 'stable' | 'up' | 'down';
  detail: string;
};

export type WorkflowOptimizationSuggestion = {
  id: string;
  title: string;
  detail: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: string;
};

export type WorkflowGovernanceFinding = {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  recommendation: string;
};

export type OrganizationWorkflowEngineProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  choreographyScore: number;
  builderReadyPct: number;
  testingScorePct: number;
  analyticsScorePct: number;
  nodeCatalog: WorkflowNodeEntry[];
  processTemplates: WorkflowProcessTemplate[];
  workflows: WorkflowDefinition[];
  testingCapabilities: WorkflowTestingCapability[];
  analyticsMetrics: WorkflowAnalyticsMetric[];
  optimizationSuggestions: WorkflowOptimizationSuggestion[];
  governanceFindings: WorkflowGovernanceFinding[];
  activeWorkflowCount: number;
  publishedWorkflowCount: number;
  dockChoreographyLine: string;
  livingSystems: true;
  lastSyncedAt: string;
};

export type WorkflowEngineStore = {
  version: string;
  profiles: OrganizationWorkflowEngineProfile[];
};

export type WorkflowEngineDockAdvice = {
  response: string;
  concierge: string;
  choreographyScore?: number;
};

export type WorkflowSearchHit = {
  type: 'node' | 'process' | 'workflow' | 'testing' | 'analytics';
  id: string;
  label: string;
  score: number;
  matchReason: string;
};
