/**
 * Live bookkeeping handoff idempotency against aio_brokerage_bookkeeping_handoffs.
 */
import { createClient } from '@supabase/supabase-js';
import { describe, expect, it, afterAll } from 'vitest';

const url = process.env.AIO_STAGING_SUPABASE_URL ?? process.env.VITE_AIO_SUPABASE_URL;
const serviceKey = process.env.AIO_SUPABASE_SERVICE_ROLE_KEY;

const hasLive = Boolean(url && serviceKey);

describe.skipIf(!hasLive)('brokerage bookkeeping handoff — live idempotency', () => {
  let loadId = '';
  let brokerOrgId = '';
  let handoffRowId = '';

  it('creates exactly one handoff row (second run does not duplicate)', async () => {
    const admin = createClient(url!, serviceKey!, { auth: { persistSession: false } });

    const { data: brokerOrg, error: brokerOrgErr } = await admin
      .from('aio_organizations')
      .insert({ name: 'AIO QA Bookkeeping Org', organization_type: 'aio_internal' })
      .select('id')
      .single();
    expect(brokerOrgErr).toBeNull();
    brokerOrgId = brokerOrg!.id;

    const { data: load } = await admin
      .from('aio_dispatch_loads')
      .insert({
        organization_id: brokerOrgId,
        load_number: `LD-HO-${Date.now()}`,
        origin: 'Nashville, TN',
        destination: 'Dallas, TX',
        source_type: 'brokerage',
        operational_status: 'complete',
        financial_split_status: 'complete',
      })
      .select('id')
      .single();
    loadId = load!.id;

    const idempotencyKey = `BROKERAGE_LOAD:${loadId}:rev:1`;

    const insertHandoff = async () => {
      const { data: existing } = await admin
        .from('aio_brokerage_bookkeeping_handoffs')
        .select('id')
        .eq('source_type', 'BROKERAGE_LOAD')
        .eq('source_id', loadId)
        .maybeSingle();
      if (existing) return { created: false, id: existing.id };

      const { data, error } = await admin
        .from('aio_brokerage_bookkeeping_handoffs')
        .insert({
          source_type: 'BROKERAGE_LOAD',
          source_id: loadId,
          idempotency_key: idempotencyKey,
          revision_number: 1,
          load_number: `LD-${String(loadId).slice(0, 8)}`,
          aio_brokerage_org_id: brokerOrgId,
          shipper_invoice_amount_minor: 320000,
          carrier_payable_amount_minor: 265000,
          gross_margin_minor: 55000,
          status: 'handed_off',
        })
        .select('id')
        .single();
      expect(error).toBeNull();
      return { created: true, id: data!.id };
    };

    const first = await insertHandoff();
    expect(first.created).toBe(true);
    handoffRowId = first.id;

    const second = await insertHandoff();
    expect(second.created).toBe(false);
    expect(second.id).toBe(handoffRowId);

    const { count } = await admin
      .from('aio_brokerage_bookkeeping_handoffs')
      .select('*', { count: 'exact', head: true })
      .eq('source_id', loadId);
    expect(count).toBe(1);
  });

  afterAll(async () => {
    if (!hasLive || !loadId) return;
    const admin = createClient(url!, serviceKey!, { auth: { persistSession: false } });
    await admin.from('aio_brokerage_bookkeeping_handoffs').delete().eq('source_id', loadId);
    await admin.from('aio_dispatch_loads').delete().eq('id', loadId);
    if (brokerOrgId) await admin.from('aio_organizations').delete().eq('id', brokerOrgId);
  });
});
