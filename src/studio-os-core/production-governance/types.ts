/**
 * Studio World Production Governance — canonical types.
 * Operator ≠ billing owner. Complimentary platform ≠ complimentary compute.
 */

export const PRODUCTION_GOVERNANCE_VERSION = 'v1';

export type OrganizationType =
  | 'OWNER'
  | 'BRAND_GROUP'
  | 'AGENCY'
  | 'CLIENT_ORG'
  | 'PARTNER';

export type OrganizationStatus = 'active' | 'inactive' | 'suspended';

export type OrganizationRole =
  | 'OWNER'
  | 'ADMIN'
  | 'PRODUCTION_DIRECTOR'
  | 'PRODUCER'
  | 'MARKETING_COLLABORATOR'
  | 'REVIEWER'
  | 'CLIENT'
  | 'VIEWER';

export type EntitlementKey =
  | 'PLATFORM_ACCESS'
  | 'PRODUCTION_ACCESS'
  | 'IMAGE_GENERATION'
  | 'VIDEO_GENERATION'
  | 'PRECISION_REPAIR'
  | 'UPSCALE'
  | 'QC'
  | 'ASSEMBLY'
  | 'CAMPAIGN_MANAGEMENT'
  | 'CLIENT_MANAGEMENT'
  | 'ADVANCED_ANALYTICS'
  | 'API_ACCESS'
  | 'WHITE_LABEL'
  | 'COMMERCIAL_USE';

export type EntitlementSource =
  | 'SYSTEM'
  | 'PLAN'
  | 'FOUNDING_PARTNER'
  | 'ADMIN_GRANT'
  | 'PROMOTION'
  | 'CONTRACT';

export type EntitlementStatus = 'active' | 'inactive' | 'expired';

export type ProductionOperationType =
  | 'IMAGE_GENERATION'
  | 'VIDEO_GENERATION'
  | 'UPSCALE'
  | 'PRECISION_REPAIR'
  | 'BACKGROUND_REMOVAL'
  | 'FRAME_INTERPOLATION'
  | 'AUDIO_GENERATION'
  | 'VOICE'
  | 'ASSEMBLY'
  | 'OTHER_COMPUTE';

export type CostSource =
  | 'PROVIDER_ACTUAL'
  | 'PROVIDER_ESTIMATE'
  | 'INTERNAL_ESTIMATE'
  | 'UNKNOWN';

export type UsageEventStatus = 'pending' | 'completed' | 'failed' | 'adjusted';

export type ReservationStatus = 'pending' | 'completed' | 'released' | 'failed';

export type BudgetDecisionOutcome =
  | 'ALLOWED'
  | 'ALLOWED_WITH_WARNING'
  | 'BLOCKED_BUDGET'
  | 'BLOCKED_ENTITLEMENT'
  | 'BLOCKED_PERMISSION'
  | 'BUDGET_UNAVAILABLE';

export type BillingOwnerType = 'organization';

export type StudioWorldOrganization = {
  id: string;
  slug: string;
  name: string;
  organizationType: OrganizationType;
  status: OrganizationStatus;
  metadata?: Record<string, unknown>;
};

export type OrganizationMembership = {
  id: string;
  organizationId: string;
  userEmail: string;
  role: OrganizationRole;
  status: 'active' | 'inactive' | 'invited';
};

export type Entitlement = {
  id: string;
  organizationId: string;
  entitlementKey: EntitlementKey;
  status: EntitlementStatus;
  source: EntitlementSource;
  startsAt: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
};

export type BillingOwner = {
  billingOwnerType: BillingOwnerType;
  billingOwnerId: string;
  organizationSlug: string;
};

export type ProductionBudget = {
  id: string;
  organizationId: string;
  periodType: 'monthly' | 'weekly' | 'custom';
  periodStart: string;
  periodEnd: string;
  softLimit?: number;
  hardLimit?: number;
  currency: string;
  status: 'active' | 'inactive';
};

