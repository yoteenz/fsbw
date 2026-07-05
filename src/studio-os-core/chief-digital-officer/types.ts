/** Chief Digital Officer V1.0 — lifelong guardian of the digital ecosystem (Milestone 63). */

export type ChiefDigitalOfficerWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'portfolio';

export type DigitalGovernanceReview = {
  id: string;
  initiative: string;
  category: string;
  status: 'pending' | 'approved' | 'revision' | 'blocked';
  architectureScore: number;
};

export type DigitalAlignmentCheck = {
  id: string;
  initiative: string;
  digitalHealthScore: number;
  architectureScore: number;
  technicalRisks: string;
  futureScalability: string;
  recommendation: string;
  confidence: number;
  customerImpact: string;
};

export type DigitalIntelligenceMetric = {
  id: string;
  dimension: string;
  score: number;
  trend: 'up' | 'stable' | 'down';
};

export type DigitalEvolutionRec = {
  id: string;
  category: string;
  recommendation: string;
};

export type SolutionArchitectureReview = {
  id: string;
  system: string;
  focus: string;
  status: 'reviewed' | 'pending' | 'in-progress';
  scalability: string;
};

export type AiEcosystemRec = {
  id: string;
  capability: string;
  businessObjective: string;
  status: 'recommended' | 'evaluating' | 'future';
};

export type TechnologyCouncilMember = {
  id: string;
  executive: string;
  collaboration: string;
  status: 'active' | 'scheduled';
};

export type DigitalStudioElement = {
  id: string;
  element: string;
  description: string;
  location: string;
};

export type DigitalMemory = {
  id: string;
  category: string;
  memory: string;
  date: string;
};

export type DigitalProtectionAlert = {
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
  customerImpact: string;
  implementationComplexity: string;
  recommendedAction: string;
  hasTradeoffs: boolean;
};

export type ChiefDigitalOfficerStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: ChiefDigitalOfficerWorkspaceId;
  companyName: string;
  dashboard: {
    summary: string;
    digitalHealthPct: number;
    architectureScorePct: number;
    pendingReviews: number;
    protectionAlerts: number;
    councilCollaborations: number;
    platformHealthTrend: 'up' | 'stable' | 'down';
  };
  leadershipPhilosophy: string[];
  primaryResponsibilities: string[];
  executiveCompass: string;
  digitalGovernance: DigitalGovernanceReview[];
  digitalAlignment: DigitalAlignmentCheck[];
  digitalIntelligence: DigitalIntelligenceMetric[];
  digitalEvolution: DigitalEvolutionRec[];
  solutionArchitecture: SolutionArchitectureReview[];
  aiEcosystem: AiEcosystemRec[];
  technologyCouncil: TechnologyCouncilMember[];
  digitalStudio: DigitalStudioElement[];
  digitalMemory: DigitalMemory[];
  digitalProtection: DigitalProtectionAlert[];
  dailyBriefing: DailyBriefingItem[];
  recommendations: ExecutiveRecommendation[];
  recommendedNextSteps: string[];
  futureOpportunities: string[];
};
