/** Organizational Maturity Model V1.0 — master progression system (Milestone 72). */

export type OrganizationalMaturityModelWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'portfolio';

export type OrganizationalStageId =
  | 'idea'
  | 'validation'
  | 'launch'
  | 'growth'
  | 'scale'
  | 'enterprise'
  | 'holding-company'
  | 'legacy';

export type OrganizationalStage = {
  id: OrganizationalStageId;
  label: string;
  description: string;
  current: boolean;
  completed: boolean;
};

export type MaturityDimension = {
  id: string;
  dimension: string;
  scorePct: number;
  readiness: 'emerging' | 'developing' | 'ready' | 'advanced';
};

export type AdaptiveExperience = {
  id: string;
  area: string;
  currentLevel: string;
  adaptsTo: string;
};

export type ExecutiveReadiness = {
  id: string;
  stage: string;
  executive: string;
  status: 'active' | 'recommended' | 'future' | 'not-ready';
  rationale: string;
};

export type AutonomyProgression = {
  id: string;
  level: string;
  description: string;
  earned: boolean;
  current: boolean;
  changeReason?: string;
};

export type CampusProgression = {
  id: string;
  campus: string;
  description: string;
  current: boolean;
  completed: boolean;
};

export type OrganizationalAssessment = {
  id: string;
  domain: string;
  scorePct: number;
  confidence: number;
  strength: string;
  opportunity: string;
};

export type GrowthRoadmap = {
  currentStage: string;
  nextStage: string;
  readinessPct: number;
  remainingRequirements: string[];
  recommendedPriorities: string[];
  dependencies: string[];
  futureExecutives: string[];
};

export type CompanyOnboarding = {
  id: string;
  signal: string;
  finding: string;
  generated: string;
};

export type OiMaturityIntegration = {
  id: string;
  evaluation: string;
  recommendation: string;
  action: 'slow-down' | 'accelerate' | 'maintain' | 'strengthen';
};

export type OrganizationalMaturityModelStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: OrganizationalMaturityModelWorkspaceId;
  companyName: string;
  dashboard: {
    summary: string;
    maturityScorePct: number;
    confidencePct: number;
    currentStageLabel: string;
    nextMilestone: string;
    readinessPct: number;
    autonomyLevel: number;
    campusStage: string;
  };
  maturityPhilosophy: string[];
  organizationalStages: OrganizationalStage[];
  maturityDimensions: MaturityDimension[];
  adaptiveExperience: AdaptiveExperience[];
  executiveReadiness: ExecutiveReadiness[];
  autonomyProgression: AutonomyProgression[];
  campusProgression: CampusProgression[];
  organizationalAssessments: OrganizationalAssessment[];
  growthRoadmap: GrowthRoadmap;
  companyOnboarding: CompanyOnboarding[];
  oiMaturityIntegration: OiMaturityIntegration[];
  recommendedNextSteps: string[];
  futureOpportunities: string[];
};
