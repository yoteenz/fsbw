/** Organizational Self-Improvement V1.0 — continuous organizational evolution (Milestone 70). */

export type OrganizationalSelfImprovementWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'portfolio';

export type ReflectionDomain = {
  id: string;
  domain: string;
  status: 'strong' | 'developing' | 'attention' | 'critical';
  insight: string;
};

export type ContinuousReflection = {
  id: string;
  evaluation: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  risks: string[];
  blindSpots: string[];
  recommendation: string;
};

export type CrossFunctionalImprovement = {
  id: string;
  executive: string;
  outsideDiscipline: string;
  recommendation: string;
  rationale: string;
};

export type ImprovementOpportunity = {
  id: string;
  category: string;
  recommendation: string;
  whyNow: string;
  whyItMatters: string;
  expectedImpact: string;
  confidence: number;
  status: 'recommended' | 'active' | 'complete' | 'deferred';
};

export type OrganizationalExperiment = {
  id: string;
  name: string;
  type: string;
  executive: string;
  status: 'proposed' | 'running' | 'complete' | 'failed';
  hypothesis: string;
  results?: string;
  lessons: string[];
  futureRecommendations: string;
};

export type ImprovementGovernanceRule = {
  id: string;
  domain: string;
  rule: string;
  threshold?: string;
};

export type ContinuousLearning = {
  id: string;
  initiative: string;
  succeeded: string[];
  failed: string[];
  surprised: string[];
  becomeStandard: string[];
  neverRepeat: string[];
  collaborationNotes: string;
  relationshipEvolution: string;
  knowledgeExpansion: string;
};

export type MaturityDimension = {
  id: string;
  dimension: string;
  currentLevel: number;
  trend: 'rising' | 'stable' | 'declining';
  yearsTrajectory: string;
};

export type ChiefOfStaffImprovementCoordination = {
  id: string;
  responsibility: string;
  priority: string;
  status: 'active' | 'monitoring' | 'complete';
  detail: string;
};

export type OrganizationalSelfImprovementStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: OrganizationalSelfImprovementWorkspaceId;
  companyName: string;
  dashboard: {
    summary: string;
    organizationalHealthPct: number;
    recommendedImprovements: number;
    activeInitiatives: number;
    learningVelocityPct: number;
    completedImprovements: number;
    maturityScorePct: number;
  };
  improvementPhilosophy: string[];
  reflectionDomains: ReflectionDomain[];
  continuousReflection: ContinuousReflection[];
  crossFunctionalImprovements: CrossFunctionalImprovement[];
  improvementOpportunities: ImprovementOpportunity[];
  organizationalExperiments: OrganizationalExperiment[];
  improvementGovernance: ImprovementGovernanceRule[];
  continuousLearning: ContinuousLearning[];
  maturityDimensions: MaturityDimension[];
  chiefOfStaffCoordination: ChiefOfStaffImprovementCoordination[];
  recommendedNextSteps: string[];
  futureOpportunities: string[];
};
