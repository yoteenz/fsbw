/**
 * Studio World Production Governance — pure authorization + billing logic.
 */

import {
  OPERATION_ENTITLEMENT_MAP,
  ROLE_PERMISSIONS,
  type BillingOwner,
  type BudgetDecision,
  type Entitlement,
  type EntitlementKey,
  type OrganizationMembership,
  type OrganizationRole,
  type ProductionBudget,
  type ProductionCostReservation,
  type ProductionGovernanceRequest,
  type ProductionGovernanceResult,
  type ProductionPolicy,
  type ProductionUsageEvent,
  type StudioWorldOrganization,
} from './types';

export function canAccessOrganization(
  membership: OrganizationMembership | null | undefined
): boolean {
  return membership?.status === 'active' && Boolean(ROLE_PERMISSIONS[membership.role]?.includes('access_organization'));
}

export function canAccessProject(
  membership: OrganizationMembership | null | undefined
): boolean {
  return membership?.status === 'active' && Boolean(ROLE_PERMISSIONS[membership.role]?.includes('access_project'));
}

export function canCreateProduction(
  membership: OrganizationMembership | null | undefined
): boolean {
  return membership?.status === 'active' && Boolean(ROLE_PERMISSIONS[membership.role]?.includes('create_production'));
}

export function canApproveProduction(
  membership: OrganizationMembership | null | undefined
): boolean {
  return membership?.status === 'active' && Boolean(ROLE_PERMISSIONS[membership.role]?.includes('approve_production'));
}

export function canManageMembers(
  membership: OrganizationMembership | null | undefined
): boolean {
  return membership?.status === 'active' && Boolean(ROLE_PERMISSIONS[membership.role]?.includes('manage_members'));
}

export function canManageBilling(
  membership: OrganizationMembership | null | undefined
): boolean {
  return membership?.status === 'active' && Boolean(ROLE_PERMISSIONS[membership.role]?.includes('manage_billing'));
}

export function canViewUsage(membership: OrganizationMembership | null | undefined): boolean {
  return membership?.status === 'active' && Boolean(ROLE_PERMISSIONS[membership.role]?.includes('view_usage'));
}

export function canModifyBudget(membership: OrganizationMembership | null | undefined): boolean {
  return membership?.status === 'active' && Boolean(ROLE_PERMISSIONS[membership.role]?.includes('modify_budget'));
}

/** Billing owner resolves from organization/project context — never from operator user id. */
export function resolveBillingOwner(input: {
  organization: Pick<StudioWorldOrganization, 'id' | 'slug'>;
}): BillingOwner {
  return {
    billingOwnerType: 'organization',
    billingOwnerId: input.organization.id,
    organizationSlug: input.organization.slug,
  };
}

export function isEntitlementActive(entitlement: Entitlement, now = Date.now()): boolean {
  if (entitlement.status !== 'active') return false;
  if (entitlement.expiresAt && Date.parse(entitlement.expiresAt) < now) return false;
  return true;
}

export function hasEntitlement(
  entitlements: Entitlement[],
  key: EntitlementKey,
  now = Date.now()
): boolean {
  return entitlements.some((e) => e.entitlementKey === key && isEntitlementActive(e, now));
}

export function requiredEntitlementForOperation(
  operationType: ProductionGovernanceRequest['operationType']
): EntitlementKey | null {
  return OPERATION_ENTITLEMENT_MAP[operationType] ?? 'PRODUCTION_ACCESS';
}

