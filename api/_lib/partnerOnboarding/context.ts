/**
 * Operator production context — server-authoritative org + billing owner snapshot.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { resolvePartnerCapabilities } from '../../../src/studio-os-core/partner-onboarding/capabilities.js';
import type { OperatorProductionContext } from '../../../src/studio-os-core/partner-onboarding/types.js';
import {
  getActiveBudget,
  getMembership,
  getOrganizationBySlug,
  getUsageTotalsForBillingOwner,
  listEntitlements,
  listOrganizationsForUser,
} from '../productionGovernance/service.js';
import { resolveAuthorizedOperatorContext } from '../productionGovernance/operator-context.js';

export async function buildOperatorProductionContext(
  supabase: SupabaseClient,
  input: {
    operatorEmail: string;
    operatorUserId: string;
    organizationSlug?: string;
    clientId?: string;
    projectId?: string;
    campaignId?: string;
  }
): Promise<OperatorProductionContext | null> {
  const auth = await resolveAuthorizedOperatorContext(supabase, {
    operatorEmail: input.operatorEmail,
    operatorUserId: input.operatorUserId,
    organizationSlug: input.organizationSlug,
  });
  if (!auth.ok) return null;

  const org = await getOrganizationBySlug(supabase, auth.context.organizationSlug);
  if (!org) return null;

  const membership = await getMembership(supabase, org.id, input.operatorEmail);
  const entitlements = await listEntitlements(supabase, org.id);
  const foundingPartner = entitlements.some((e) => e.source === 'FOUNDING_PARTNER' && e.status === 'active');
  const budget = await getActiveBudget(supabase, org.id);
  const bounds = budget
    ? { start: budget.periodStart, end: budget.periodEnd }
    : {
        start: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString(),
        end: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 1)).toISOString(),
      };
  const totals = await getUsageTotalsForBillingOwner(supabase, org.id, bounds.start, bounds.end);
  const hard = budget?.hardLimit;
  const available = hard != null ? Math.max(0, hard - totals.actual - totals.reserved) : null;

  let clientName: string | undefined;
  if (input.clientId) {
    const { data: client } = await supabase
      .from('studio_world_clients')
      .select('name')
      .eq('id', input.clientId)
      .eq('organization_id', org.id)
      .maybeSingle();
    clientName = client?.name as string | undefined;
  }

  let projectName: string | undefined;
  if (input.projectId) {
    const { data: project } = await supabase
      .from('studio_world_projects')
      .select('name')
      .eq('id', input.projectId)
      .eq('organization_id', org.id)
      .maybeSingle();
    projectName = project?.name as string | undefined;
  }

  return {
    operatorEmail: input.operatorEmail.toLowerCase(),
    activeOrganizationSlug: org.slug,
    activeOrganizationName: org.name,
    organizationType: org.organizationType,
    role: membership?.role ?? 'VIEWER',
    billingOwnerSlug: org.slug,
    billingOwnerId: org.id,
    clientId: input.clientId,
    clientName,
    projectId: input.projectId,
    projectName,
    campaignId: input.campaignId,
    budget: budget
      ? {
          hardLimit: budget.hardLimit,
          softLimit: budget.softLimit,
          currency: budget.currency,
          actual: totals.actual,
          reserved: totals.reserved,
          available,
        }
      : undefined,
    capabilities: resolvePartnerCapabilities(org.organizationType, foundingPartner),
    foundingPartner,
    platformAccess: foundingPartner ? 'COMPLIMENTARY' : 'STANDARD',
    productionCompute: 'METERED',
  };
}

export async function listOperatorOrganizations(supabase: SupabaseClient, operatorEmail: string) {
  return listOrganizationsForUser(supabase, operatorEmail);
}
