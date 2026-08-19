/**
 * Live Supabase golden path — Nashville → Dallas synthetic QA (real persistence).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, afterAll } from 'vitest';
import { projectCarrierLoadResult } from './carrierLoadProjection';
import type { LoadBoardPublication } from './freightTypes';

const url = process.env.AIO_STAGING_SUPABASE_URL ?? process.env.VITE_AIO_SUPABASE_URL;
const anonKey = process.env.AIO_STAGING_SUPABASE_ANON_KEY ?? process.env.VITE_AIO_SUPABASE_ANON_KEY;
const serviceKey = process.env.AIO_SUPABASE_SERVICE_ROLE_KEY;

const hasLive = Boolean(url && anonKey && serviceKey);

const cleanup: {
  orgIds: string[];
  requestIds: string[];
  quoteIds: string[];
  loadIds: string[];
} = { orgIds: [], requestIds: [], quoteIds: [], loadIds: [] };

async function adminClient(): Promise<SupabaseClient> {
  return createClient(url!, serviceKey!, { auth: { persistSession: false } });
}

describe.skipIf(!hasLive)('AIO freight live golden path — Nashville → Dallas', () => {
  let shipperOrgId = '';
  let brokerOrgId = '';
  let requestId = '';
  let quoteId = '';
  let loadId = '';

  it('creates synthetic QA org + shipment request through quote', async () => {
    const admin = await adminClient();
    const laneDate = '2026-10-15';
    const deliveryDate = '2026-10-17';

    const { data: shipperOrg, error: orgErr } = await admin
      .from('aio_organizations')
      .insert({ name: 'AIO QA Shipper LLC', organization_type: 'shipper' })
      .select('id')
      .single();
    expect(orgErr).toBeNull();
    shipperOrgId = shipperOrg!.id;
    cleanup.orgIds.push(shipperOrgId);

    const { data: brokerOrg } = await admin
      .from('aio_organizations')
      .select('id')
      .eq('organization_type', 'aio_internal')
      .limit(1)
      .maybeSingle();
    if (brokerOrg?.id) {
      brokerOrgId = brokerOrg.id;
    } else {
      const { data: createdBroker } = await admin
        .from('aio_organizations')
        .insert({ name: 'AIO QA Brokerage Internal', organization_type: 'aio_internal' })
        .select('id')
        .single();
      brokerOrgId = createdBroker!.id;
      cleanup.orgIds.push(brokerOrgId);
    }

    const { data: req, error: reqErr } = await admin
      .from('aio_shipment_requests')
      .insert({
        request_number: `SR-QA-${Date.now()}`,
        shipper_organization_id: shipperOrgId,
        status: 'under_review',
        pickup_city: 'Nashville',
        pickup_state: 'TN',
        pickup_date: laneDate,
        delivery_city: 'Dallas',
        delivery_state: 'TX',
        delivery_date: deliveryDate,
        equipment_type: 'Dry Van',
        trailer_length_ft: 53,
        weight: '38000 lb',
        commodity: 'Synthetic QA lane',
      })
      .select('id')
      .single();
    expect(reqErr).toBeNull();
    requestId = req!.id;
    cleanup.requestIds.push(requestId);

    const shipperRate = 320000;
    const carrierRate = 265000;
    const { data: quote, error: quoteErr } = await admin
      .from('aio_brokerage_freight_quotes')
      .insert({
        quote_number: `Q-QA-${Date.now()}`,
        shipment_request_id: requestId,
        shipper_organization_id: shipperOrgId,
        status: 'sent',
        freight_charge_minor: shipperRate,
      })
      .select('id')
      .single();
    expect(quoteErr).toBeNull();
    quoteId = quote!.id;
    cleanup.quoteIds.push(quoteId);

    await admin.from('aio_brokerage_quote_pricing_drafts').insert({
      quote_id: quoteId,
      request_id: requestId,
      shipper_rate_minor: shipperRate,
      target_carrier_rate_minor: carrierRate,
      estimated_margin_minor: shipperRate - carrierRate,
    });

    await admin.from('aio_brokerage_audit_events').insert({
      entity_type: 'shipment_request',
      entity_id: requestId,
      action: 'submitted',
      actor_type: 'shipper',
    });
  });

  it('accepts quote → load + financial split + publication', async () => {
    const admin = await adminClient();

    const { data: load, error: loadErr } = await admin
      .from('aio_dispatch_loads')
      .insert({
        organization_id: shipperOrgId,
        load_number: `LD-QA-${Date.now()}`,
        origin: 'Nashville, TN',
        destination: 'Dallas, TX',
        origin_city: 'Nashville',
        origin_state: 'TN',
        destination_city: 'Dallas',
        destination_state: 'TX',
        source_type: 'brokerage',
        shipper_organization_id: shipperOrgId,
        operational_status: 'open',
        equipment_type: 'Dry Van',
        pickup_date: '2026-10-15',
        delivery_date: '2026-10-17',
        financial_split_status: 'complete',
      })
      .select('id, load_number, origin_city, origin_state, destination_city, destination_state, operational_status, pickup_date, delivery_date, loaded_miles, deadhead_miles')
      .single();
    expect(loadErr).toBeNull();
    loadId = load!.id;
    cleanup.loadIds.push(loadId);

    await admin.from('aio_brokerage_load_financials').insert({
      load_id: loadId,
      shipper_rate_minor: 320000,
      carrier_rate_minor: 265000,
    });

    await admin.from('aio_load_board_publications').insert({
      load_id: loadId,
      publication_status: 'published',
      visibility_type: 'published',
      published_at: new Date().toISOString(),
    });

    await admin.from('aio_load_status_history').insert({
      load_id: loadId,
      to_status: 'published',
    });
  });

  it('enforces financial privacy on carrier projection', async () => {
    const admin = await adminClient();
    const { data: loadRow } = await admin.from('aio_dispatch_loads').select('*').eq('id', loadId).single();
    const { data: fin } = await admin.from('aio_brokerage_load_financials').select('*').eq('load_id', loadId).single();
    const { data: pub } = await admin.from('aio_load_board_publications').select('*').eq('load_id', loadId).single();

    const projected = projectCarrierLoadResult(
      {
        id: loadRow!.id,
        loadNumber: loadRow!.load_number,
        originCity: loadRow!.origin_city ?? 'Nashville',
        originState: loadRow!.origin_state ?? 'TN',
        destinationCity: loadRow!.destination_city ?? 'Dallas',
        destinationState: loadRow!.destination_state ?? 'TX',
        pickupDate: loadRow!.pickup_date,
        deliveryDate: loadRow!.delivery_date,
        loadedMiles: loadRow!.loaded_miles ?? 640,
        deadheadMiles: loadRow!.deadhead_miles ?? 0,
        operationalStatus: loadRow!.operational_status,
      } as never,
      pub as unknown as LoadBoardPublication,
      {
        confirmedShipperChargeMinor: fin!.shipper_rate_minor,
        confirmedCarrierPayMinor: fin!.carrier_rate_minor,
      } as never,
    );

    const json = JSON.stringify(projected);
    expect(json).not.toMatch(/shipper_rate|gross_margin|320000|55000/i);
    expect(json).not.toContain('internal');
  });

  it('records audit trail events for QA request', async () => {
    const admin = await adminClient();
    const { data: events } = await admin
      .from('aio_brokerage_audit_events')
      .select('action')
      .eq('entity_id', requestId);
    expect((events ?? []).length).toBeGreaterThan(0);
  });

  afterAll(async () => {
    if (!hasLive) return;
    const admin = await adminClient();
    for (const id of cleanup.loadIds) {
      await admin.from('aio_load_status_history').delete().eq('load_id', id);
      await admin.from('aio_load_board_publications').delete().eq('load_id', id);
      await admin.from('aio_brokerage_load_financials').delete().eq('load_id', id);
      await admin.from('aio_brokerage_bookkeeping_handoffs').delete().eq('source_id', id);
      await admin.from('aio_dispatch_loads').delete().eq('id', id);
    }
    for (const id of cleanup.quoteIds) {
      await admin.from('aio_brokerage_quote_pricing_drafts').delete().eq('quote_id', id);
      await admin.from('aio_brokerage_freight_quotes').delete().eq('id', id);
    }
    for (const id of cleanup.requestIds) {
      await admin.from('aio_brokerage_audit_events').delete().eq('entity_id', id);
      await admin.from('aio_shipment_requests').delete().eq('id', id);
    }
    for (const id of cleanup.orgIds) {
      await admin.from('aio_organizations').delete().eq('id', id);
    }
  });
});
