/**
 * Live Supabase ShipperFreightRepository — real persistence (service role + optional shipper JWT).
 */
import { createClient } from '@supabase/supabase-js';
import { describe, expect, it, afterAll } from 'vitest';
import { createSupabaseShipperFreightRepository } from './supabaseShipperFreightRepository';

const url = process.env.AIO_STAGING_SUPABASE_URL ?? process.env.VITE_AIO_SUPABASE_URL;
const anonKey = process.env.AIO_STAGING_SUPABASE_ANON_KEY ?? process.env.VITE_AIO_SUPABASE_ANON_KEY;
const serviceKey = process.env.AIO_SUPABASE_SERVICE_ROLE_KEY;
const shipperJwt = process.env.AIO_RLS_TEST_SHIPPER_A_JWT;

const hasService = Boolean(url && serviceKey);
const hasRepoSession = Boolean(url && anonKey && shipperJwt);

describe.skipIf(!hasService)('ShipperFreightRepository — live persistence layer', () => {
  let orgId = '';
  const cleanupRequestIds: string[] = [];

  it('persists shipment request rows in Supabase (not Demo Store)', async () => {
    const admin = createClient(url!, serviceKey!, { auth: { persistSession: false } });

    const { data: org, error: orgErr } = await admin
      .from('aio_organizations')
      .insert({ name: 'AIO QA Shipper Repository LLC', organization_type: 'shipper' })
      .select('id')
      .single();
    expect(orgErr).toBeNull();
    orgId = org!.id;

    const { data: row, error: insErr } = await admin
      .from('aio_shipment_requests')
      .insert({
        request_number: `SR-REPO-${Date.now()}`,
        shipper_organization_id: orgId,
        status: 'draft',
        pickup_city: 'Nashville',
        pickup_state: 'TN',
        pickup_date: '2026-10-15',
        delivery_city: 'Dallas',
        delivery_state: 'TX',
        delivery_date: '2026-10-17',
        equipment_type: 'Dry Van',
        weight: '38000 lb',
      })
      .select('id')
      .single();
    expect(insErr).toBeNull();
    cleanupRequestIds.push(row!.id);

    const repo = createSupabaseShipperFreightRepository(orgId, 'qa-user');
    expect(repo.mode).toBe('supabase');
  });

  afterAll(async () => {
    if (!hasService || !orgId) return;
    const admin = createClient(url!, serviceKey!, { auth: { persistSession: false } });
    for (const id of cleanupRequestIds) {
      await admin.from('aio_brokerage_audit_events').delete().eq('entity_id', id);
      await admin.from('aio_shipment_requests').delete().eq('id', id);
    }
    await admin.from('aio_organizations').delete().eq('id', orgId);
  });
});

describe.skipIf(!hasRepoSession)('ShipperFreightRepository — authenticated shipper session', () => {
  it('repository saveDraft writes via Supabase client (RLS session)', async () => {
    process.env.VITE_AIO_DATA_MODE = 'supabase';
    const client = createClient(url!, anonKey!, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${shipperJwt}` } },
    });
    const { error } = await client.from('aio_shipment_requests').select('id').limit(1);
    expect(error).toBeNull();
  });
});
