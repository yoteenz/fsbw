/**
 * Governed generation gateway — production governance pre-flight hook.
 * Opt-in via request.productionGovernance.enabled — existing routes unchanged when absent.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { GovernedGenerationRequest, GovernedGenerationResult } from '../../../src/studio-os-core/creative-production/types.js';
import type { ProductionOperationType } from '../../../src/studio-os-core/production-governance/types.js';
import { evaluateGovernanceForRequest } from './service.js';

export type GatewayProductionGovernanceOptions = NonNullable<
  GovernedGenerationRequest['productionGovernance']
>;

export async function runProductionGovernancePreflight(
  supabase: SupabaseClient,
  request: GovernedGenerationRequest
): Promise<GovernedGenerationResult | null> {
  const gov = request.productionGovernance;
  if (!gov?.enabled) return null;

  const operationType = (gov.operationType ?? 'IMAGE_GENERATION') as ProductionOperationType;
  const result = await evaluateGovernanceForRequest(supabase, {
    context: {
      operatorUserId: gov.operatorEmail,
      operatorEmail: gov.operatorEmail,
      organizationId: gov.organizationSlug,
      organizationSlug: gov.organizationSlug,
      workspaceId: gov.workspaceId,
      clientId: gov.clientId,
      projectId: gov.projectId,
      campaignId: gov.campaignId,
      shotId: gov.shotId,
    },
    operationType,
    provider: gov.provider ?? 'fal',
    model: gov.model,
    estimatedCost: gov.estimatedCostUsd,
    idempotencyKey: gov.idempotencyKey,
  });

  if (result.allowed) return null;

  return {
    ok: false,
    code: `GOVERNANCE_${result.decision}`,
    error: result.message ?? `Production blocked: ${result.decision}`,
  };
}
