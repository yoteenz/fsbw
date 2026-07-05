/** Chief Brand Officer V2.0 — lifelong guardian of identity (Milestone 61). */

export type ChiefBrandOfficerWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'portfolio';

export type BrandGovernanceReview = {
  id: string;
  initiative: string;
  category: string;
  status: 'pending' | 'approved' | 'revision' | 'blocked';
  alignmentScore: number;
};

export type BrandAlignmentCheck = {
  id: string;
  initiative: string;
  alignmentScore: number;
  strengths: string;
  risks?: string;
  opportunities?: string;
  recommendation: string;
  confidence: number;
  organizationalImpact: string;
};

export type BrandIntelligenceSignal = {
  id: string;
  dimension: string;
  status: 'strong' | 'watch' | 'risk';
  insight: string;
  recommendation?: string;
};

export type BrandEvolutionRec = {
  id: string;
  category: string;
  recommendation: string;
  intent: 'intentional' | 'proactive';
};

export type BrandCouncilMember = {
  id: string;
  executive: string;
  collaboration: string;
  status: 'active' | 'scheduled';
};

export type CreativeReviewStudio = {
  id: string;
  element: string;
  description: string;
  location: string;
};

export type BrandMemory = {
  id: string;
  category: string;
  memory: string;
  date: string;
};

export type BrandProtectionAlert = {
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
  alignmentScore: number;
  recommendedAction: string;
  hasTradeoffs: boolean;
};

export type ChiefBrandOfficerStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: ChiefBrandOfficerWorkspaceId;
  companyName: string;
  dashboard: {
    summary: string;
    brandHealthPct: number;
    consistencyScorePct: number;
    pendingReviews: number;
    protectionAlerts: number;
    councilCollaborations: number;
    brandEquityTrend: 'up' | 'stable' | 'down';
  };
  leadershipPhilosophy: string[];
  primaryResponsibilities: string[];
  executiveCompass: string;
  brandGovernance: BrandGovernanceReview[];
  brandAlignment: BrandAlignmentCheck[];
  brandIntelligence: BrandIntelligenceSignal[];
  brandEvolution: BrandEvolutionRec[];
  brandCouncil: BrandCouncilMember[];
  creativeReviewStudio: CreativeReviewStudio[];
  brandMemory: BrandMemory[];
  brandProtection: BrandProtectionAlert[];
  dailyBriefing: DailyBriefingItem[];
  recommendations: ExecutiveRecommendation[];
  recommendedNextSteps: string[];
  futureOpportunities: string[];
};
