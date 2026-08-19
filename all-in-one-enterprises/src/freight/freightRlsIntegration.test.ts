/**
 * Live Supabase RLS integration tests — run only when AIO staging credentials are configured.
 * Set AIO_STAGING_SUPABASE_URL + AIO_STAGING_SUPABASE_ANON_KEY (+ role JWTs when available).
 */
import { createClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';

const url = process.env.AIO_STAGING_SUPABASE_URL ?? process.env.VITE_AIO_SUPABASE_URL;
const anonKey = process.env.AIO_STAGING_SUPABASE_ANON_KEY ?? process.env.VITE_AIO_SUPABASE_ANON_KEY;

const shipperAJwt = process.env.AIO_RLS_TEST_SHIPPER_A_JWT;
const shipperBJwt = process.env.AIO_RLS_TEST_SHIPPER_B_JWT;
const carrierAJwt = process.env.AIO_RLS_TEST_CARRIER_A_JWT;
const staffJwt = process.env.AIO_RLS_TEST_STAFF_JWT;

const hasLiveProject = Boolean(url && anonKey);
const hasRoleSessions = Boolean(shipperAJwt && shipperBJwt && carrierAJwt && staffJwt);

describe.skipIf(!hasLiveProject)('freight RLS — live Supabase', () => {
  it('unauthenticated user cannot read shipment requests', async () => {
    const client = createClient(url!, anonKey!);
    const { data, error } = await client.from('aio_shipment_requests').select('id').limit(1);
    expect(error ?? null).toBeTruthy();
    expect(data ?? []).toHaveLength(0);
  });

  it('unauthenticated user cannot read brokerage financials', async () => {
    const client = createClient(url!, anonKey!);
    const { data, error } = await client.from('aio_brokerage_load_financials').select('shipper_rate_minor').limit(1);
    expect(error ?? null).toBeTruthy();
    expect(data ?? []).toHaveLength(0);
  });

  it('unauthenticated user cannot read pricing drafts', async () => {
    const client = createClient(url!, anonKey!);
    const { data, error } = await client.from('aio_brokerage_quote_pricing_drafts').select('quote_id').limit(1);
    expect(error ?? null).toBeTruthy();
    expect(data ?? []).toHaveLength(0);
  });
});

describe.skipIf(!hasLiveProject || !hasRoleSessions)('freight RLS — role matrix', () => {
  it('carrier session cannot read shipper_rate from financials table', async () => {
    const client = createClient(url!, anonKey!, {
      global: { headers: { Authorization: `Bearer ${carrierAJwt}` } },
    });
    const { data } = await client.from('aio_brokerage_load_financials').select('shipper_rate_minor, carrier_rate_minor').limit(5);
    expect(data ?? []).toHaveLength(0);
  });

  it('shipper A cannot read shipper B shipment requests', async () => {
    const staff = createClient(url!, anonKey!, {
      global: { headers: { Authorization: `Bearer ${staffJwt}` } },
    });
    const { data: allRows } = await staff.from('aio_shipment_requests').select('id, shipper_organization_id').limit(20);
    const otherOrgRow = (allRows ?? []).find((r) => r.shipper_organization_id !== process.env.AIO_RLS_TEST_SHIPPER_A_ORG);
    if (!otherOrgRow) return;

    const shipperA = createClient(url!, anonKey!, {
      global: { headers: { Authorization: `Bearer ${shipperAJwt}` } },
    });
    const { data } = await shipperA
      .from('aio_shipment_requests')
      .select('id')
      .eq('id', otherOrgRow.id)
      .maybeSingle();
    expect(data).toBeNull();
  });

  it('shipper cannot read pricing drafts', async () => {
    const client = createClient(url!, anonKey!, {
      global: { headers: { Authorization: `Bearer ${shipperAJwt}` } },
    });
    const { data } = await client.from('aio_brokerage_quote_pricing_drafts').select('quote_id').limit(5);
    expect(data ?? []).toHaveLength(0);
  });

  it('staff can read internal financial split view', async () => {
    const client = createClient(url!, anonKey!, {
      global: { headers: { Authorization: `Bearer ${staffJwt}` } },
    });
    const { error } = await client.from('aio_brokerage_load_financials_internal').select('gross_margin_minor').limit(1);
    expect(error).toBeNull();
  });
});
