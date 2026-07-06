import type {
  ENFORCEMENT_ACTIONS,
  POLICY_CATEGORIES,
  POLICY_ENGINE_PHILOSOPHY,
  POLICY_LEVELS,
  POLICY_STATUSES,
} from './constants';

export type PolicyCategory = (typeof POLICY_CATEGORIES)[number];
export type PolicyLevel = (typeof POLICY_LEVELS)[number];
export type PolicyStatus = (typeof POLICY_STATUSES)[number];
export type EnforcementAction = (typeof ENFORCEMENT_ACTIONS)[number];
export type PolicyPhilosophyLine = (typeof POLICY_ENGINE_PHILOSOPHY)[number];

export type PolicyEntry = {
  policyId: string;
  name: string;
  description: string;
  category: PolicyCategory;
  level: PolicyLevel;
  owner: string;
  department?: string;
  scope: string[];
  rules: string[];
  parentPolicyId?: string;
  extendsPolicyId?: string;
  status: PolicyStatus;
  version: string;
  documentation: string[];
  lastUpdated: string;
  registered: boolean;
  enforcementPriority: number;
  appliesTo: string[];
};

export type PolicyHierarchyLayer = {
  level: PolicyLevel;
  label: string;
  policyCount: number;
  policyIds: string[];
  description: string;
};

export type PolicyEnforcementResult = {
  enforcementId: string;
  workflowId: string;
  workflowName: string;
  checkedAt: string;
  compliant: boolean;
  action: EnforcementAction;
  violatedPolicyIds: string[];
  explanation: string;
  recommendations: string[];
  pausedExecution: boolean;
};

export type PolicySimulationResult = {
  simulationId: string;
  policyId: string;
  policyName: string;
  simulatedAt: string;
  changeSummary: string;
  affectedDepartments: string[];
  affectedAutomations: string[];
  affectedEmployees: number;
  affectedCustomers: number;
  potentialRisks: string[];
  recommendedChanges: string[];
  riskLevel: 'low' | 'medium' | 'high';
};

export type PolicyGovernanceFinding = {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  policyId?: string;
  message: string;
  recommendation: string;
};

export type PolicyHealthMetric = {
  id: string;
  label: string;
  scorePct: number;
  detail: string;
  status: 'healthy' | 'warning' | 'critical';
};

export type PolicyImprovementRecommendation = {
  id: string;
  policyId?: string;
  title: string;
  detail: string;
  priority: 'high' | 'medium' | 'low';
};

export type OrganizationPolicyEngineProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  engineScore: number;
  totalPolicies: number;
  activeCount: number;
  draftCount: number;
  categoryCounts: Record<string, number>;
  levelCounts: Record<string, number>;
  policies: PolicyEntry[];
  hierarchyLayers: PolicyHierarchyLayer[];
  enforcementHistory: PolicyEnforcementResult[];
  simulationResults: PolicySimulationResult[];
  recommendations: PolicyImprovementRecommendation[];
  governanceFindings: PolicyGovernanceFinding[];
  healthMetrics: PolicyHealthMetric[];
  complianceRatePct: number;
  dockPolicyLine: string;
  organizationalLaw: true;
  lastSyncedAt: string;
};

export type PolicyEngineStore = {
  version: string;
  profiles: OrganizationPolicyEngineProfile[];
};

export type PolicyEngineDockAdvice = {
  response: string;
  concierge: string;
  engineScore?: number;
};

export type PolicySearchHit = {
  entry: PolicyEntry;
  score: number;
  matchReason: string;
};

export type WorkflowComplianceCheck = {
  workflowId: string;
  workflowName: string;
  compliant: boolean;
  action: EnforcementAction;
  violatedPolicies: PolicyEntry[];
  explanation: string;
  recommendations: string[];
};
