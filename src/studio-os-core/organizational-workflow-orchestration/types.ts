/** Organizational Workflow Orchestration V1.0 — cross-functional workflow choreography (Milestone 69). */

export type OrganizationalWorkflowOrchestrationWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'portfolio';

export type WorkflowType = {
  id: string;
  type: string;
  description: string;
};

export type ActiveWorkflow = {
  id: string;
  name: string;
  type: string;
  status: 'planning' | 'active' | 'adapting' | 'complete' | 'paused';
  objective: string;
  executiveOwner: string;
  departments: string[];
};

export type CrossFunctionalCoordination = {
  id: string;
  workflowId: string;
  workflow: string;
  executives: string[];
  architects: string[];
  departments: string[];
  knowledgeAssets: string[];
  executionOrder: string;
  participantBrief: string;
};

export type WorkflowIntelligence = {
  id: string;
  workflow: string;
  strategy: string;
  departmentResponsibilities: string;
  dependencies: string[];
  knowledgeRequirements: string[];
  relationshipOpportunities: string[];
  risks: string[];
  timeline: string;
  resourceAllocation: string;
  confidence: number;
  alternativePaths: string;
  organizationRationale: string;
};

export type LivingWorkflowAdaptation = {
  id: string;
  workflow: string;
  trigger: string;
  executive: string;
  adaptation: string;
  objectivePreserved: boolean;
};

export type ChiefOfStaffCoordination = {
  id: string;
  workflow: string;
  responsibility: string;
  status: 'active' | 'monitoring' | 'complete';
  detail: string;
};

export type WorkflowTransparency = {
  id: string;
  workflow: string;
  workflowMap: string;
  departmentParticipation: string;
  executiveOwnership: string;
  currentStatus: string;
  organizationalHealthPct: number;
  risks: string[];
  confidence: number;
  nextMilestones: string[];
  organizationalLearning: string;
};

export type OrganizationalAdaptation = {
  id: string;
  workflow: string;
  adaptationType: string;
  description: string;
  governanceAllowed: boolean;
};

export type WorkflowMemory = {
  id: string;
  workflow: string;
  outcome: 'success' | 'partial' | 'failed';
  lessons: string[];
  bottlenecks: string[];
  collaborationNotes: string;
  customerOutcome: string;
};

export type WorkflowSimulation = {
  id: string;
  workflow: string;
  bestCase: string;
  worstCase: string;
  organizationalRisks: string[];
  customerImpact: string;
  resourceUtilization: string;
  timelineVariation: string;
  alternativeModel: string;
  executiveParticipation: string;
  confidence: number;
};

export type RecommendedOptimization = {
  id: string;
  workflow: string;
  optimization: string;
  rationale: string;
  confidence: number;
};

export type OrganizationalWorkflowOrchestrationStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: OrganizationalWorkflowOrchestrationWorkspaceId;
  companyName: string;
  dashboard: {
    summary: string;
    activeWorkflows: number;
    departmentCollaborations: number;
    completedInitiatives: number;
    organizationalConfidencePct: number;
    workflowHealthPct: number;
    learningOpportunities: number;
  };
  workflowPhilosophy: string[];
  workflowTypes: WorkflowType[];
  activeWorkflows: ActiveWorkflow[];
  crossFunctionalCoordination: CrossFunctionalCoordination[];
  workflowIntelligence: WorkflowIntelligence[];
  livingWorkflowAdaptations: LivingWorkflowAdaptation[];
  chiefOfStaffCoordination: ChiefOfStaffCoordination[];
  workflowTransparency: WorkflowTransparency[];
  organizationalAdaptations: OrganizationalAdaptation[];
  workflowMemory: WorkflowMemory[];
  workflowSimulations: WorkflowSimulation[];
  recommendedOptimizations: RecommendedOptimization[];
  recommendedNextSteps: string[];
  futureOpportunities: string[];
};
