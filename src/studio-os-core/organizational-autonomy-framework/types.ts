/** Organizational Autonomy Framework V1.0 — constitutional autonomy governance (Milestone 67). */

export type OrganizationalAutonomyWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'portfolio';

export type AutonomyLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type AutonomyLevelDefinition = {
  level: AutonomyLevel;
  name: string;
  description: string;
  requirements: string;
};

export type AutonomyGovernanceCapability = {
  id: string;
  capability: string;
  currentLevel: AutonomyLevel;
  governance: string;
};

export type FounderPermission = {
  id: string;
  domain: string;
  mode: 'always-ask' | 'ask-above-threshold' | 'automatic' | 'never';
  threshold?: string;
  detail: string;
};

export type TrustEngineMetric = {
  id: string;
  dimension: string;
  score: number;
  trend: 'up' | 'stable' | 'down';
  recommendation: string;
};

export type ExecutiveCoordinationScenario = {
  id: string;
  trigger: string;
  executives: string[];
  actions: string;
  governanceStatus: 'permitted' | 'pending-approval' | 'blocked';
};

export type AutonomousWorkflow = {
  id: string;
  workflow: string;
  category: string;
  autonomyLevel: AutonomyLevel;
  status: 'active' | 'pending' | 'paused';
  risk: 'low' | 'medium' | 'high';
};

export type AutonomousActionRecord = {
  id: string;
  action: string;
  reasoning: string;
  executives: string;
  expectedOutcome: string;
  confidence: number;
  rollbackPlan: string;
  executedAt: string;
};

export type LearningLoopEvaluation = {
  id: string;
  action: string;
  outcome: string;
  accuracy: string;
  organizationalImpact: string;
  customerImpact: string;
  improvement: string;
};

export type AutonomyUpgradeRecommendation = {
  id: string;
  domain: string;
  currentLevel: AutonomyLevel;
  recommendedLevel: AutonomyLevel;
  rationale: string;
  confidence: number;
};

export type OrganizationalAutonomyStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: OrganizationalAutonomyWorkspaceId;
  companyName: string;
  dashboard: {
    summary: string;
    organizationalAutonomyLevel: AutonomyLevel;
    trustScorePct: number;
    activeWorkflows: number;
    recentAutonomousDecisions: number;
    pendingApprovals: number;
    executiveConfidencePct: number;
    workflowHealthPct: number;
  };
  autonomyPhilosophy: string[];
  autonomyLevels: AutonomyLevelDefinition[];
  autonomyGovernance: AutonomyGovernanceCapability[];
  founderPermissions: FounderPermission[];
  trustEngine: TrustEngineMetric[];
  executiveCoordination: ExecutiveCoordinationScenario[];
  autonomousWorkflows: AutonomousWorkflow[];
  autonomousActions: AutonomousActionRecord[];
  learningLoop: LearningLoopEvaluation[];
  autonomyUpgrades: AutonomyUpgradeRecommendation[];
  founderReservedDecisions: string[];
  recommendedNextSteps: string[];
  futureOpportunities: string[];
};
