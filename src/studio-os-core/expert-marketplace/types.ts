/**
 * Milestone 92 — Expert Marketplace™ V1.0
 * Public ecosystem where organizations publish Profession Brain expertise.
 */

export type ExpertTrustLevel = 'educational' | 'preparation' | 'consultation' | 'licensed';

export type ExpertConsumerCapability =
  | 'learn'
  | 'ask'
  | 'workflow'
  | 'templates'
  | 'consultation'
  | 'estimate'
  | 'schedule'
  | 'digital-product'
  | 'membership'
  | 'academy-course'
  | 'upgrade';

export type ExpertProfile = {
  id: string;
  expertName: string;
  organizationName: string;
  organizationId: string;
  creator: string;
  yearsExperience: number;
  industries: string[];
  specialties: string[];
  services: string[];
  knowledgeAreas: string[];
  certifications: string[];
  languages: string[];
  availability: string;
  version: string;
  lastUpdated: string;
  rating: number;
  reviewCount: number;
  brainId: string;
  published: boolean;
  approvedAt?: string;
  trustLevel: ExpertTrustLevel;
  trustDisclaimer: string;
  capabilities: ExpertConsumerCapability[];
  originNote: string;
};

export type AcademyMarketplaceOffering = {
  id: string;
  expertProfileId: string;
  type: 'course' | 'lesson' | 'learning-path' | 'article' | 'playbook' | 'checklist' | 'reference' | 'certification';
  title: string;
  summary: string;
};

export type RevenueOffering = {
  id: string;
  expertProfileId: string;
  channel: string;
  label: string;
  description: string;
};

export type MultiAudienceExperience = {
  audience: 'organization' | 'employee' | 'manager' | 'contractor' | 'customer' | 'student' | 'future-owner' | 'future-family';
  experienceLabel: string;
};

export type ExpertMarketplaceListing = {
  profile: ExpertProfile;
  academyOfferings: AcademyMarketplaceOffering[];
  revenueOfferings: RevenueOffering[];
  audiences: MultiAudienceExperience[];
};

export type OrganizationExpertMarketplaceProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  listings: ExpertMarketplaceListing[];
  publishedCount: number;
  pendingApprovalCount: number;
};

export type ExpertMarketplaceStore = {
  version: string;
  profiles: OrganizationExpertMarketplaceProfile[];
  /** Global discovery catalog (demo — all published experts). */
  publicCatalog: ExpertProfile[];
};

export type ExpertDiscoveryQuery = {
  industry?: string;
  profession?: string;
  specialty?: string;
  topic?: string;
  organization?: string;
};

export type ExpertMarketplaceDockAdvice = {
  response: string;
  concierge: string;
  expertId?: string;
};
