/** POST-BUILD REFINEMENT 05 — canonical service catalog types (single source of truth). */

export type ServiceDiscoveryCategory =
  | 'start-my-business'
  | 'get-road-ready'
  | 'permits-taxes-compliance'
  | 'safety-drivers'
  | 'operate-my-business'
  | 'move-freight'
  | 'manage-my-money';

export type ServiceFulfillmentType = 'AIO_DIRECT' | 'AIO_MANAGED' | 'PARTNER_PROVIDED' | 'HYBRID';

export type ServiceActivationStatus =
  | 'PREPARING'
  | 'LIMITED_PILOT'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMING_SOON'
  | 'DISABLED';

export type JurisdictionAvailability =
  | 'AVAILABLE'
  | 'PARTNER_PROVIDED'
  | 'LIMITED'
  | 'NOT_CURRENTLY_AVAILABLE'
  | 'CONTACT_US';

export type PaymentCollectionModel = 'AIO_COLLECTS' | 'PARTNER_COLLECTS' | 'REFERRAL_ONLY' | 'QUOTE_REQUIRED';

export type PricingModel = 'starting_at' | 'quote_required' | 'contact_us' | 'subscription' | 'government_fee_separate';

export type RoadReadyApplicabilityResult =
  | 'REQUIRED'
  | 'LIKELY_REQUIRED'
  | 'RECOMMENDED'
  | 'OPTIONAL'
  | 'NOT_APPLICABLE'
  | 'NEEDS_REVIEW';

export type PartnerProviderType =
  | 'insurance'
  | 'factoring'
  | 'payroll'
  | 'tax_preparation'
  | 'eld'
  | 'drug_alcohol_consortium'
  | 'testing_compliance'
  | 'title_tag'
  | 'specialty_permit'
  | 'other';

export type PartnerHandoffStatus =
  | 'PENDING_HANDOFF'
  | 'HANDED_OFF'
  | 'PARTNER_ACCEPTED'
  | 'PARTNER_NEEDS_INFO'
  | 'IN_PROGRESS'
  | 'RESULT_RECEIVED'
  | 'COMPLETED'
  | 'DECLINED'
  | 'ESCALATED';

export interface ServiceDiscoveryCategoryMeta {
  id: ServiceDiscoveryCategory;
  title: string;
  headline: string;
  description: string;
  order: number;
  icon: string;
}

export interface CatalogServiceEntry {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  /** Primary discovery category */
  category: ServiceDiscoveryCategory;
  /** Additional discovery contexts — same canonical record */
  discoveryCategories?: ServiceDiscoveryCategory[];
  /** Legacy division for backward compatibility */
  legacyDivision?: string;
  fulfillmentType: ServiceFulfillmentType | null;
  activationStatus: ServiceActivationStatus;
  jurisdictionDependent: boolean;
  defaultJurisdictionAvailability: JurisdictionAvailability;
  pricingModel: PricingModel;
  quoteRequired: boolean;
  documentsRequired: boolean;
  workflowTemplateSlug?: string;
  providerRequirements?: PartnerProviderType[];
  renewalInterval?: 'annual' | 'biennial' | 'quarterly' | 'monthly' | 'as_needed' | null;
  roadReadyApplicable: boolean;
  customerPortalVisible: boolean;
  officeVisible: boolean;
  publicDisclosure?: string;
  paymentModel: PaymentCollectionModel;
  icon: string;
  relatedSlugs?: string[];
  cta: string;
}

export interface ServicePartnerRecord {
  id: string;
  name: string;
  providerTypes: PartnerProviderType[];
  status: 'active' | 'pending' | 'inactive';
  jurisdictions: string[];
  referralOrManaged: 'referral' | 'managed';
  customerDisclosure?: string;
  integrationType?: string;
  externalPortalUrl?: string;
}

export type ServiceNeedIntent =
  | 'starting-company'
  | 'getting-authority'
  | 'getting-road-ready'
  | 'staying-compliant'
  | 'managing-drivers'
  | 'preparing-audit'
  | 'titles-tags'
  | 'dispatch'
  | 'moving-freight'
  | 'insurance'
  | 'bookkeeping'
  | 'payroll'
  | 'taxes'
  | 'getting-paid-faster'
  | 'not-sure';

export interface ServiceNeedOption {
  id: ServiceNeedIntent;
  label: string;
  description: string;
  recommendedSlugs: string[];
}

export interface RoadReadyApplicabilityInput {
  interstate?: boolean;
  intrastate?: boolean;
  vehicleCount?: number;
  hasCdlDrivers?: boolean;
  vehicleWeightOver26000?: boolean;
  newEntrant?: boolean;
  authorityType?: string;
  jurisdiction?: string;
}

export interface RoadReadyApplicabilityOutput {
  requirementKey: string;
  result: RoadReadyApplicabilityResult;
  reason: string;
  serviceSlug?: string;
}
