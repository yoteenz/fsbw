/**
 * Studio World Production Governance — canonical server enforcement entry.
 * GOVERNED routes MUST pass through this wrapper; client enabled:false is ignored.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  ProductionGovernanceResult,
  ProductionOperationType,
} from '../../../src/studio-os-core/production-governance/types.js';
import { atomicReserveBudget } from './atomic-reserve.js';
import {
  isExternalPartnerOrganization,
  resolveAuthorizedOperatorContext,
} from './operator-context.js';
import {
  isGovernedProductionRoute,
  resolveProductionRoute,
  type ProductionRouteGovernanceClass,
} from './route-registry.js';
import {
  appendUsageEvent,
  evaluateGovernanceForRequest,
  getActiveBudget,
  getOrganizationBySlug,
  reconcileReservation,
} from './service.js';

export type ExecuteGovernedProductionInput = {
  routeKey: string;
  operatorEmail: string;
  operatorUserId: string;
  organizationSlug?: string;
  operationType: ProductionOperationType;
  provider: string;
  model?: string;
  estimatedCost: number;
  idempotencyKey?: string;
  workspaceId?: string;
  clientId?: string;
  projectId?: string;
  campaignId?: string;
  shotId?: string;
  simulate?: boolean;
  /** Ignored for GOVERNED routes — enforcement is mandatory. */
  clientGovernanceEnabled?: boolean;
};

export type ExecuteGovernedProductionSuccess = {
  ok: true;
  governance: ProductionGovernanceResult;
  reservationId?: string;
  usageEventId?: string;
  governanceClass: ProductionRouteGovernanceClass;
};

export type ExecuteGovernedProductionFailure = {
  ok: false;
  code: string;
  error: string;
  governance?: ProductionGovernanceResult;
  governanceClass?: ProductionRouteGovernanceClass;
};

export type ExecuteGovernedProductionResult =
  | ExecuteGovernedProductionSuccess
  | ExecuteGovernedProductionFailure;

function defaultIdempotencyKey(input: ExecuteGovernedProductionInput): string {
  return (
    input.idempotencyKey ??
    `gov-${input.routeKey}-${input.operatorEmail}-${input.operationType}-${Date.now()}`
  );
}

