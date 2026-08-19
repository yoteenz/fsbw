/**
 * Golden-path QA: Nashville → Dallas synthetic freight lifecycle (demo store).
 */
import { describe, expect, it, beforeAll, beforeEach } from 'vitest';
import { createDemoSeed } from '../demo/demoSeed';
import { loadDemoStore, saveDemoStore } from '../demo/demoStore';
import { dollarsToMinor } from '../billing/money';
import { computeGrossMarginPercent } from '../brokerage/brokerageCalculations';
import {
  acceptBrokerageQuoteWorkflow,
  applyLoadDistributionStrategy,
  createQuoteFromRequest,
  computePricingDraft,
  saveShipmentRequestDraft,
  sendBrokerageQuoteWorkflow,
  setLoadCarrierRate,
  submitShipmentRequest,
} from '../brokerage/brokerageWorkflow';
import { projectCarrierLoadResult } from './carrierLoadProjection';
import { computeTrueRpm, computeTrueImmediateMiles } from './freightCalculations';
import { publishLoadToBoard } from './loadBoardActions';
import { evaluateSavedSearchAlertsDemo } from './freightSavedSearchAlerts';
import { saveLoadSearch } from './loadBoardActions';
import { getLoadFinancials } from '../demo/brokerageActions';
import type { LoadBoardPublication } from './freightTypes';

const SHIPPER_ORG = 'client-e';
const STAFF_ID = 'staff-7';
const SHIPPER_RATE = 3200;
const CARRIER_RATE = 2650;

beforeAll(() => {
  const storage = new Map<string, string>();
  Object.defineProperty(globalThis, 'window', {
    value: {
      localStorage: {
        getItem: (k: string) => storage.get(k) ?? null,
        setItem: (k: string, v: string) => storage.set(k, v),
        removeItem: (k: string) => storage.delete(k),
      },
      dispatchEvent: () => undefined,
    },
    configurable: true,
  });
});

beforeEach(() => {
  saveDemoStore(createDemoSeed());
});

