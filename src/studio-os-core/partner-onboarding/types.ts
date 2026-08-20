/**
 * Studio World Partner / Agency onboarding types.
 */

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked' | 'declined';

export type PartnerOrganizationType =
  | 'OWNER'
  | 'AGENCY'
  | 'PARTNER'
  | 'CLIENT_ORG'
  | 'BRAND_GROUP';

export type PartnerCapabilityState =
  | 'AVAILABLE'
  | 'POLICY_DEPENDENT'
  | 'BLOCKED_EXTERNAL'
  | 'MIGRATION_REQUIRED'
  | 'NON_BILLABLE';

export type PartnerCapabilityEntry = {
  routeKey: string;
  label: string;
  state: PartnerCapabilityState;
  message: string;
};

export type OperatorProductionContext = {
  operatorEmail: string;
  activeOrganizationSlug: string;
  activeOrganizationName: string;
  organizationType: string;
  role: string;
  billingOwnerSlug: string;
  billingOwnerId: string;
  clientId?: string;
  clientName?: string;
  projectId?: string;
  projectName?: string;
  campaignId?: string;
  budget?: {
    hardLimit?: number;
    softLimit?: number;
    currency: string;
    actual: number;
    reserved: number;
    available: number | null;
  };
  capabilities: PartnerCapabilityEntry[];
  foundingPartner: boolean;
  platformAccess: 'COMPLIMENTARY' | 'STANDARD';
  productionCompute: 'METERED';
};

export const FOUNDING_PARTNER_ENTITLEMENT_KEYS = [
  'PLATFORM_ACCESS',
  'PRODUCTION_ACCESS',
  'IMAGE_GENERATION',
  'COMMERCIAL_USE',
] as const;

export const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