export async function executeGovernedProduction(
  supabase: SupabaseClient,
  input: ExecuteGovernedProductionInput
): Promise<ExecuteGovernedProductionResult> {
  const route = resolveProductionRoute(input.routeKey);
  const governanceClass = route?.governanceClass ?? 'REQUIRES_MIGRATION';

  if (governanceClass === 'NON_BILLABLE') {
    return {
      ok: true,
      governance: {
        allowed: true,
        decision: 'ALLOWED',
        billingOwner: {
          billingOwnerType: 'organization',
          billingOwnerId: input.organizationSlug ?? 'non-billable',
          organizationSlug: input.organizationSlug ?? 'non-billable',
        },
      },
      governanceClass,
    };
  }

  if (governanceClass === 'SAFE_INTERNAL_EXCEPTION' && input.simulate) {
    const sim = await evaluateGovernanceForRequest(supabase, {
      context: {
        operatorUserId: input.operatorUserId,
        operatorEmail: input.operatorEmail,
        organizationId: input.organizationSlug ?? 'frontal-slayer',
        organizationSlug: input.organizationSlug ?? 'frontal-slayer',
      },
      operationType: input.operationType,
      provider: input.provider,
      model: input.model,
      estimatedCost: input.estimatedCost,
      simulate: true,
    });
    return {
      ok: sim.allowed,
      governance: sim,
      governanceClass,
      ...(sim.allowed
        ? {}
        : {
            code: `GOVERNANCE_${sim.decision}`,
            error: sim.message ?? `Production blocked: ${sim.decision}`,
          }),
    } as ExecuteGovernedProductionResult;
  }

  if (governanceClass === 'REQUIRES_MIGRATION') {
    const authCtx = await resolveAuthorizedOperatorContext(supabase, {
      operatorEmail: input.operatorEmail,
      operatorUserId: input.operatorUserId,
      organizationSlug: input.organizationSlug,
    });
    if (!authCtx.ok) {
      return { ok: false, code: authCtx.code, error: authCtx.error, governanceClass };
    }
    if (isExternalPartnerOrganization(authCtx.context.organizationType)) {
      return {
        ok: false,
        code: 'ROUTE_REQUIRES_MIGRATION',
        error: `${input.routeKey} is not yet governed for external partner organizations`,
        governanceClass,
      };
    }
    return {
      ok: true,
      governance: {
        allowed: true,
        decision: 'ALLOWED',
        billingOwner: {
          billingOwnerType: 'organization',
          billingOwnerId: authCtx.context.organizationId,
          organizationSlug: authCtx.context.organizationSlug,
        },
        message: 'Owner-org bypass until route migration completes',
      },
      governanceClass,
    };
  }

  if (!isGovernedProductionRoute(input.routeKey)) {
    return {
      ok: false,
      code: 'ROUTE_NOT_GOVERNED',
      error: `Route ${input.routeKey} is not registered as GOVERNED`,
      governanceClass,
    };
  }

  const authCtx = await resolveAuthorizedOperatorContext(supabase, {
    operatorEmail: input.operatorEmail,
    operatorUserId: input.operatorUserId,
    organizationSlug: input.organizationSlug,
  });
  if (!authCtx.ok) {
    return { ok: false, code: authCtx.code, error: authCtx.error, governanceClass };
  }

  const { context } = authCtx;
  const governance = await evaluateGovernanceForRequest(supabase, {
    context: {
      operatorUserId: context.operatorUserId,
      operatorEmail: context.operatorEmail,
      organizationId: context.organizationId,
      organizationSlug: context.organizationSlug,
      workspaceId: input.workspaceId,
      clientId: input.clientId,
      projectId: input.projectId,
      campaignId: input.campaignId,
      shotId: input.shotId,
    },
    operationType: input.operationType,
    provider: input.provider,
    model: input.model,
    estimatedCost: input.estimatedCost,
    idempotencyKey: defaultIdempotencyKey(input),
    simulate: input.simulate,
  });

  if (!governance.allowed) {
    return {
      ok: false,
      code: `GOVERNANCE_${governance.decision}`,
      error: governance.message ?? `Production blocked: ${governance.decision}`,
      governance,
      governanceClass,
    };
  }

  if (input.simulate) {
    return { ok: true, governance, governanceClass };
  }

  const org = await getOrganizationBySlug(supabase, context.organizationSlug);
  if (!org) {
    return { ok: false, code: 'ORG_NOT_FOUND', error: 'Organization not found', governanceClass };
  }

  const budget = await getActiveBudget(supabase, org.id);
  const reserve = await atomicReserveBudget(supabase, {
    billingOwnerId: governance.billingOwner.billingOwnerId,
    organizationId: org.id,
    idempotencyKey: defaultIdempotencyKey(input),
    estimatedCost: input.estimatedCost,
    operationType: input.operationType,
    provider: input.provider,
    model: input.model,
    periodStart: budget?.periodStart,
    periodEnd: budget?.periodEnd,
    metadata: { routeKey: input.routeKey, operatorEmail: context.operatorEmail },
  });

  if (!reserve.ok) {
    return {
      ok: false,
      code: reserve.code,
      error: reserve.message,
      governance: {
        ...governance,
        allowed: false,
        decision: 'BLOCKED_BUDGET',
        message: reserve.message,
      },
      governanceClass,
    };
  }

  return {
    ok: true,
    governance,
    reservationId: reserve.reservationId,
    governanceClass,
  };
}

export async function finalizeGovernedProduction(
  supabase: SupabaseClient,
  input: {
    reservationId: string;
    operatorUserId: string;
    organizationId: string;
    billingOwnerId: string;
    operationType: ProductionOperationType;
    provider: string;
    model?: string;
    estimatedCost: number;
    actualCost?: number;
    idempotencyKey?: string;
    outcome: 'completed' | 'failed';
    workspaceId?: string;
    clientId?: string;
    projectId?: string;
    campaignId?: string;
    shotId?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<{ usageEventId?: string }> {
  const usage = await appendUsageEvent(supabase, {
    idempotencyKey: input.idempotencyKey ? `${input.idempotencyKey}-usage` : undefined,
    operatorUserId: input.operatorUserId,
    organizationId: input.organizationId,
    billingOwnerId: input.billingOwnerId,
    workspaceId: input.workspaceId,
    clientId: input.clientId,
    projectId: input.projectId,
    campaignId: input.campaignId,
    shotId: input.shotId,
    provider: input.provider,
    model: input.model,
    operationType: input.operationType,
    estimatedCost: input.estimatedCost,
    actualCost: input.actualCost ?? (input.outcome === 'completed' ? input.estimatedCost : undefined),
    costSource: 'INTERNAL_ESTIMATE',
    reservationId: input.reservationId,
    status: input.outcome === 'completed' ? 'completed' : 'failed',
    metadata: input.metadata,
  });

  await reconcileReservation(
    supabase,
    input.reservationId,
    input.outcome === 'completed' ? 'completed' : 'released',
    input.actualCost ?? input.estimatedCost,
    usage.id as string
  );

  return { usageEventId: usage.id as string };
}

export async function releaseGovernedProductionReservation(
  supabase: SupabaseClient,
  reservationId: string
): Promise<void> {
  await reconcileReservation(supabase, reservationId, 'released');
}
