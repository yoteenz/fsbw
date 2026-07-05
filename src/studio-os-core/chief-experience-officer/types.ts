/** Chief Experience Officer V2.0 — lifelong guardian of customer experience (Milestone 62). */

export type ChiefExperienceOfficerWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'portfolio';

export type ExperienceGovernanceReview = {
  id: string;
  initiative: string;
  category: string;
  status: 'pending' | 'approved' | 'revision' | 'blocked';
  experienceScore: number;
};

export type ExperienceAlignmentCheck = {
  id: string;
  initiative: string;
  experienceScore: number;
  trustScore: number;
  frictionAnalysis: string;
  emotionalAlignment: string;
  relationshipImpact: string;
  recommendation: string;
  confidence: number;
};

export type JourneyIntelligence = {
  id: string;
  stage: string;
  status: 'strong' | 'watch' | 'friction';
  insight: string;
  opportunity?: string;
};

export type ExperienceIntelligenceMetric = {
  id: string;
  dimension: string;
  score: number;
  trend: 'up' | 'stable' | 'down';
};

export type ExperienceEvolutionRec = {
  id: string;
  category: string;
  recommendation: string;
};

export type ExperienceCouncilMember = {
  id: string;
  executive: string;
  collaboration: string;
  status: 'active' | 'scheduled';
};

export type ExperienceStudioElement = {
  id: string;
  element: string;
  description: string;
  location: string;
};

export type ExperienceMemory = {
  id: string;
  category: string;
  memory: string;
  date: string;
};

export type ExperienceProtectionAlert = {
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
  recommendedAction: string;
  hasTradeoffs: boolean;
};

export type ChiefExperienceOfficerStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: ChiefExperienceOfficerWorkspaceId;
  companyName: string;
  dashboard: {
    summary: string;
    experienceHealthPct: number;
    trustScorePct: number;
    pendingReviews: number;
    frictionAlerts: number;
    councilCollaborations: number;
    relationshipHealthTrend: 'up' | 'stable' | 'down';
  };
  leadershipPhilosophy: string[];
  primaryResponsibilities: string[];
  executiveCompass: string;
  experienceGovernance: ExperienceGovernanceReview[];
  experienceAlignment: ExperienceAlignmentCheck[];
  journeyIntelligence: JourneyIntelligence[];
  experienceIntelligence: ExperienceIntelligenceMetric[];
  experienceEvolution: ExperienceEvolutionRec[];
  experienceCouncil: ExperienceCouncilMember[];
  experienceStudio: ExperienceStudioElement[];
  experienceMemory: ExperienceMemory[];
  experienceProtection: ExperienceProtectionAlert[];
  dailyBriefing: DailyBriefingItem[];
  recommendations: ExecutiveRecommendation[];
  recommendedNextSteps: string[];
  futureOpportunities: string[];
};
