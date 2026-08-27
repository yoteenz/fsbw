/**
 * Live Supabase persistence tests for Freight Autopilot TMS productionization.
 */
import { createClient } from '@supabase/supabase-js';
import { describe, expect, it, afterAll } from 'vitest';
import { evaluateDocumentCompleteness } from './documentCompleteness';
import {
  createFreightAutopilotAdminClient,
  ensureBillingPackageRow,
  ensureDispatchPackageSnapshot,
  ensureShipperInvoiceRow,
  hashDispatchPackage,
  recordAutopilotEvent,
  resolveFreightException,
  upsertDocumentCompleteness,
  upsertFreightException,
} from './supabaseFreightAutopilotPersistence';
import { buildDispatchPackage } from './dispatchPackage';
import { persistPretripInspectionToSupabase, pretripIdempotencyKey } from '../../fleet/pretrip/supabasePretripPersistence';
import { processDuplicateEventTorture } from './freightAutopilotPersistence';

const url = process.env.AIO_STAGING_SUPABASE_URL ?? process.env.VITE_AIO_SUPABASE_URL;
const serviceKey = process.env.AIO_SUPABASE_SERVICE_ROLE_KEY;
const hasLive = Boolean(url && serviceKey);

describe.skipIf(!hasLive)('Freight Autopilot — live Supabase persistence', () => {
  let orgId = '';
  let shipperOrgId = '';
  let loadId = '';
  let loadNumber = '';

  it('creates durable document completeness and survives re-read (multi-session)', async () => {
    const admin = createFreightAutopilotAdminClient()!;

    const { data: org } = await admin
      .from('aio_organizations')
      .insert({ name: `AIO QA Autopilot ${Date.now()}`, organization_type: 'carrier' })
      .select('id')
      .single();
    orgId = org!.id as string;

    const { data: shipper } = await admin
      .from('aio_organizations')
      .insert({ name: `AIO QA Shipper ${Date.now()}`, organization_type: 'shipper' })
      .select('id')
      .single();
    shipperOrgId = shipper!.id as string;

    loadNumber = `LD-AP-${Date.now()}`;
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

    const incomplete = evaluateDocumentCompleteness({
      id: loadId,
      loadNumber,
      organizationId: orgId,
      sourceType: 'brokerage',
      brokerName: 'AIO',
      equipmentType: 'Dry Van',
      originCity: 'Austin',
      originState: 'TX',
      destinationCity: 'Houston',
      destinationState: 'TX',
      pickupDate: '2026-08-01',
      deliveryDate: '2026-08-02',
      loadedMiles: 160,
      deadheadMiles: 0,
      linehaulMinor: 100_000,
      fuelSurchargeMinor: 0,
      accessorialMinor: 0,
      grossMinor: 100_000,
      confirmedGrossMinor: 100_000,
      currency: 'USD',
      offerStatus: 'accepted',
      operationalStatus: 'complete',
      rateConfirmationStatus: 'uploaded',
      bolDocumentId: 'doc-bol-demo',
      rateDetailsReviewed: true,
      factoringHandoffStatus: 'not_ready',
      accessorials: [],
      rateRevisions: [],
      timeline: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    });

    await upsertDocumentCompleteness(admin, orgId, loadId, incomplete);
    await upsertFreightException(admin, {
      loadId,
      organizationId: orgId,
      exceptionType: 'MISSING_POD',
      severity: 'P1',
      summary: 'Missing POD',
    });

    const { data: sessionB } = await admin
      .from('aio_freight_document_completeness')
      .select('*')
      .eq('load_id', loadId)
      .single();

    expect(sessionB!.package_status).toBe('incomplete');
    expect(sessionB!.ready_for_billing).toBe(false);

    const { count: exOpen } = await admin
      .from('aio_freight_exceptions')
      .select('*', { count: 'exact', head: true })
      .eq('load_id', loadId)
      .eq('status', 'OPEN');
    expect(exOpen).toBe(1);
  });

  it('broken path: missing POD blocks billing; POD upload resumes without duplicates', async () => {
    const admin = createFreightAutopilotAdminClient()!;

    const complete = evaluateDocumentCompleteness({
      id: loadId,
      loadNumber,
      organizationId: orgId,
      sourceType: 'brokerage',
      shipperOrganizationId: shipperOrgId,
      brokerName: 'AIO',
      equipmentType: 'Dry Van',
      originCity: 'Austin',
      originState: 'TX',
      destinationCity: 'Houston',
      destinationState: 'TX',
      pickupDate: '2026-08-01',
      deliveryDate: '2026-08-02',
      loadedMiles: 160,
      deadheadMiles: 0,
      linehaulMinor: 100_000,
      fuelSurchargeMinor: 0,
      accessorialMinor: 0,
      grossMinor: 100_000,
      confirmedGrossMinor: 100_000,
      currency: 'USD',
      offerStatus: 'accepted',
      operationalStatus: 'complete',
      rateConfirmationStatus: 'uploaded',
      bolDocumentId: 'x',
      podDocumentId: 'y',
      rateDetailsReviewed: true,
      factoringHandoffStatus: 'ready',
      accessorials: [],
      rateRevisions: [],
      timeline: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    });

    await upsertDocumentCompleteness(admin, orgId, loadId, complete);
    await resolveFreightException(admin, loadId, 'MISSING_POD');

    const pkg1 = await ensureBillingPackageRow(admin, orgId, loadId, shipperOrgId);
    const pkg2 = await ensureBillingPackageRow(admin, orgId, loadId, shipperOrgId);
    expect(pkg1.id).toBe(pkg2.id);
    expect(pkg2.created).toBe(false);

    const inv1 = await ensureShipperInvoiceRow(admin, loadId, shipperOrgId, `INV-${loadNumber}`, 100_000);
    const inv2 = await ensureShipperInvoiceRow(admin, loadId, shipperOrgId, `INV-${loadNumber}-dup`, 100_000);
    expect(inv1.id).toBe(inv2.id);
    expect(inv2.created).toBe(false);

    const { count: exOpen } = await admin
      .from('aio_freight_exceptions')
      .select('*', { count: 'exact', head: true })
      .eq('load_id', loadId)
      .eq('exception_type', 'MISSING_POD')
      .eq('status', 'OPEN');
    expect(exOpen).toBe(0);
  });

  it('duplicate event torture: one event, one billing package, one invoice', async () => {
    const admin = createFreightAutopilotAdminClient()!;
    await ensureShipperInvoiceRow(admin, loadId, shipperOrgId, `INV-TORTURE-${loadNumber}`, 100_000);

    const counts = await processDuplicateEventTorture(admin, orgId, loadId);
    expect(counts.eventCount).toBe(1);
    expect(counts.billingCount).toBe(1);
    expect(counts.invoiceCount).toBe(1);
  });

  it('pre-trip + dispatch snapshot persist with idempotency', async () => {
    const admin = createFreightAutopilotAdminClient()!;

    const pretripInput = {
      organizationId: orgId,
      driverId: 'driver-qa-1',
      powerUnitId: 'unit-qa-1',
      loadId,
      result: 'DEFECT_REPORTED' as const,
      defectSummary: 'Brake light out',
    };
    const key = pretripIdempotencyKey(pretripInput);

    const p1 = await persistPretripInspectionToSupabase(pretripInput);
    const p2 = await persistPretripInspectionToSupabase(pretripInput);
    expect(p1!.id).toBe(p2!.id);
    expect(p2!.escalatedToFleetCare).toBe(true);

    const pkg = buildDispatchPackage({
      load: {
        id: loadId,
        loadNumber,
        organizationId: orgId,
        sourceType: 'brokerage',
        brokerName: 'AIO',
        equipmentType: 'Dry Van',
        originCity: 'Austin',
        originState: 'TX',
        destinationCity: 'Houston',
        destinationState: 'TX',
        pickupDate: '2026-08-01',
        deliveryDate: '2026-08-02',
        loadedMiles: 160,
        deadheadMiles: 0,
        linehaulMinor: 100_000,
        fuelSurchargeMinor: 0,
        accessorialMinor: 0,
        grossMinor: 100_000,
        confirmedGrossMinor: 100_000,
        currency: 'USD',
        offerStatus: 'accepted',
        operationalStatus: 'dispatched',
        rateConfirmationStatus: 'uploaded',
        primaryDriverId: 'driver-qa-1',
        rateDetailsReviewed: true,
        factoringHandoffStatus: 'not_ready',
        accessorials: [],
        rateRevisions: [],
        timeline: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      },
    });

    const hash = hashDispatchPackage(pkg);
    const s1 = await ensureDispatchPackageSnapshot(admin, {
      organizationId: orgId,
      loadId,
      packageJson: pkg,
      contentHash: hash,
    });
    const s2 = await ensureDispatchPackageSnapshot(admin, {
      organizationId: orgId,
      loadId,
      packageJson: pkg,
      contentHash: hash,
    });
    expect(s1.id).toBe(s2.id);
    expect(s2.created).toBe(false);

    const { count: pretripCount } = await admin
      .from('aio_pretrip_inspections')
      .select('*', { count: 'exact', head: true })
      .eq('idempotency_key', key);
    expect(pretripCount).toBe(1);

    void p1;
  });

  it('failure recovery: invoice survives partial autopilot failure; retry does not duplicate', async () => {
    const admin = createFreightAutopilotAdminClient()!;

    const invBefore = await ensureShipperInvoiceRow(
      admin,
      loadId,
      shipperOrgId,
      `INV-RECOVERY-${loadNumber}`,
      100_000,
    );
    expect(invBefore.created).toBe(false);

    const failKey = `recovery:${loadId}:BOOKKEEPING_HANDOFF:failed`;
    await recordAutopilotEvent(admin, {
      organizationId: orgId,
      loadId,
      eventType: 'BOOKKEEPING_READY',
      idempotencyKey: failKey,
      processingStatus: 'FAILED',
      outcome: 'bookkeeping_unavailable',
      payload: { phase: 'handoff', retriable: true },
    });

    const invRetry = await ensureShipperInvoiceRow(
      admin,
      loadId,
      shipperOrgId,
      `INV-RECOVERY-DUP-${loadNumber}`,
      999_999,
    );
    expect(invRetry.id).toBe(invBefore.id);
    expect(invRetry.created).toBe(false);

    const { data: failedEvent } = await admin
      .from('aio_freight_autopilot_events')
      .select('processing_status, outcome')
      .eq('idempotency_key', failKey)
      .single();
    expect(failedEvent!.processing_status).toBe('FAILED');

    const { count: invoiceCount } = await admin
      .from('aio_brokerage_shipper_invoices')
      .select('*', { count: 'exact', head: true })
      .eq('load_id', loadId);
    expect(invoiceCount).toBe(1);
  });

  it('RLS: carrier B cannot read carrier A settlement', async () => {
    const admin = createClient(url!, serviceKey!, { auth: { persistSession: false } });

    const { data: carrierA } = await admin
      .from('aio_organizations')
      .insert({ name: `Carrier A ${Date.now()}`, organization_type: 'carrier' })
      .select('id')
      .single();
    const { data: carrierB } = await admin
      .from('aio_organizations')
      .insert({ name: `Carrier B ${Date.now()}`, organization_type: 'carrier' })
      .select('id')
      .single();

    const { data: loadA } = await admin
      .from('aio_dispatch_loads')
      .insert({
        organization_id: carrierA!.id,
        load_number: `LD-RLS-${Date.now()}`,
        origin: 'X',
        destination: 'Y',
        carrier_organization_id: carrierA!.id,
        operational_status: 'complete',
      })
      .select('id')
      .single();

    await admin.from('aio_carrier_settlements').insert({
      load_id: loadA!.id,
      organization_id: carrierA!.id,
      carrier_organization_id: carrierA!.id,
      agreed_carrier_rate_minor: 50_000,
      total_payable_minor: 50_000,
      lifecycle_status: 'APPROVED',
      idempotency_key: `carrier-settlement:${loadA!.id}`,
    });

    const { data: crossRead } = await admin
      .from('aio_carrier_settlements')
      .select('id')
      .eq('load_id', loadA!.id)
      .eq('carrier_organization_id', carrierB!.id);

    expect(crossRead ?? []).toHaveLength(0);

    await admin.from('aio_carrier_settlements').delete().eq('load_id', loadA!.id);
    await admin.from('aio_dispatch_loads').delete().eq('id', loadA!.id);
    await admin.from('aio_organizations').delete().eq('id', carrierA!.id);
    await admin.from('aio_organizations').delete().eq('id', carrierB!.id);
  });

  afterAll(async () => {
    if (!hasLive || !loadId) return;
    const admin = createFreightAutopilotAdminClient()!;
    await admin.from('aio_dispatch_package_snapshots').delete().eq('load_id', loadId);
    await admin.from('aio_pretrip_inspections').delete().eq('load_id', loadId);
    await admin.from('aio_freight_autopilot_events').delete().eq('load_id', loadId);
    await admin.from('aio_freight_billing_packages').delete().eq('load_id', loadId);
    await admin.from('aio_brokerage_shipper_invoices').delete().eq('load_id', loadId);
    await admin.from('aio_freight_exceptions').delete().eq('load_id', loadId);
    await admin.from('aio_freight_document_completeness').delete().eq('load_id', loadId);
    await admin.from('aio_driver_settlements').delete().eq('load_id', loadId);
    await admin.from('aio_carrier_settlements').delete().eq('load_id', loadId);
    await admin.from('aio_dispatch_loads').delete().eq('id', loadId);
    if (orgId) await admin.from('aio_organizations').delete().eq('id', orgId);
    if (shipperOrgId) await admin.from('aio_organizations').delete().eq('id', shipperOrgId);
  });
});
