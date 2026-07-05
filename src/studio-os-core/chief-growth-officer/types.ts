/** Chief Growth Officer V1.0 — lifelong guardian of sustainable growth (Milestone 64). */

export type ChiefGrowthOfficerWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'portfolio';

export type GrowthGovernanceReview = {
  id: string;
  initiative: string;
  category: string;
  status: 'pending' | 'approved' | 'revision' | 'blocked';
  growthScore: number;
};

export type GrowthAlignmentCheck = {
  id: string;
  initiative: string;
  growthHealth: number;
  brandImpact: string;
  relationshipImpact: string;
  customerImpact: string;
  financialOpportunity: string;
  risk: string;
  recommendation: string;
  confidence: number;
};

export type GrowthIntelligenceMetric = {
  id: string;
  dimension: string;
  score: number;
  trend: 'up' | 'stable' | 'down';
};

export type GrowthEvolutionRec = {
  id: string;
  category: string;
  recommendation: string;
};

export type GrowthCouncilMember = {
  id: string;
  executive: string;
  collaboration: string;
  status: 'active' | 'scheduled';
};

export type GrowthLaboratoryElement = {
  id: string;
  element: string;
  description: string;
  location: string;
};

export type GrowthMemory = {
  id: string;
  category: string;
  memory: string;
  date: string;
};

export type GrowthProtectionAlert = {
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
  brandImpact: string;
  financialImplications: string;
  recommendedAction: string;
  hasTradeoffs: boolean;
};

export type ChiefGrowthOfficerStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: ChiefGrowthOfficerWorkspaceId;
  companyName: string;
  dashboard: {
    summary: string;
    growthHealthPct: number;
    relationshipHealthPct: number;
    pendingReviews: number;
    protectionAlerts: number;
    councilCollaborations: number;
    growthTrajectory: 'up' | 'stable' | 'down';
  };
  leadershipPhilosophy: string[];
  primaryResponsibilities: string[];
  executiveCompass: string;
  growthGovernance: GrowthGovernanceReview[];
  growthAlignment: GrowthAlignmentCheck[];
  growthIntelligence: GrowthIntelligenceMetric[];
  growthEvolution: GrowthEvolutionRec[];
  growthCouncil: GrowthCouncilMember[];
  growthLaboratory: GrowthLaboratoryElement[];
  growthMemory: GrowthMemory[];
  growthProtection: GrowthProtectionAlert[];
  dailyBriefing: DailyBriefingItem[];
  recommendations: ExecutiveRecommendation[];
  recommendedNextSteps: string[];
  futureOpportunities: string[];
};
