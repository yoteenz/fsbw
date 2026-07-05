/** Work Orchestration Engine V1.0 — organizational execution without manual task management (Milestone 45). */

export type WorkOrchestrationWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os';

export type WorkHierarchyLevel =
  | 'organizational-objective'
  | 'initiative'
  | 'campaign'
  | 'work-package'
  | 'deliverables'
  | 'activities'
  | 'dependencies'
  | 'completion';

export type ActivityStatus = 'pending' | 'ready' | 'in-progress' | 'blocked' | 'complete' | 'automated';
export type ActivityExecutor = 'automation' | 'human' | 'ai-worker' | 'agency' | 'freelancer' | 'executive';
export type WorkPackageStatus = 'planning' | 'active' | 'at-risk' | 'complete';
export type TimelineZoom = 'day' | 'week' | 'month' | 'quarter' | 'year';
export type DependencyStatus = 'waiting' | 'ready' | 'blocked' | 'complete';

export type WorkActivity = {
  id: string;
  workPackageId: string;
  title: string;
  department: string;
  assignedTo: string;
  executor: ActivityExecutor;
  status: ActivityStatus;
  priority: number;
  estimatedMins: number;
  dependsOn: string[];
  dnaLayers: string[];
  automated: boolean;
  blockerReason?: string;
};

export type WorkDependency = {
  id: string;
  fromActivityId: string;
  fromLabel: string;
  toActivityId: string;
  toLabel: string;
  status: DependencyStatus;
  blocker: boolean;
};

export type WorkPackage = {
  id: string;
  workspaceId: WorkOrchestrationWorkspaceId;
  name: string;
  campaignId: string;
  campaignLabel: string;
  initiativeLabel: string;
  objectiveLabel: string;
  status: WorkPackageStatus;
  healthPct: number;
  activityCount: number;
  deliverableCount: number;
  departmentCount: number;
  departments: string[];
  estimatedCompletion: string;
  ownerExecutive: string;
};

export type WorkGenerationTemplate = {
  id: string;
  trigger: string;
  source: 'campaign' | 'strategy' | 'newsroom' | 'simulation' | 'executive-decision';
  generatedActivities: string[];
};

export type DepartmentCapacity = {
  department: string;
  capacityPct: number;
  workloadPct: number;
  availablePct: number;
  status: 'healthy' | 'loaded' | 'overloaded' | 'idle';
  estimatedCompletion: string;
  conflict?: string;
};

export type ExecutiveQueueItem = {
  executiveId: string;
  executiveTitle: string;
  todayPriorities: string[];
  recommendedSequence: string[];
  estimatedCompletion: string;
  dependencies: string[];
  confidencePct: number;
};

export type FounderWorkspaceSnapshot = {
  organizationalPriorities: string[];
  leadershipRequired: string[];
  strategicApprovals: string[];
  majorRisks: string[];
  majorOpportunities: string[];
  estimatedFounderWorkloadMins: number;
  briefingSummary: string;
};

export type DynamicPriorityAdjustment = {
  id: string;
  workPackageId: string;
  reason: string;
  source: 'strategy' | 'deadline' | 'campaign-health' | 'capacity' | 'risk' | 'opportunity' | 'executive' | 'studio-intelligence' | 'founder-override';
  adjustment: string;
  at: string;
};

export type TimelineEntry = {
  id: string;
  label: string;
  type: 'campaign' | 'initiative' | 'deliverable' | 'activity' | 'milestone';
  startAt: string;
  endAt: string;
  workPackageId?: string;
  department?: string;
};

export type OperationalHealthScore = {
  executionVelocity: number;
  organizationalEfficiency: number;
  departmentHealth: number;
  resourceUtilization: number;
  bottleneckScore: number;
  executionConfidence: number;
  deliveryRisk: number;
  overallPct: number;
  recommendations: string[];
};

export type KnowledgeContribution = {
  id: string;
  activityId: string;
  type: 'institutional-knowledge' | 'workflow-improvement' | 'playbook-update' | 'automation-candidate';
  title: string;
  detail: string;
};

export type CosOrchestrationAction = {
  id: string;
  action: string;
  target: string;
  reason: string;
  status: 'pending' | 'complete';
};

export type WorkOrchestrationStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: WorkOrchestrationWorkspaceId;
  dashboard: {
    summary: string;
    activeWorkPackages: number;
    totalActivities: number;
    blockedActivities: number;
    automatedActivities: number;
    founderWorkloadMins: number;
    operationalHealthPct: number;
  };
  hierarchyLevels: { level: WorkHierarchyLevel; label: string; description: string }[];
  workPackages: WorkPackage[];
  activities: WorkActivity[];
  dependencies: WorkDependency[];
  generationTemplates: WorkGenerationTemplate[];
  departmentCapacity: DepartmentCapacity[];
  executiveQueues: ExecutiveQueueItem[];
  founderWorkspace: FounderWorkspaceSnapshot;
  priorityAdjustments: DynamicPriorityAdjustment[];
  timeline: TimelineEntry[];
  operationalHealth: OperationalHealthScore;
  knowledgeContributions: KnowledgeContribution[];
  cosActions: CosOrchestrationAction[];
  timelineZoom: TimelineZoom;
  selectedWorkPackageId: string | null;
};