export type ProductionUsageEvent = {
  id: string;
  idempotencyKey?: string;
  operatorUserId: string;
  organizationId: string;
  workspaceId?: string;
  clientId?: string;
  projectId?: string;
  campaignId?: string;
  shotId?: string;
  assetId?: string;
  billingOwnerType: BillingOwnerType;
  billingOwnerId: string;
  provider: string;
  model?: string;
  operationType: ProductionOperationType;
  estimatedCost: number;
  actualCost?: number;
  currency: string;
  costSource: CostSource;
  providerRequestId?: string;
  reservationId?: string;
  status: UsageEventStatus;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type ProductionCostReservation = {
  id: string;
  organizationId: string;
  billingOwnerId: string;
  idempotencyKey: string;
  estimatedCost: number;
  actualCost?: number;
  currency: string;
  status: ReservationStatus;
  usageEventId?: string;
  operationType: ProductionOperationType;
  provider?: string;
  model?: string;
};

export type ProductionPolicy = {
  organizationId: string;
  enabledProviders?: string[];
  maxVideoDurationSeconds?: number;
  maxConcurrentJobs?: number;
  allowedOperationTypes?: ProductionOperationType[];
  costCeilingPerOperation?: number;
};

export type ProductionContext = {
  operatorUserId: string;
  operatorEmail: string;
  organizationId: string;
  organizationSlug: string;
  workspaceId?: string;
  clientId?: string;
  projectId?: string;
  campaignId?: string;
  shotId?: string;
  assetId?: string;
};

export type BudgetDecision = {
  outcome: BudgetDecisionOutcome;
  billingOwner: BillingOwner;
  currentActualUsage: number;
  currentReservedUsage: number;
  projectedUsage: number;
  softLimit?: number;
  hardLimit?: number;
  currency: string;
  warningThresholdPercent?: number;
  message?: string;
};

export type ProductionGovernanceRequest = {
  context: ProductionContext;
  operationType: ProductionOperationType;
  provider: string;
  model?: string;
  estimatedCost: number;
  currency?: string;
  idempotencyKey?: string;
  simulate?: boolean;
};

export type ProductionGovernanceResult = {
  allowed: boolean;
  decision: BudgetDecisionOutcome;
  billingOwner: BillingOwner;
  reservationId?: string;
  usageEventId?: string;
  entitlementKeys?: EntitlementKey[];
  policy?: ProductionPolicy;
  message?: string;
};

export type UsageReconciliationState =
  | 'matched'
  | 'estimated_finalized'
  | 'adjustment_required'
  | 'reservation_released'
  | 'orphaned_reservation';

export const OPERATION_ENTITLEMENT_MAP: Partial<Record<ProductionOperationType, EntitlementKey>> = {
  IMAGE_GENERATION: 'IMAGE_GENERATION',
  VIDEO_GENERATION: 'VIDEO_GENERATION',
  PRECISION_REPAIR: 'PRECISION_REPAIR',
  UPSCALE: 'UPSCALE',
  ASSEMBLY: 'ASSEMBLY',
};

export const ROLE_PERMISSIONS: Record<
  OrganizationRole,
  Array<
    | 'access_organization'
    | 'access_project'
    | 'create_production'
    | 'approve_production'
    | 'manage_members'
    | 'manage_billing'
    | 'view_usage'
    | 'modify_budget'
  >
> = {
  OWNER: [
    'access_organization',
    'access_project',
    'create_production',
    'approve_production',
    'manage_members',
    'manage_billing',
    'view_usage',
    'modify_budget',
  ],
  ADMIN: [
    'access_organization',
    'access_project',
    'create_production',
    'approve_production',
    'manage_members',
    'view_usage',
    'modify_budget',
  ],
  PRODUCTION_DIRECTOR: [
    'access_organization',
    'access_project',
    'create_production',
    'approve_production',
    'view_usage',
  ],
  PRODUCER: ['access_organization', 'access_project', 'create_production', 'view_usage'],
  MARKETING_COLLABORATOR: ['access_organization', 'access_project', 'create_production', 'view_usage'],
  REVIEWER: ['access_organization', 'access_project', 'view_usage'],
  CLIENT: ['access_organization', 'access_project', 'view_usage'],
  VIEWER: ['access_organization', 'view_usage'],
};
