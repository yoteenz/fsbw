/**
 * Founder Mod IP, licensing, royalties — governed contracts.
 */

export const FOUNDER_MODS_VERSION = 'founder-mods.v1' as const;

export type ContentClass =
  | 'CANONICAL_STUDIO_WORLD_DEPARTMENT'
  | 'SHARED_HQ_DEPARTMENT_TEMPLATE'
  | 'INDUSTRY_UNIQUE_DEFAULT_TEMPLATE'
  | 'FOUNDER_CUSTOMIZED_DEPARTMENT'
  | 'FOUNDER_CREATED_MODDED_SCENE'
  | 'MARKETPLACE_LICENSED_MOD';

/** @deprecated Use INDUSTRY_UNIQUE_DEFAULT_TEMPLATE */
export type LegacyDepartmentClass =
  | 'INDUSTRY_UNIQUE_DEPARTMENT_TEMPLATE';

export type FounderModPublicationStatus =
  | 'PRIVATE_ONLY'
  | 'REVISION_REQUIRED'
  | 'CERTIFIED'
  | 'CERTIFIED_WITH_RESTRICTIONS'
  | 'REJECTED';

export type FounderCreatedModRecord = {
  modVersion: typeof FOUNDER_MODS_VERSION;
  customSceneId: string;
  displayName: string;
  protectedName: string;
  contentClass: 'FOUNDER_CREATED_MODDED_SCENE';
  creatorOrganizationId: string;
  creatorFounderId: string;
  sourceIndustryPackId: string;
  sourceDepartmentTemplateId: string | null;
  conceptOwner: string;
  assetOwner: string;
  workflowOwner: string;
  blueprintOwner: string;
  promptOwner: string;
  version: string;
  creationDate: string;
  lineage: string[];
  privateStatus: boolean;
  defaultAvailability: boolean;
  marketplaceEligibility: boolean;
  licensingStatus: 'unlicensed' | 'pending' | 'licensed';
  royaltyPolicyId: string | null;
  brandNeutralizationRequired: boolean;
  rightsRestrictions: string[];
  publicationStatus: FounderModPublicationStatus;
};

export type ModLineageRecord = {
  lineageVersion: typeof FOUNDER_MODS_VERSION;
  rootTemplateId: string;
  rootTemplateVersion: string;
  creatorOrganizationId: string;
  creatorModId: string;
  creatorModVersion: string;
  marketplaceListingId: string | null;
  licenseId: string | null;
  buyerOrganizationId: string | null;
  installedInstanceId: string | null;
  installedAt: string | null;
  derivativeRevision: number;
  attributionRequired: boolean;
  royaltyObligation: boolean;
  updateEntitlement: boolean;
};

export type RoyaltyPolicyType = 'percentage' | 'fixed' | 'hybrid';

export type CreatorRoyaltyPolicy = {
  royaltyPolicyId: string;
  creatorOrganizationId: string;
  listingId: string | null;
  creatorRoyaltyType: RoyaltyPolicyType;
  creatorRoyaltyRate: number | null;
  fixedCreatorAmount: number | null;
  netRevenueBasis: 'sale_price_minus_platform_fee';
  currency: string;
  effectiveFrom: string;
  effectiveUntil: string | null;
  refundTreatment: 'clawback_creator_share';
  promotionalDiscountTreatment: 'proportional';
  affiliateTreatment: 'separate_from_creator_royalty';
  taxTreatment: 'founder_configured';
};

export type RoyaltyLedgerEntry = {
  ledgerId: string;
  royaltyPolicyId: string;
  listingId: string;
  licenseId: string;
  buyerOrganizationId: string;
  salePrice: number;
  platformFee: number;
  creatorRoyaltyAmount: number;
  currency: string;
  payoutStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
};

export type ModLicenseType =
  | 'PERSONAL_HEADQUARTERS_LICENSE'
  | 'COMMERCIAL_HEADQUARTERS_LICENSE'
  | 'MULTI_PROPERTY_LICENSE'
  | 'CREATOR_DERIVATIVE_LICENSE'
  | 'ENTERPRISE_LICENSE';

export type ModLicenseRecord = {
  licenseId: string;
  licenseType: ModLicenseType;
  modId: string;
  buyerOrganizationId: string;
  allowedInstallations: number;
  allowedModifications: boolean;
  resaleRights: boolean;
  derivativeRights: boolean;
  attributionRequired: boolean;
  updateAccess: boolean;
  transferability: boolean;
  expiresAt: string | null;
};

export type BrandNeutralityViolation = {
  itemId: string;
  displayName: string;
  owner: string;
  registryClass: ContentClass;
  sourceLineage: string;
  remediation: string;
};

export type BrandNeutralityValidationResult =
  | { ok: true }
  | { ok: false; code: 'INDUSTRY_PACK_NOT_BRAND_NEUTRAL'; violations: BrandNeutralityViolation[] };

export type ContentRightsRecord = {
  rightsRecordId: string;
  rightsHolder: string;
  rightsGranted: string[];
  territory: string;
  duration: string;
  compensation: string | null;
  royaltyTerms: string | null;
  attribution: boolean;
  exclusivity: boolean;
  modificationRights: boolean;
  sublicensingRights: boolean;
  terminationTerms: string;
};
