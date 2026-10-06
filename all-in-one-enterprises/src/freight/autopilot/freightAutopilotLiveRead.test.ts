/**
 * Live Supabase read path for Freight Autopilot panel — staff-authenticated RLS session.
 */
import { createClient } from '@supabase/supabase-js';
import { describe, expect, it, afterAll } from 'vitest';
import { createFreightAutopilotAdminClient } from './supabaseFreightAutopilotPersistence';
import { createSupabaseFreightAutopilotRepository } from './supabaseFreightAutopilotRepository';

const url = process.env.AIO_STAGING_SUPABASE_URL ?? process.env.VITE_AIO_SUPABASE_URL;
const anonKey = process.env.AIO_STAGING_SUPABASE_ANON_KEY ?? process.env.VITE_AIO_SUPABASE_ANON_KEY;
const serviceKey = process.env.AIO_SUPABASE_SERVICE_ROLE_KEY;
const staffJwt = process.env.AIO_RLS_TEST_STAFF_JWT;

const hasLive = Boolean(url && serviceKey);
const hasStaffSession = Boolean(url && anonKey && staffJwt);

describe.skipIf(!hasLive)('Freight Autopilot — live read path setup', () => {
  let orgId = '';
  let shipperOrgId = '';
  let loadId = '';
  let loadNumber = '';
  let staffUserId = '';

  it('seeds minimal persisted autopilot state for read validation', async () => {
    const admin = createFreightAutopilotAdminClient()!;

    const { data: org } = await admin
      .from('aio_organizations')
      .insert({ name: `AIO QA Autopilot Read ${Date.now()}`, organization_type: 'carrier' })
      .select('id')
      .single();
    orgId = org!.id as string;

    const { data: shipper } = await admin
      .from('aio_organizations')
      .insert({ name: `AIO QA Shipper Read ${Date.now()}`, organization_type: 'shipper' })
      .select('id')
      .single();
    shipperOrgId = shipper!.id as string;

    loadNumber = `LD-READ-${Date.now()}`;
    const { data: load } = await admin
      .from('aio_dispatch_loads')
      .insert({
        organization_id: orgId,
        load_number: loadNumber,
        origin: 'Austin, TX',
        destination: 'Houston, TX',
        source_type: 'brokerage',
        shipper_organization_id: shipperOrgId,
        operational_status: 'complete',
        financial_split_status: 'complete',
      })
      .select('id')
      .single();
    loadId = load!.id as string;

    await admin.from('aio_freight_document_completeness').upsert({
      load_id: loadId,
      organization_id: orgId,
      package_status: 'complete',
      requirements_json: [],
      missing_labels: [],
      ready_for_billing: true,
      ready_for_factoring: true,
      ready_for_settlement: true,
      computed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    await admin.from('aio_brokerage_shipper_invoices').insert({
      load_id: loadId,
      shipper_organization_id: shipperOrgId,
      invoice_number: `INV-READ-${loadNumber}`,
      base_freight_charge_minor: 100_000,
      total_minor: 100_000,
      balance_minor: 100_000,
      invoice_date: '2026-08-01',
      status: 'issued',
    });
  });

  describe.skipIf(!hasStaffSession)('staff session read path', () => {
    it('panel repository reflects persisted multi-session state under staff RLS', async () => {
      const admin = createFreightAutopilotAdminClient()!;
      const {
        data: { user: staffUser },
        error: staffLookupError,
      } = await admin.auth.getUser(staffJwt!);

      expect(staffLookupError).toBeNull();
      expect(staffUser?.id).toBeTruthy();
      staffUserId = staffUser!.id;

      const { error: membershipError } = await admin.from('aio_organization_memberships').insert([
        {
          organization_id: orgId,
          user_id: staffUserId,
          role: 'organization_member',
          status: 'active',
        },
        {
          organization_id: shipperOrgId,
          user_id: staffUserId,
          role: 'organization_member',
          status: 'active',
        },
      ]);
      expect(membershipError).toBeNull();

      const { data: fixtureMemberships, error: fixtureMembershipError } = await admin
        .from('aio_organization_memberships')
        .select('organization_id, user_id, status')
        .eq('user_id', staffUserId)
        .in('organization_id', [orgId, shipperOrgId]);

      expect(fixtureMembershipError).toBeNull();
      expect(fixtureMemberships ?? []).toHaveLength(2);
      expect((fixtureMemberships ?? []).every((row) => row.status === 'active')).toBe(true);

      const readClient = createClient(url!, anonKey!, {
        auth: { persistSession: false },
        global: { headers: { Authorization: `Bearer ${staffJwt}` } },
      });

      const { data: visibleLoad, error: visibleLoadError } = await readClient
        .from('aio_dispatch_loads')
        .select('id')
        .eq('id', loadId)
        .maybeSingle();

      expect(visibleLoadError).toBeNull();
      expect(visibleLoad?.id).toBe(loadId);

      const repo = createSupabaseFreightAutopilotRepository(readClient);
      const sessionA = await repo.getPanelData(loadId);
      expect(sessionA).toBeDefined();
      expect(sessionA!.documentCompleteness.readyForBilling).toBe(true);

      const sessionB = await repo.getPanelData(loadId);
      expect(sessionB!.state.steps.some((s) => s.key === 'invoice_ready' && s.status === 'complete')).toBe(true);
    });
  });

  afterAll(async () => {
    if (!hasLive || !loadId) return;
    const admin = createFreightAutopilotAdminClient()!;
    if (staffUserId && orgId && shipperOrgId) {
      await admin
        .from('aio_organization_memberships')
        .delete()
        .eq('user_id', staffUserId)
        .in('organization_id', [orgId, shipperOrgId]);
    }
    await admin.from('aio_brokerage_shipper_invoices').delete().eq('load_id', loadId);
    await admin.from('aio_freight_document_completeness').delete().eq('load_id', loadId);
    await admin.from('aio_dispatch_loads').delete().eq('id', loadId);
    if (orgId) await admin.from('aio_organizations').delete().eq('id', orgId);
    if (shipperOrgId) await admin.from('aio_organizations').delete().eq('id', shipperOrgId);
  });
});