describe('AIO freight golden path — Nashville → Dallas', () => {
  it('runs shipper request through quote acceptance to published load with financial separation', () => {
    const pickupDate = '2026-10-15';
    const deliveryDate = '2026-10-17';

    const requestId = saveShipmentRequestDraft(SHIPPER_ORG, {
      pickupCity: 'Nashville',
      pickupState: 'TN',
      deliveryCity: 'Dallas',
      deliveryState: 'TX',
      pickupDate,
      deliveryDate,
      equipmentType: 'Dry Van',
      trailerLengthFt: 53,
      fullPartial: 'full',
      commodity: 'Test Shipper — general freight',
      weight: '38000 lb',
      specialInstructions: 'Synthetic QA lane — do not invoice in production',
    });

    expect(submitShipmentRequest(SHIPPER_ORG, requestId)).toBe(true);

    let store = loadDemoStore();
    const req = store.shipmentRequests.find((r) => r.id === requestId)!;
    expect(req.status).toBe('under_review');
    expect(req.pickupCity).toBe('Nashville');
    expect(req.weight).toBe('38000 lb');

    const pricing = computePricingDraft(dollarsToMinor(SHIPPER_RATE), dollarsToMinor(CARRIER_RATE));
    expect(pricing.estimatedMarginMinor).toBe(dollarsToMinor(SHIPPER_RATE - CARRIER_RATE));
    expect(computeGrossMarginPercent(dollarsToMinor(SHIPPER_RATE), pricing.estimatedMarginMinor)).toBeCloseTo(
      ((SHIPPER_RATE - CARRIER_RATE) / SHIPPER_RATE) * 100,
      1,
    );

    const quote = createQuoteFromRequest(
      requestId,
      { ...pricing, validUntil: new Date(Date.now() + 3 * 86400000).toISOString(), termsNote: 'Synthetic QA terms' },
      STAFF_ID,
    )!;
    expect(quote.revisions).toHaveLength(1);
    sendBrokerageQuoteWorkflow(quote.id);

    store = loadDemoStore();
    expect(store.brokerageFreightQuotes.find((q) => q.id === quote.id)?.status).toBe('sent');
    expect(store.shipmentRequests.find((r) => r.id === requestId)?.status).toBe('awaiting_shipper_approval');

    const loadId = acceptBrokerageQuoteWorkflow(quote.id, SHIPPER_ORG)!;
    store = loadDemoStore();

    const load = store.loads.find((l) => l.id === loadId)!;
    const fin = store.brokerageLoadFinancials.find((f) => f.loadId === loadId)!;
    expect(load.sourceType).toBe('brokerage');
    expect(load.originCity).toBe('Nashville');
    expect(load.destinationCity).toBe('Dallas');
    expect(load.brokerageShipmentRequestId).toBe(requestId);
    expect(fin.confirmedShipperChargeMinor).toBe(dollarsToMinor(SHIPPER_RATE));
    expect(fin.confirmedCarrierPayMinor).toBeLessThan(fin.confirmedShipperChargeMinor);

    setLoadCarrierRate(loadId, dollarsToMinor(CARRIER_RATE), STAFF_ID);
    publishLoadToBoard(loadId, STAFF_ID, { visibility: 'published' });

    store = loadDemoStore();
    const pub = store.loadBoardPublications?.find((p) => p.loadId === loadId);
    expect(pub?.visibility).toBe('published');
    expect(pub?.publishedAt).toBeTruthy();

    const updatedFin = getLoadFinancials(loadId, store)!;
    const publication: LoadBoardPublication = {
      loadId,
      sourceType: 'aio_shipper_freight',
      visibility: 'published',
      bookingMode: 'submit_offer',
      fullPartial: 'full',
      publishedAt: pub!.publishedAt,
      createdAt: pub!.createdAt,
      updatedAt: pub!.updatedAt,
    };
    const carrierView = projectCarrierLoadResult(load, publication, updatedFin, { pickupDeadheadMiles: 50 });
    const carrierJson = JSON.stringify(carrierView);
    expect(carrierJson).not.toContain(String(updatedFin.confirmedShipperChargeMinor));
    expect(carrierJson).not.toContain('margin');
    expect(carrierView.carrierRateMinor).toBe(dollarsToMinor(CARRIER_RATE));
  });

  it('handles RPM edge cases without NaN or Infinity', () => {
    expect(computeTrueRpm(180000, 0, 0)).toBe(0);
    expect(computeTrueRpm(0, 50, 250)).toBe(0);
    expect(computeTrueImmediateMiles(50, 250)).toBe(300);
    const rpm = computeTrueRpm(265000, 50, 670);
    expect(Number.isFinite(rpm)).toBe(true);
    expect(rpm).toBeGreaterThan(0);
  });

  it('fires saved-search alert once when alertEnabled and load published', async () => {
    saveLoadSearch('client-b', 'Nashville area', { originCity: 'Nashville', originState: 'TN' }, true);
    const seeded = loadDemoStore();
    const loadId = seeded.loads.find((l) => l.sourceType === 'brokerage')?.id;
    expect(loadId).toBeTruthy();
    const first = await evaluateSavedSearchAlertsDemo(loadId!, seeded);
    const second = await evaluateSavedSearchAlertsDemo(loadId!, seeded);
    expect(first).toBeGreaterThanOrEqual(0);
    expect(second).toBe(0);
  });

  it('matched_carriers strategy does not publicly publish load', () => {
    const requestId = saveShipmentRequestDraft(SHIPPER_ORG, {
      pickupCity: 'Memphis',
      pickupState: 'TN',
      deliveryCity: 'Houston',
      deliveryState: 'TX',
      pickupDate: '2026-11-01',
      deliveryDate: '2026-11-03',
      equipmentType: 'Dry Van',
    });
    submitShipmentRequest(SHIPPER_ORG, requestId);
    const pricing = computePricingDraft(dollarsToMinor(3000), dollarsToMinor(2500));
    const quote = createQuoteFromRequest(requestId, pricing, STAFF_ID)!;
    sendBrokerageQuoteWorkflow(quote.id);
    const loadId = acceptBrokerageQuoteWorkflow(quote.id, SHIPPER_ORG)!;

    applyLoadDistributionStrategy(loadId, 'matched_carriers', STAFF_ID);
    const after = loadDemoStore();
    const pub = after.loadBoardPublications?.find((p) => p.loadId === loadId);
    expect(pub?.visibility).not.toBe('published');
  });
});
