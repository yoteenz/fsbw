/** Creator Marketplace V1.0 — intelligent creator business ecosystem (Milestone 49). */

export type CreatorMarketplaceWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'custom';

export type CreatorCareerStageId =
  | 'reader'
  | 'community-member'
  | 'affiliate'
  | 'creator'
  | 'verified-creator'
  | 'preferred-creator'
  | 'brand-ambassador'
  | 'partner'
  | 'advisor'
  | 'agency'
  | 'company-owner';

export type DealStatus = 'invitation' | 'negotiating' | 'contract' | 'active' | 'delivering' | 'complete' | 'renewal' | 'archived';

export type CreatorProfile = {
  id: string;
  workspaceId: CreatorMarketplaceWorkspaceId;
  displayName: string;
  careerStage: CreatorCareerStageId;
  creatorScore: number;
  brandAlignmentScore: number;
  trustScore: number;
  professionalismScore: number;
  communityScore: number;
  knowledgeScore: number;
  engagementQuality: string;
  audienceDemographics: string;
  contentCategories: string[];
  industries: string[];
  platforms: string[];
  pricing: string;
  availability: string;
  languages: string[];
  location: string;
  verified: boolean;
  relationshipEngineId?: string;
  futureGoals: string[];
};

export type BrandProfile = {
  id: string;
  workspaceId: CreatorMarketplaceWorkspaceId;
  name: string;
  industry: string;
  mission: string;
  companyDna: string;
  creativeDna: string;
  partnershipPhilosophy: string;
  budgetRange: string;
  brandValues: string[];
  preferredCreatorTypes: string[];
  collaborationStyles: string[];
  brandReputation: number;
  campaignCount: number;
};

export type IntelligentMatch = {
  id: string;
  creatorId: string;
  brandId: string;
  campaignId?: string;
  campaignLabel?: string;
  confidencePct: number;
  reasoning: string;
  expectedImpact: string;
  longTermPotential: string;
  factors: {
    companyDna: number;
    campaignObjective: number;
    creativeDna: number;
    audienceOverlap: number;
    brandValues: number;
    performance: number;
    professionalism: number;
    pricing: number;
  };
};

export type BrandDeal = {
  id: string;
  creatorId: string;
  brandId: string;
  campaignLabel: string;
  status: DealStatus;
  deliverables: string[];
  timeline: string;
  payment: string;
  performance?: string;
  renewalPotential: string;
};

export type CreatorOsDashboard = {
  creatorId: string;
  monthlyRevenue: string;
  activeCampaigns: number;
  pendingContracts: number;
  upcomingDeliverables: number;
  brandRelationships: number;
  careerProgressPct: number;
};

export type AgencyTeamMember = {
  id: string;
  creatorId: string;
  role: 'manager' | 'editor' | 'designer' | 'writer' | 'producer' | 'assistant' | 'accountant' | 'lawyer' | 'ai-executive';
  label: string;
  status: 'active' | 'planned';
};

export type MarketplaceIntelligenceSignal = {
  id: string;
  type: 'rising-creator' | 'undervalued' | 'future-ambassador' | 'future-educator' | 'future-founder' | 'future-agency' | 'future-enterprise';
  label: string;
  targetId: string;
  confidencePct: number;
  opportunity: string;
};

export type MarketplaceRelationship = {
  id: string;
  creatorId: string;
  brandId: string;
  trustPct: number;
  renewals: number;
  collaborationHealthPct: number;
  feedback: string;
  longTerm: boolean;
};

export type MarketplaceSimulation = {
  id: string;
  creatorId: string;
  brandId: string;
  label: string;
  campaignPerformance: string;
  brandFit: string;
  audienceResponse: string;
  relationshipImpact: string;
  expectedRoi: string;
  expectedRevenue: string;
  confidencePct: number;
  adjustments: string[];
};

export type CreatorEducationModule = {
  id: string;
  category: 'negotiation' | 'contracts' | 'pricing' | 'brand-building' | 'community' | 'finance' | 'taxes' | 'marketing' | 'entrepreneurship' | 'studio-os';
  title: string;
  description: string;
  progressPct: number;
};

export type TalentNetworkDiscovery = {
  id: string;
  type: 'presenter' | 'voice-actor' | 'educator' | 'designer' | 'writer' | 'creative-director' | 'consultant' | 'executive';
  name: string;
  fitScore: number;
  brandId: string;
};

export type CareerRecommendation = {
  id: string;
  creatorId: string;
  type: 'rate-increase' | 'service-expansion' | 'digital-product' | 'course' | 'consulting' | 'membership' | 'event' | 'agency-expansion';
  label: string;
  rationale: string;
  projectedLift: string;
};

export type PaymentIntelligence = {
  creatorId: string;
  monthlyRevenue: string;
  annualRevenue: string;
  brandConcentrationPct: number;
  incomeDiversityPct: number;
  forecast: string;
  financialHealthPct: number;
  recommendation: string;
};

export type CreatorMarketplaceStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: CreatorMarketplaceWorkspaceId;
  dashboard: {
    summary: string;
    verifiedCreators: number;
    activeDeals: number;
    avgMatchConfidence: number;
    risingCreators: number;
    partnershipRenewalPct: number;
    marketplaceHealthPct: number;
  };
  creatorPhilosophy: string[];
  careerStages: { stage: CreatorCareerStageId; label: string; description: string }[];
  creators: CreatorProfile[];
  brands: BrandProfile[];
  matches: IntelligentMatch[];
  deals: BrandDeal[];
  creatorOs: Record<string, CreatorOsDashboard>;
  agencyTeams: AgencyTeamMember[];
  intelligenceSignals: MarketplaceIntelligenceSignal[];
  relationships: MarketplaceRelationship[];
  simulations: MarketplaceSimulation[];
  education: CreatorEducationModule[];
  talentDiscoveries: TalentNetworkDiscovery[];
  careerRecommendations: CareerRecommendation[];
  paymentIntel: Record<string, PaymentIntelligence>;
  selectedCreatorId: string | null;
  selectedBrandId: string | null;
};
