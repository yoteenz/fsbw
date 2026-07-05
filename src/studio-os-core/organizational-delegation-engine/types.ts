/** Organizational Delegation Engine V1.0 — outcome-based delegation (Milestone 68). */

export type OrganizationalDelegationWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'portfolio';

export type DelegationType = {
  id: string;
  type: string;
  description: string;
};

export type OutcomeDelegation = {
  id: string;
  outcome: string;
  insteadOf: string;
  status: 'planning' | 'in-progress' | 'review' | 'complete' | 'paused';
  priority: 'low' | 'medium' | 'high';
  successMetrics: string[];
};

export type ExecutiveAssignment = {
  id: string;
  delegationId: string;
  owner: string;
  supporting: string[];
  architects: string[];
  workflows: string[];
  rationale: string;
};

export type DelegationPlan = {
  id: string;
  delegation: string;
  executiveStrategy: string;
  roadmap: string;
  dependencies: string[];
  timeline: string;
  risks: string[];
  successMetrics: string[];
  confidence: number;
  alternatives: string;
};

export type CollaborativeExecution = {
  id: string;
  delegation: string;
  executive: string;
  contribution: string;
  status: 'active' | 'complete' | 'pending';
};

export type DelegationGovernanceRule = {
  id: string;
  domain: string;
  rule: string;
  threshold?: string;
};

export type DelegationVisibility = {
  id: string;
  delegation: string;
  owner: string;
  progressPct: number;
  dependencies: string;
  pendingApprovals: number;
  milestones: string[];
  expectedCompletion: string;
  organizationalImpact: string;
};

export type DelegationLearning = {
  id: string;
  delegation: string;
  results: string;
  lessons: string[];
  collaboration: string;
  futureRecommendations: string;
};

export type ExecutiveAccountability = {
  id: string;
  executive: string;
  quality: number;
  timeliness: number;
  collaboration: number;
  customerImpact: number;
  knowledgeContribution: number;
};

export type RecommendedDelegation = {
  id: string;
  outcome: string;
  rationale: string;
  confidence: number;
};

export type OrganizationalDelegationStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: OrganizationalDelegationWorkspaceId;
  companyName: string;
  dashboard: {
    summary: string;
    activeDelegations: number;
    completedOutcomes: number;
    pendingFounderDecisions: number;
    organizationalConfidencePct: number;
    workflowHealthPct: number;
    executiveAccountabilityPct: number;
  };
  delegationPhilosophy: string[];
  delegationTypes: DelegationType[];
  outcomeDelegations: OutcomeDelegation[];
  executiveAssignments: ExecutiveAssignment[];
  delegationPlans: DelegationPlan[];
  collaborativeExecution: CollaborativeExecution[];
  delegationGovernance: DelegationGovernanceRule[];
  delegationVisibility: DelegationVisibility[];
  delegationLearning: DelegationLearning[];
  executiveAccountability: ExecutiveAccountability[];
  recommendedDelegations: RecommendedDelegation[];
  recommendedNextSteps: string[];
  futureOpportunities: string[];
};
