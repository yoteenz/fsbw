/**
 * Growth Network v1.0 — platform types.
 * Intelligent business growth ecosystem (not a traditional talent agency).
 */

export type GrowthCompanyType =
  | 'creator'
  | 'ecommerce-brand'
  | 'media-company'
  | 'startup'
  | 'agency'
  | 'educator'
  | 'local-business'
  | 'consultant'
  | 'nonprofit'
  | 'enterprise';

export type GrowthRoadmapStage = 'launch' | 'traction' | 'growth' | 'scale' | 'enterprise' | 'legacy';

export type DealPipelineStage =
  | 'lead'
  | 'qualified'
  | 'meeting'
  | 'proposal'
  | 'negotiation'
  | 'contract'
  | 'campaign'
  | 'deliverables'
  | 'invoice'
  | 'payment'
  | 'renewal'
  | 'completed';

export type OpportunityType =
  | 'brand-partnership'
  | 'affiliate-program'
  | 'sponsorship'
  | 'podcast-appearance'
  | 'speaking-engagement'
  | 'licensing'
  | 'investor'
  | 'collaboration'
  | 'event'
  | 'ugc-opportunity'
  | 'product-launch'
  | 'retail-opportunity'
  | 'wholesale-opportunity'
  | 'community-partnership'
  | 'grant-opportunity';

export type RevenueChannelType =
  | 'brand-deals'
  | 'affiliate-income'
  | 'platform-payouts'
  | 'digital-products'
  | 'physical-products'
  | 'courses'
  | 'memberships'
  | 'licensing'
  | 'consulting'
  | 'subscriptions'
  | 'other';

export type ServiceMarketplaceCategory =
  | 'video-editors'
  | 'graphic-designers'
  | 'photographers'
  | 'developers'
  | 'virtual-assistants'
  | 'lawyers'
  | 'accountants'
  | 'copywriters'
  | 'brand-strategists'
  | 'ugc-creators'
  | 'manufacturers'
  | 'fulfillment-partners'
  | 'ad-specialists';

export type GrowthPrivacySettings = {
  profileVisible: boolean;
  discoverableInRegistry: boolean;
  publicProfileEnabled: boolean;
  allowPartnershipRequests: boolean;
  allowBrandInvitations: boolean;
  contactMethodsVisible: boolean;
};

export type GrowthProfile = {
  workspaceId: string;
  companyOverview: string;
  founderProfile: string;
  niche: string;
  audience: string;
  products: string[];
  services: string[];
  socialPlatforms: string[];
  engagementSummary: string;
  monthlyGrowth: string;
  partnerships: string[];
  affiliatePrograms: string[];
  revenueChannels: RevenueChannelType[];
  currentGoals: string[];
  growthScore: number;
  roadmapStage: GrowthRoadmapStage;
  companyType: GrowthCompanyType;
  updatedAt: string;
  privacy: GrowthPrivacySettings;
  memoryBibleGrowth: {
    businessGoals: string[];
    growthStrategy: string;
    preferredPartnershipTypes: OpportunityType[];
    pricingPhilosophy: string;
    brandRestrictions: string[];
    longTermObjectives: string[];
    growthHistory: string[];
  };
};

export type CompanyRegistryEntry = {
  id: string;
  company: string;
  workspaceId?: string;
  companyType: GrowthCompanyType;
  industry: string;
  location: string;
  audienceDemographics: string;
  platforms: string[];
  engagement: string;
  growthMetrics: string;
  contactPreferences: string;
  brandGuidelines: string;
  companyDna: string;
  verified: boolean;
  discoverable: boolean;
  growthRate: string;
  availability: string;
};

export type GrowthOpportunity = {
  id: string;
  type: OpportunityType;
  title: string;
  brand: string;
  description: string;
  matchScore: number;
  matchReason: string;
  estimatedValue: string;
  deadline?: string;
  stage: DealPipelineStage;
  workspaceId: string;
};

export type PartnershipRecord = {
  id: string;
  workspaceId: string;
  brand: string;
  contact: string;
  campaign: string;
  deliverables: string[];
  timeline: string;
  budget: string;
  paymentTerms: string;
  contractId?: string;
  notes: string;
  renewalReminder?: string;
  communicationHistory: string[];
  status: DealPipelineStage;
  performanceMetrics: string;
};

export type ContractInsight = {
  id: string;
  workspaceId: string;
  fileName: string;
  uploadedAt: string;
  paymentTerms: string[];
  usageRights: string[];
  renewalClauses: string[];
  terminationClauses: string[];
  exclusivity: string;
  contentOwnership: string;
  deliverables: string[];
  deadlines: string[];
  potentialRisks: string[];
  flaggedLanguage: string[];
  educationalDisclaimer: string;
};

export type RevenueStreamRecord = {
  id: string;
  channel: RevenueChannelType;
  label: string;
  monthlyAmount: number;
  annualAmount: number;
  growthRate: number;
  workspaceId: string;
};

export type GrowthRecommendation = {
  id: string;
  title: string;
  rationale: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  workspaceId: string;
};

export type ServiceProviderListing = {
  id: string;
  category: ServiceMarketplaceCategory;
  name: string;
  specialty: string;
  rating: string;
  verified: boolean;
};

export type GrowthAnalyticsSnapshot = {
  engagement: string;
  audienceGrowth: string;
  postingConsistency: string;
  conversion: string;
  campaignPerformance: string;
  platformHealth: string;
  partnershipPerformance: string;
  customerLifetimeValue: string;
  improvementAreas: string[];
};

export type GrowthNetworkStore = {
  profiles: Record<string, GrowthProfile>;
  registry: CompanyRegistryEntry[];
  opportunities: GrowthOpportunity[];
  partnerships: PartnershipRecord[];
  contracts: ContractInsight[];
  revenueStreams: RevenueStreamRecord[];
  recommendations: GrowthRecommendation[];
  serviceProviders: ServiceProviderListing[];
  version: string;
};
