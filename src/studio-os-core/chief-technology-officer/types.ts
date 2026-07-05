/** Chief Technology Officer V1.0 — lifelong guardian of engineering & infrastructure (Milestone 63.5). */

export type ChiefTechnologyOfficerWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'portfolio';

export type TechnologyGovernanceReview = {
  id: string;
  initiative: string;
  category: string;
  status: 'pending' | 'approved' | 'revision' | 'blocked';
  architectureScore: number;
};

export type EngineeringAlignmentCheck = {
  id: string;
  initiative: string;
  engineeringHealth: number;
  technicalRisk: string;
  systemResilience: string;
  futureReadiness: string;
  recommendation: string;
  confidence: number;
  organizationalImpact: string;
};

export type EngineeringIntelligenceMetric = {
  id: string;
  dimension: string;
  score: number;
  trend: 'up' | 'stable' | 'down';
};

export type EngineeringEvolutionRec = {
  id: string;
  category: string;
  recommendation: string;
};

export type PlatformArchitectureEntry = {
  id: string;
  domain: string;
  focus: string;
  status: 'governed' | 'review' | 'planned';
  longevity: string;
};

export type EngineeringCouncilMember = {
  id: string;
  executive: string;
  collaboration: string;
  status: 'active' | 'scheduled';
};

export type TechnologyOpsCenterElement = {
  id: string;
  element: string;
  description: string;
  location: string;
};

export type EngineeringMemory = {
  id: string;
  category: string;
  memory: string;
  date: string;
};

export type TechnologyProtectionAlert = {
  id: string;
  alertType: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  correction: string;
};

export type DailyBriefingItem = {
  id: string;
  category: string;
  summary: string;
  priority: 'low' | 'medium' | 'high';
};

export type ExecutiveRecommendation = {
  id: string;
  summary: string;
  confidence: number;
  organizationalImpact: string;
  implementationComplexity: string;
  risk: string;
  recommendedAction: string;
  hasTradeoffs: boolean;
};

export type ChiefTechnologyOfficerStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: ChiefTechnologyOfficerWorkspaceId;
  companyName: string;
  dashboard: {
    summary: string;
    engineeringHealthPct: number;
    platformStabilityPct: number;
    pendingReviews: number;
    protectionAlerts: number;
    councilCollaborations: number;
    reliabilityTrend: 'up' | 'stable' | 'down';
  };
  leadershipPhilosophy: string[];
  primaryResponsibilities: string[];
  executiveCompass: string;
  technologyGovernance: TechnologyGovernanceReview[];
  engineeringAlignment: EngineeringAlignmentCheck[];
  engineeringIntelligence: EngineeringIntelligenceMetric[];
  engineeringEvolution: EngineeringEvolutionRec[];
  platformArchitecture: PlatformArchitectureEntry[];
  engineeringCouncil: EngineeringCouncilMember[];
  technologyOpsCenter: TechnologyOpsCenterElement[];
  engineeringMemory: EngineeringMemory[];
  technologyProtection: TechnologyProtectionAlert[];
  dailyBriefing: DailyBriefingItem[];
  recommendations: ExecutiveRecommendation[];
  recommendedNextSteps: string[];
  futureOpportunities: string[];
};