export function resolveProductionPolicy(
  organizationId: string,
  entitlements: Entitlement[],
  storedPolicy?: ProductionPolicy | null
): ProductionPolicy {
  const base: ProductionPolicy = {
    organizationId,
    enabledProviders: ['fal', 'openart', 'openart-director', 'manual', 'simulated'],
    allowedOperationTypes: [
      'IMAGE_GENERATION',
      'VIDEO_GENERATION',
      'PRECISION_REPAIR',
      'UPSCALE',
      'ASSEMBLY',
      'OTHER_COMPUTE',
    ],
    maxConcurrentJobs: 5,
    ...storedPolicy,
  };

  if (!hasEntitlement(entitlements, 'VIDEO_GENERATION')) {
    base.allowedOperationTypes = (base.allowedOperationTypes ?? []).filter(
      (t) => t !== 'VIDEO_GENERATION'
    );
  }
  if (!hasEntitlement(entitlements, 'IMAGE_GENERATION')) {
    base.allowedOperationTypes = (base.allowedOperationTypes ?? []).filter(
      (t) => t !== 'IMAGE_GENERATION' && t !== 'PRECISION_REPAIR'
    );
  }

  return base;
}

export function sumUsageCosts(
  events: Pick<ProductionUsageEvent, 'actualCost' | 'estimatedCost' | 'status'>[]
): number {
  return events.reduce((sum, e) => {
    if (e.status === 'failed') return sum;
    const cost = e.actualCost ?? e.estimatedCost;
    return sum + (Number.isFinite(cost) ? cost : 0);
  }, 0);
}

export function sumReservationCosts(
  reservations: Pick<ProductionCostReservation, 'estimatedCost' | 'status'>[]
): number {
  return reservations
    .filter((r) => r.status === 'pending')
    .reduce((sum, r) => sum + r.estimatedCost, 0);
}

export function evaluateBudgetDecision(input: {
  billingOwner: BillingOwner;
  budget: ProductionBudget | null;
  actualUsage: number;
  reservedUsage: number;
  estimatedCost: number;
  warningThresholdPercent?: number;
}): BudgetDecision {
  const { billingOwner, budget, actualUsage, reservedUsage, estimatedCost } = input;
  const projected = actualUsage + reservedUsage + estimatedCost;
  const warningThresholdPercent = input.warningThresholdPercent ?? 80;

  if (!budget || budget.status !== 'active') {
    return {
      outcome: 'BUDGET_UNAVAILABLE',
      billingOwner,
      currentActualUsage: actualUsage,
      currentReservedUsage: reservedUsage,
      projectedUsage: projected,
      currency: budget?.currency ?? 'USD',
      message: 'No active production budget configured',
    };
  }

  const soft = budget.softLimit;
  const hard = budget.hardLimit;
  const currency = budget.currency;

  if (hard != null && projected > hard) {
    return {
      outcome: 'BLOCKED_BUDGET',
      billingOwner,
      currentActualUsage: actualUsage,
      currentReservedUsage: reservedUsage,
      projectedUsage: projected,
      softLimit: soft,
      hardLimit: hard,
      currency,
      warningThresholdPercent,
      message: `Hard budget limit exceeded (${projected.toFixed(2)} > ${hard})`,
    };
  }

  if (soft != null && projected > soft) {
    return {
      outcome: 'ALLOWED_WITH_WARNING',
      billingOwner,
      currentActualUsage: actualUsage,
      currentReservedUsage: reservedUsage,
      projectedUsage: projected,
      softLimit: soft,
      hardLimit: hard,
      currency,
      warningThresholdPercent,
      message: `Soft budget threshold exceeded (${projected.toFixed(2)} > ${soft})`,
    };
  }

  if (hard != null && hard > 0) {
    const pct = (projected / hard) * 100;
    if (pct >= warningThresholdPercent) {
      return {
        outcome: 'ALLOWED_WITH_WARNING',
        billingOwner,
        currentActualUsage: actualUsage,
        currentReservedUsage: reservedUsage,
        projectedUsage: projected,
        softLimit: soft,
        hardLimit: hard,
        currency,
        warningThresholdPercent,
        message: `Approaching budget limit (${pct.toFixed(1)}%)`,
      };
    }
  }

  return {
    outcome: 'ALLOWED',
    billingOwner,
    currentActualUsage: actualUsage,
    currentReservedUsage: reservedUsage,
    projectedUsage: projected,
    softLimit: soft,
    hardLimit: hard,
    currency,
    warningThresholdPercent,
  };
}

