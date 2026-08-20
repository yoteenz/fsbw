/**
 * Studio World Production Governance — server-side DB services.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  evaluateProductionGovernance,
  resolveBillingOwner,
  sumReservationCosts,
  sumUsageCosts,
} from '../../../src/studio-os-core/production-governance/index.js';
import type {
  EntitlementKey,
  EntitlementSource,
  EntitlementStatus,
  OrganizationMembership,
  OrganizationRole,
  OrganizationStatus,
  OrganizationType,
  ProductionBudget,
  ProductionGovernanceRequest,
  ProductionGovernanceResult,
  ReservationStatus,
  UsageEventStatus,
} from '../../../src/studio-os-core/production-governance/types.js';

function nowIso(): string {
  return new Date().toISOString();
}

function monthBounds(d = new Date()): { start: string; end: string } {
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
  return { start: start.toISOString(), end: end.toISOString() };
}

export async function getOrganizationBySlug(supabase: SupabaseClient, slug: string) {
  const { data } = await supabase
    .from('studio_world_organizations')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id as string,
    slug: data.slug as string,
    name: data.name as string,
    organizationType: data.organization_type as OrganizationType,
    status: data.status as OrganizationStatus,
    metadata: (data.metadata as Record<string, unknown>) ?? {},
  };
}

export async function getMembership(
  supabase: SupabaseClient,
  organizationId: string,
  userEmail: string
) {
  const { data } = await supabase
    .from('studio_world_organization_memberships')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('user_email', userEmail.toLowerCase())
    .eq('status', 'active')
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    userEmail: data.user_email as string,
    role: data.role as OrganizationRole,
    status: data.status as OrganizationMembership['status'],
  };
}

export async function listOrganizationsForUser(supabase: SupabaseClient, userEmail: string) {
  const { data } = await supabase
    .from('studio_world_organization_memberships')
    .select('organization_id, role, studio_world_organizations(*)')
    .eq('user_email', userEmail.toLowerCase())
    .eq('status', 'active');
  return (data ?? []).map((row) => {
    const org = row.studio_world_organizations as unknown as Record<string, unknown>;
    return {
      id: org.id as string,
      slug: org.slug as string,
      name: org.name as string,
      organizationType: org.organization_type as string,
      role: row.role as string,
    };
  });
}

export async function listEntitlements(supabase: SupabaseClient, organizationId: string) {
  const { data } = await supabase
    .from('studio_world_entitlements')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', 'active');
  return (data ?? []).map((e) => ({
    id: e.id as string,
    organizationId: e.organization_id as string,
    entitlementKey: e.entitlement_key as EntitlementKey,
    status: e.status as EntitlementStatus,
    source: e.source as EntitlementSource,
    startsAt: e.starts_at as string,
    expiresAt: (e.expires_at as string | null) ?? undefined,
    metadata: (e.metadata as Record<string, unknown>) ?? {},
  }));
}

export async function getActiveBudget(supabase: SupabaseClient, organizationId: string) {
  const now = nowIso();
  const { data } = await supabase
    .from('studio_world_production_budgets')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .lte('period_start', now)
    .gt('period_end', now)
    .order('period_start', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    periodType: data.period_type as 'monthly',
    periodStart: data.period_start as string,
    periodEnd: data.period_end as string,
    softLimit: data.soft_limit != null ? Number(data.soft_limit) : undefined,
    hardLimit: data.hard_limit != null ? Number(data.hard_limit) : undefined,
    currency: data.currency as string,
    status: data.status as ProductionBudget['status'],
  };
}

export async function getUsageTotalsForBillingOwner(
  supabase: SupabaseClient,
  billingOwnerId: string,
  periodStart: string,
  periodEnd: string
) {
  const { data: events } = await supabase
    .from('studio_world_production_usage_events')
    .select('estimated_cost, actual_cost, status')
    .eq('billing_owner_id', billingOwnerId)
    .gte('created_at', periodStart)
    .lt('created_at', periodEnd);

  const { data: reservations } = await supabase
    .from('studio_world_production_cost_reservations')
    .select('estimated_cost, status')
    .eq('billing_owner_id', billingOwnerId)
    .eq('status', 'pending');

  const actual = sumUsageCosts(
    (events ?? []).map((e) => ({
      estimatedCost: Number(e.estimated_cost),
      actualCost: e.actual_cost != null ? Number(e.actual_cost) : undefined,
      status: e.status as UsageEventStatus,
    }))
  );
  const reserved = sumReservationCosts(
    (reservations ?? []).map((r) => ({
      estimatedCost: Number(r.estimated_cost),
      status: r.status as ReservationStatus,
    }))
  );
  return { actual, reserved };
}

export async function getProductionPolicy(supabase: SupabaseClient, organizationId: string) {
  const { data } = await supabase
    .from('studio_world_production_policies')
    .select('policy')
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .maybeSingle();
  return (data?.policy as Record<string, unknown> | undefined) ?? null;
}

export async function recordAuditEvent(
  supabase: SupabaseClient,
  input: {
    actorEmail?: string;
    organizationId?: string;
    eventType: string;
    targetType?: string;
    targetId?: string;
    metadata?: Record<string, unknown>;
  }
) {
  await supabase.from('studio_world_production_audit_events').insert({
    actor_email: input.actorEmail,
    organization_id: input.organizationId,
    event_type: input.eventType,
    target_type: input.targetType,
    target_id: input.targetId,
    metadata: input.metadata ?? {},
  });
}

export async function evaluateGovernanceForRequest(
  supabase: SupabaseClient,
  request: ProductionGovernanceRequest
): Promise<ProductionGovernanceResult & { organizationSlug?: string }> {
  const org = await getOrganizationBySlug(supabase, request.context.organizationSlug);
  if (!org) {
    return {
      allowed: false,
      decision: 'BLOCKED_PERMISSION',
      billingOwner: {
        billingOwnerType: 'organization',
        billingOwnerId: request.context.organizationId,
        organizationSlug: request.context.organizationSlug,
      },
      message: 'Organization not found',
    };
  }

  const membership = await getMembership(supabase, org.id, request.context.operatorEmail);
  const entitlements = await listEntitlements(supabase, org.id);
  const budget = await getActiveBudget(supabase, org.id);
  const billingOwner = resolveBillingOwner({ organization: org });
  const bounds = budget
    ? { start: budget.periodStart, end: budget.periodEnd }
    : monthBounds();
  const totals = await getUsageTotalsForBillingOwner(supabase, billingOwner.billingOwnerId, bounds.start, bounds.end);
  const policy = await getProductionPolicy(supabase, org.id);

  const result = evaluateProductionGovernance({
    request,
    organization: org,
    membership,
    entitlements,
    budget,
    actualUsage: totals.actual,
    reservedUsage: totals.reserved,
    policy: policy as never,
  });

  await recordAuditEvent(supabase, {
    actorEmail: request.context.operatorEmail,
    organizationId: org.id,
    eventType: 'BILLING_OWNER_RESOLVED',
    metadata: {
      billingOwnerId: result.billingOwner.billingOwnerId,
      decision: result.decision,
      operationType: request.operationType,
      simulate: request.simulate ?? false,
    },
  });

  if (result.decision === 'BLOCKED_BUDGET') {
    await recordAuditEvent(supabase, {
      actorEmail: request.context.operatorEmail,
      organizationId: org.id,
      eventType: 'PRODUCTION_BLOCKED',
      metadata: { reason: 'budget', estimatedCost: request.estimatedCost },
    });
  }

  return { ...result, organizationSlug: org.slug };
}

export async function createCostReservation(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    billingOwnerId: string;
    idempotencyKey: string;
    estimatedCost: number;
    operationType: string;
    provider: string;
    model?: string;
    metadata?: Record<string, unknown>;
  }
) {
  const { data: existing } = await supabase
    .from('studio_world_production_cost_reservations')
    .select('*')
    .eq('idempotency_key', input.idempotencyKey)
    .maybeSingle();
  if (existing) return existing;

  const { data, error } = await supabase
    .from('studio_world_production_cost_reservations')
    .insert({
      organization_id: input.organizationId,
      billing_owner_id: input.billingOwnerId,
      idempotency_key: input.idempotencyKey,
      estimated_cost: input.estimatedCost,
      operation_type: input.operationType,
      provider: input.provider,
      model: input.model,
      status: 'pending',
      metadata: input.metadata ?? {},
      updated_at: nowIso(),
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function appendUsageEvent(
  supabase: SupabaseClient,
  input: {
    idempotencyKey?: string;
    operatorUserId: string;
    organizationId: string;
    billingOwnerId: string;
    workspaceId?: string;
    clientId?: string;
    projectId?: string;
    campaignId?: string;
    shotId?: string;
    provider: string;
    model?: string;
    operationType: string;
    estimatedCost: number;
    actualCost?: number;
    costSource: string;
    reservationId?: string;
    status: string;
    metadata?: Record<string, unknown>;
  }
) {
  if (input.idempotencyKey) {
    const { data: existing } = await supabase
      .from('studio_world_production_usage_events')
      .select('id')
      .eq('idempotency_key', input.idempotencyKey)
      .maybeSingle();
    if (existing) return existing;
  }

  const { data, error } = await supabase
    .from('studio_world_production_usage_events')
    .insert({
      idempotency_key: input.idempotencyKey,
      operator_user_id: input.operatorUserId,
      organization_id: input.organizationId,
      workspace_id: input.workspaceId,
      client_id: input.clientId,
      project_id: input.projectId,
      campaign_id: input.campaignId,
      shot_id: input.shotId,
      billing_owner_type: 'organization',
      billing_owner_id: input.billingOwnerId,
      provider: input.provider,
      model: input.model,
      operation_type: input.operationType,
      estimated_cost: input.estimatedCost,
      actual_cost: input.actualCost,
      cost_source: input.costSource,
      reservation_id: input.reservationId,
      status: input.status,
      metadata: input.metadata ?? {},
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function reconcileReservation(
  supabase: SupabaseClient,
  reservationId: string,
  outcome: 'completed' | 'released' | 'failed',
  actualCost?: number,
  usageEventId?: string
) {
  await supabase
    .from('studio_world_production_cost_reservations')
    .update({
      status: outcome,
      actual_cost: actualCost,
      usage_event_id: usageEventId,
      updated_at: nowIso(),
    })
    .eq('id', reservationId);

  await recordAuditEvent(supabase, {
    eventType: 'USAGE_RECONCILED',
    targetType: 'reservation',
    targetId: reservationId,
    metadata: { outcome, actualCost },
  });
}

export async function simulateProductionOperation(
  supabase: SupabaseClient,
  request: ProductionGovernanceRequest & { failProvider?: boolean }
): Promise<{
  governance: ProductionGovernanceResult;
  reservationId?: string;
  usageEventId?: string;
}> {
  const governance = await evaluateGovernanceForRequest(supabase, { ...request, simulate: true });
  if (!governance.allowed) {
    return { governance };
  }

  const org = await getOrganizationBySlug(supabase, request.context.organizationSlug);
  if (!org) return { governance };

  const idempotencyKey =
    request.idempotencyKey ??
    `sim-${request.context.operatorEmail}-${request.operationType}-${Date.now()}`;

  const reservation = await createCostReservation(supabase, {
    organizationId: org.id,
    billingOwnerId: governance.billingOwner.billingOwnerId,
    idempotencyKey,
    estimatedCost: request.estimatedCost,
    operationType: request.operationType,
    provider: request.provider,
    model: request.model,
    metadata: { simulate: true },
  });

  if (request.failProvider) {
    await reconcileReservation(supabase, reservation.id as string, 'released');
    await appendUsageEvent(supabase, {
      idempotencyKey: `${idempotencyKey}-usage`,
      operatorUserId: request.context.operatorUserId,
      organizationId: org.id,
      billingOwnerId: governance.billingOwner.billingOwnerId,
      provider: request.provider,
      model: request.model,
      operationType: request.operationType,
      estimatedCost: request.estimatedCost,
      costSource: 'INTERNAL_ESTIMATE',
      reservationId: reservation.id as string,
      status: 'failed',
      metadata: { simulate: true, providerFailed: true },
    });
    return {
      governance,
      reservationId: reservation.id as string,
    };
  }

  const usage = await appendUsageEvent(supabase, {
    idempotencyKey: `${idempotencyKey}-usage`,
    operatorUserId: request.context.operatorUserId,
    organizationId: org.id,
    billingOwnerId: governance.billingOwner.billingOwnerId,
    workspaceId: request.context.workspaceId,
    clientId: request.context.clientId,
    projectId: request.context.projectId,
    campaignId: request.context.campaignId,
    shotId: request.context.shotId,
    provider: request.provider,
    model: request.model,
    operationType: request.operationType,
    estimatedCost: request.estimatedCost,
    actualCost: request.estimatedCost,
    costSource: 'INTERNAL_ESTIMATE',
    reservationId: reservation.id as string,
    status: 'completed',
    metadata: { simulate: true },
  });

  await reconcileReservation(
    supabase,
    reservation.id as string,
    'completed',
    request.estimatedCost,
    usage.id as string
  );

  return {
    governance,
    reservationId: reservation.id as string,
    usageEventId: usage.id as string,
  };
}

export async function seedGovernanceFixtures(supabase: SupabaseClient) {
  const orgs = [
    {
      slug: 'frontal-slayer',
      name: 'Frontal Slayer (Owner Organization)',
      organization_type: 'OWNER',
    },
    {
      slug: 'founding-partner-agency',
      name: 'Founding Partner Agency',
      organization_type: 'AGENCY',
    },
    {
      slug: 'org-c-inaccessible',
      name: 'Organization C',
      organization_type: 'PARTNER',
    },
  ];

  const orgIds: Record<string, string> = {};
  for (const o of orgs) {
    const { data } = await supabase
      .from('studio_world_organizations')
      .upsert({ ...o, status: 'active', updated_at: nowIso() }, { onConflict: 'slug' })
      .select('id, slug')
      .single();
    orgIds[o.slug] = data!.id as string;
  }

  const memberships = [
    { org: 'frontal-slayer', email: 'user-b@collaborator.test', role: 'PRODUCTION_DIRECTOR' },
    { org: 'founding-partner-agency', email: 'user-b@collaborator.test', role: 'OWNER' },
  ];
  for (const m of memberships) {
    await supabase.from('studio_world_organization_memberships').upsert(
      {
        organization_id: orgIds[m.org],
        user_email: m.email,
        role: m.role,
        status: 'active',
        updated_at: nowIso(),
      },
      { onConflict: 'organization_id,user_email' }
    );
  }

  const ownerEntitlements = [
    'PLATFORM_ACCESS',
    'PRODUCTION_ACCESS',
    'IMAGE_GENERATION',
    'VIDEO_GENERATION',
    'CAMPAIGN_MANAGEMENT',
  ];
  for (const key of ownerEntitlements) {
    await supabase.from('studio_world_entitlements').upsert(
      {
        organization_id: orgIds['frontal-slayer'],
        entitlement_key: key,
        status: 'active',
        source: 'SYSTEM',
        updated_at: nowIso(),
      },
      { onConflict: 'organization_id,entitlement_key' }
    );
  }

  const agencyEntitlements = [
    { key: 'PLATFORM_ACCESS', source: 'FOUNDING_PARTNER', meta: { billingModel: 'complimentary_platform' } },
    { key: 'PRODUCTION_ACCESS', source: 'FOUNDING_PARTNER', meta: { billingModel: 'metered_production' } },
    { key: 'IMAGE_GENERATION', source: 'FOUNDING_PARTNER', meta: {} },
    { key: 'COMMERCIAL_USE', source: 'FOUNDING_PARTNER', meta: {} },
  ];
  for (const e of agencyEntitlements) {
    await supabase.from('studio_world_entitlements').upsert(
      {
        organization_id: orgIds['founding-partner-agency'],
        entitlement_key: e.key,
        status: 'active',
        source: e.source,
        metadata: e.meta,
        updated_at: nowIso(),
      },
      { onConflict: 'organization_id,entitlement_key' }
    );
  }

  const { start, end } = monthBounds();
  await supabase.from('studio_world_production_budgets').delete().eq('organization_id', orgIds['founding-partner-agency']);
  await supabase.from('studio_world_production_budgets').insert({
    organization_id: orgIds['founding-partner-agency'],
    period_type: 'monthly',
    period_start: start,
    period_end: end,
    soft_limit: 240,
    hard_limit: 300,
    currency: 'USD',
    status: 'active',
  });

  await supabase.from('studio_world_clients').upsert(
    {
      organization_id: orgIds['founding-partner-agency'],
      client_key: 'client-xyz',
      name: 'Client XYZ',
      status: 'active',
      updated_at: nowIso(),
    },
    { onConflict: 'organization_id,client_key' }
  );

  await recordAuditEvent(supabase, {
    eventType: 'ORGANIZATION_CREATED',
    organizationId: orgIds['frontal-slayer'],
    metadata: { seed: true },
  });

  return { orgIds };
}
