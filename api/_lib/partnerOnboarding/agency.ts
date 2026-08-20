/**
 * Partner agency organization creation + Founding Partner entitlements.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { FOUNDING_PARTNER_ENTITLEMENT_KEYS } from '../../../src/studio-os-core/partner-onboarding/types.js';
import { recordAuditEvent } from '../productionGovernance/service.js';

function nowIso(): string {
  return new Date().toISOString();
}

function monthBounds(d = new Date()): { start: string; end: string } {
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
  return { start: start.toISOString(), end: end.toISOString() };
}

export async function createPartnerAgencyOrganization(
  supabase: SupabaseClient,
  input: {
    name: string;
    slug: string;
    ownerEmail: string;
    timezone?: string;
    currency?: string;
    monthlyHardLimit?: number;
    monthlySoftLimit?: number;
    foundingPartner?: boolean;
  }
): Promise<{ organizationId: string; slug: string }> {
  const { data: org, error: orgErr } = await supabase
    .from('studio_world_organizations')
    .upsert(
      {
        slug: input.slug,
        name: input.name,
        organization_type: 'AGENCY',
        status: 'active',
        metadata: {
          timezone: input.timezone ?? 'UTC',
          currency: input.currency ?? 'USD',
          foundingPartner: input.foundingPartner ?? true,
        },
        updated_at: nowIso(),
      },
      { onConflict: 'slug' }
    )
    .select('id, slug')
    .single();

  if (orgErr) throw orgErr;

  await supabase.from('studio_world_organization_memberships').upsert(
    {
      organization_id: org.id,
      user_email: input.ownerEmail.toLowerCase(),
      role: 'OWNER',
      status: 'active',
      updated_at: nowIso(),
    },
    { onConflict: 'organization_id,user_email' }
  );

  const entitlements = input.foundingPartner !== false ? FOUNDING_PARTNER_ENTITLEMENT_KEYS : ['PLATFORM_ACCESS', 'PRODUCTION_ACCESS'];
  for (const key of entitlements) {
    await supabase.from('studio_world_entitlements').upsert(
      {
        organization_id: org.id,
        entitlement_key: key,
        status: 'active',
        source: input.foundingPartner !== false ? 'FOUNDING_PARTNER' : 'SYSTEM',
        metadata:
          key === 'PLATFORM_ACCESS'
            ? { billingModel: 'complimentary_platform' }
            : key === 'PRODUCTION_ACCESS'
              ? { billingModel: 'metered_production' }
              : {},
        updated_at: nowIso(),
      },
      { onConflict: 'organization_id,entitlement_key' }
    );
  }

  const { start, end } = monthBounds();
  await supabase.from('studio_world_production_budgets').delete().eq('organization_id', org.id);
  await supabase.from('studio_world_production_budgets').insert({
    organization_id: org.id,
    period_type: 'monthly',
    period_start: start,
    period_end: end,
    soft_limit: input.monthlySoftLimit ?? 400,
    hard_limit: input.monthlyHardLimit ?? 500,
    currency: input.currency ?? 'USD',
    status: 'active',
  });

  await recordAuditEvent(supabase, {
    actorEmail: input.ownerEmail,
    organizationId: org.id as string,
    eventType: 'ORGANIZATION_CREATED',
    metadata: { slug: org.slug, type: 'AGENCY', foundingPartner: input.foundingPartner !== false },
  });

  return { organizationId: org.id as string, slug: org.slug as string };
}