export function evaluateProductionGovernance(input: {
  request: ProductionGovernanceRequest;
  organization: StudioWorldOrganization;
  membership: OrganizationMembership | null;
  entitlements: Entitlement[];
  budget: ProductionBudget | null;
  actualUsage: number;
  reservedUsage: number;
  policy?: ProductionPolicy | null;
}): ProductionGovernanceResult {
  const { request, organization, membership, entitlements, budget, actualUsage, reservedUsage } = input;

  if (organization.status !== 'active') {
    return {
      allowed: false,
      decision: 'BLOCKED_PERMISSION',
      billingOwner: resolveBillingOwner({ organization }),
      message: 'Organization is not active',
    };
  }

  if (!canCreateProduction(membership)) {
    return {
      allowed: false,
      decision: 'BLOCKED_PERMISSION',
      billingOwner: resolveBillingOwner({ organization }),
      message: 'Operator lacks production permission for this organization',
    };
  }

  const billingOwner = resolveBillingOwner({ organization });

  if (!hasEntitlement(entitlements, 'PLATFORM_ACCESS')) {
    return {
      allowed: false,
      decision: 'BLOCKED_ENTITLEMENT',
      billingOwner,
      message: 'Organization lacks PLATFORM_ACCESS entitlement',
      entitlementKeys: entitlements.map((e) => e.entitlementKey),
    };
  }

  if (!hasEntitlement(entitlements, 'PRODUCTION_ACCESS')) {
    return {
      allowed: false,
      decision: 'BLOCKED_ENTITLEMENT',
      billingOwner,
      message: 'Organization lacks PRODUCTION_ACCESS entitlement',
    };
  }

  const requiredEntitlement = requiredEntitlementForOperation(request.operationType);
  if (requiredEntitlement && !hasEntitlement(entitlements, requiredEntitlement)) {
    return {
      allowed: false,
      decision: 'BLOCKED_ENTITLEMENT',
      billingOwner,
      message: `Organization lacks ${requiredEntitlement} entitlement`,
    };
  }

  const policy = resolveProductionPolicy(organization.id, entitlements, input.policy);
  if (policy.allowedOperationTypes && !policy.allowedOperationTypes.includes(request.operationType)) {
    return {
      allowed: false,
      decision: 'BLOCKED_ENTITLEMENT',
      billingOwner,
      policy,
      message: `Operation ${request.operationType} not allowed by production policy`,
    };
  }

  if (policy.enabledProviders && !policy.enabledProviders.includes(request.provider)) {
    return {
      allowed: false,
      decision: 'BLOCKED_ENTITLEMENT',
      billingOwner,
      policy,
      message: `Provider ${request.provider} not enabled for organization`,
    };
  }

  const budgetDecision = evaluateBudgetDecision({
    billingOwner,
    budget,
    actualUsage,
    reservedUsage,
    estimatedCost: request.estimatedCost,
  });

  const allowed =
    budgetDecision.outcome === 'ALLOWED' ||
    budgetDecision.outcome === 'ALLOWED_WITH_WARNING' ||
    budgetDecision.outcome === 'BUDGET_UNAVAILABLE';

  return {
    allowed,
    decision: budgetDecision.outcome,
    billingOwner,
    policy,
    entitlementKeys: entitlements.filter((e) => isEntitlementActive(e)).map((e) => e.entitlementKey),
    message: budgetDecision.message,
  };
}

export function budgetUsagePercent(actual: number, reserved: number, hardLimit?: number): number | null {
  if (hardLimit == null || hardLimit <= 0) return null;
  return ((actual + reserved) / hardLimit) * 100;
}

export function roleRank(role: OrganizationRole): number {
  const order: OrganizationRole[] = [
    'VIEWER',
    'CLIENT',
    'REVIEWER',
    'MARKETING_COLLABORATOR',
    'PRODUCER',
    'PRODUCTION_DIRECTOR',
    'ADMIN',
    'OWNER',
  ];
  return order.indexOf(role);
}
