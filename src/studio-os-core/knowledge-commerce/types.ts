import type {
  CUSTOMER_JOURNEY_STAGES,
  KNOWLEDGE_PRODUCT_TYPES,
  LICENSE_MODELS,
  VISIBILITY_LEVELS,
} from './constants';

export type KnowledgeProductType = (typeof KNOWLEDGE_PRODUCT_TYPES)[number];
export type VisibilityLevel = (typeof VISIBILITY_LEVELS)[number];
export type LicenseModel = (typeof LICENSE_MODELS)[number];
export type CustomerJourneyStage = (typeof CUSTOMER_JOURNEY_STAGES)[number];

export type KnowledgeProduct = {
  id: string;
  brainId: string;
  type: KnowledgeProductType;
  title: string;
  description: string;
  visibility: VisibilityLevel;
  licenseModel: LicenseModel;
  priceUsd: number;
  published: boolean;
  sourceEntryIds: string[];
  version: string;
  owner: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  audience: string;
  performanceScore: number;
  revenueUsd: number;
  usageCount: number;
  rating: number;
  reviewCount: number;
  dependencies: string[];
  updatedAt: string;
};

export type AiExpertExperience = {
  id: string;
  brainId: string;
  expertName: string;
  organizationName: string;
  poweredByBrain: string;
  trainedByNote: string;
  capabilities: string[];
  published: boolean;
  monthlyRevenueUsd: number;
};

export type BrainCommerceDashboard = {
  brainId: string;
  brainLabel: string;
  productsPublished: number;
  subscriptions: number;
  courseRevenueUsd: number;
  consultationRevenueUsd: number;
  membershipRevenueUsd: number;
  certificationRevenueUsd: number;
  digitalDownloadRevenueUsd: number;
  monthlyRecurringRevenueUsd: number;
  lifetimeRevenueUsd: number;
  knowledgeUtilizationPct: number;
  mostPopularTopics: string[];
};

export type CustomerJourneyStep = {
  stage: CustomerJourneyStage;
  label: string;
  description: string;
  nextStage?: CustomerJourneyStage;
};

export type RevenueIntelligenceInsight = {
  id: string;
  type: 'profitable' | 'converting' | 'requested' | 'searched' | 'gap' | 'suggested-product' | 'premium';
  title: string;
  detail: string;
  confidence: number;
};

export type KnowledgeCommerceOpportunity = {
  id: string;
  brainId: string;
  title: string;
  prompt: string;
  reason: string;
  suggestedProductType: KnowledgeProductType;
};

export type OrganizationKnowledgeCommerceProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  brainSyncedAt: string;
  products: KnowledgeProduct[];
  aiExpertExperiences: AiExpertExperience[];
  brainDashboards: BrainCommerceDashboard[];
  customerJourney: CustomerJourneyStep[];
  revenueInsights: RevenueIntelligenceInsight[];
  opportunities: KnowledgeCommerceOpportunity[];
  totalMrrUsd: number;
  totalLifetimeRevenueUsd: number;
};

export type KnowledgeCommerceStore = {
  version: string;
  profiles: OrganizationKnowledgeCommerceProfile[];
};

export type KnowledgeCommerceDockAdvice = {
  response: string;
  concierge: string;
  productId?: string;
  suggestPublish?: boolean;
};
