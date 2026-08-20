/**
 * Governed generation gateway — production governance enforcement hook.
 * GOVERNED routes always enforce server-side; client enabled:false cannot bypass.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  GovernedGenerationRequest,
  GovernedGenerationResult,
} from '../../../src/studio-os-core/creative-production/types.js';
import type { ProductionOperationType } from '../../../src/studio-os-core/production-governance/types.js';
import { executeGovernedProduction } from './executeGovernedProduction.js';
import { isGovernedProductionRoute } from './route-registry.js';

export type GatewayProductionGovernanceOptions = NonNullable<
  GovernedGenerationRequest['productionGovernance']
>;

function routeKeyFromSourceRoute(sourceRoute: string): string {
  const path = sourceRoute.replace(/^\/api\/admin\//, '').replace(/^\//, '');
  if (path.includes('studio-builder-generate')) return 'studio-builder-generate';
  if (path.includes('studio-foundry-generate')) return 'studio-foundry-generate';
  if (path.includes('studio-generate-asset')) return 'studio-generate-asset';
  if (path.includes('founder-render-generate')) return 'founder-render-generate';
  if (path.includes('studio-virtual-production')) return 'studio-virtual-production';
  return path;
}

function estimateCostUsd(gov: GatewayProductionGovernanceOptions | undefined, fallback = 2.5): number {
  if (gov?.estimatedCostUsd != null && Number.isFinite(gov.estimatedCostUsd)) {
    return gov.estimatedCostUsd;
  }
  return fallback;
}

export async function runProductionGovernancePreflight(
  supabase: SupabaseClient,
  request: GovernedGenerationRequest
): Promise<GovernedGenerationResult | null> {
  const routeKey = routeKeyFromSourceRoute(request.sourceRoute);
  if (!isGovernedProductionRoute(routeKey)) {
    return null;
  }

  const gov = request.productionGovernance;
  const operatorEmail = gov?.operatorEmail ?? String(request.execution.actorEmail ?? request.orgId);
  const operatorUserId = operatorEmail;

  const result = await executeGovernedProduction(supabase, {
    routeKey,
    operatorEmail,
    operatorUserId,
    organizationSlug: gov?.organizationSlug ?? request.orgId,
    operationType: (gov?.operationType ?? 'IMAGE_GENERATION') as ProductionOperationType,
    provider: gov?.provider ?? 'fal',
    model: gov?.model,
    estimatedCost: estimateCostUsd(gov),
    idempotencyKey: gov?.idempotencyKey,
    workspaceId: gov?.workspaceId,
    clientId: gov?.clientId,
    projectId: gov?.projectId ?? (typeof request.execution.projectId === 'string' ? request.execution.projectId : undefined),
    campaignId: gov?.campaignId,
    shotId: gov?.shotId,
    clientGovernanceEnabled: gov?.enabled,
  });

  if (result.ok) return null;

  return {
    ok: false,
    code: result.code.startsWith('GOVERNANCE_') ? result.code : `GOVERNANCE_${result.code}`,
    error: result.error,
  };
}

export async function runProductionGovernanceReservation(
  supabase: SupabaseClient,
  request: GovernedGenerationRequest
): Promise<
  | { ok: true; reservationId: string; organizationId: string; billingOwnerId: string }
  | { ok: false; result: GovernedGenerationResult }
> {
  const routeKey = routeKeyFromSourceRoute(request.sourceRoute);
  if (!isGovernedProductionRoute(routeKey)) {
    return { ok: true, reservationId: '', organizationId: '', billingOwnerId: '' };
  }

  const gov = request.productionGovernance;
  const operatorEmail = gov?.operatorEmail ?? String(request.execution.actorEmail ?? request.orgId);

  const result = await executeGovernedProduction(supabase, {
    routeKey,
    operatorEmail,
    operatorUserId: operatorEmail,
    organizationSlug: gov?.organizationSlug ?? request.orgId,
    operationType: (gov?.operationType ?? 'IMAGE_GENERATION') as ProductionOperationType,
    provider: gov?.provider ?? 'fal',
    model: gov?.model,
    estimatedCost: estimateCostUsd(gov),
    idempotencyKey: gov?.idempotencyKey,
    workspaceId: gov?.workspaceId,
    clientId: gov?.clientId,
    projectId: gov?.projectId,
    campaignId: gov?.campaignId,
    shotId: gov?.shotId,
    clientGovernanceEnabled: gov?.enabled,
  });

  if (!result.ok || !result.reservationId) {
    return {
      ok: false,
      result: {
        ok: false,
        code: result.ok ? 'GOVERNANCE_RESERVATION_FAILED' : result.code,
        error: result.ok ? 'Atomic budget reservation failed' : result.error,
      },
    };
  }

  return {
    ok: true,
    reservationId: result.reservationId,
    organizationId: result.governance.billingOwner.billingOwnerId,
    billingOwnerId: result.governance.billingOwner.billingOwnerId,
  };
}
