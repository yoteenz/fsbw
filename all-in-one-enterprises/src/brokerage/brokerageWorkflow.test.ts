import { describe, expect, it, beforeEach, beforeAll } from 'vitest';
import { createDemoSeed } from '../demo/demoSeed';
import { loadDemoStore, saveDemoStore } from '../demo/demoStore';
import type { DemoStore } from '../demo/demoTypes';
import { dollarsToMinor } from '../billing/money';
import {
  acceptBrokerageQuoteWorkflow,
  computePricingDraft,
  createQuoteFromRequest,
  getPendingShipperRequests,
  saveShipmentRequestDraft,
  sendBrokerageQuoteWorkflow,
  submitShipmentRequest,
} from './brokerageWorkflow';

const SHIPPER_ORG = 'client-e';
const STAFF_ID = 'staff-7';

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

function resetStore(seed?: DemoStore): DemoStore {
  const base = seed ?? createDemoSeed();
  saveDemoStore(base);
  return loadDemoStore();
}

describe('brokerageWorkflow shipper → load', () => {
  beforeEach(() => {
    resetStore();
  });

  it('persists draft and submits to under_review without duplicate entry', () => {
    const draftId = saveShipmentRequestDraft(SHIPPER_ORG, {
      pickupCity: 'Chicago',
      pickupState: 'IL',
      deliveryCity: 'Atlanta',
      deliveryState: 'GA',
      pickupDate: '2026-09-01',
      deliveryDate: '2026-09-03',
      equipmentType: 'Dry Van',
      commodity: 'Paper goods',
      weight: '42000 lbs',
    });

    expect(draftId).toBeTruthy();
    expect(submitShipmentRequest(SHIPPER_ORG, draftId)).toBe(true);

    const store = loadDemoStore();
    const req = store.shipmentRequests.find((r) => r.id === draftId);
    expect(req?.status).toBe('under_review');
    expect(req?.commodity).toBe('Paper goods');
    expect(getPendingShipperRequests(store).some((r) => r.id === draftId)).toBe(true);
  });

  it('creates versioned quote and converts accepted quote to canonical load', () => {
    const draftId = saveShipmentRequestDraft(SHIPPER_ORG, {
      pickupCity: 'Detroit',
      pickupState: 'MI',
      deliveryCity: 'Nashville',
      deliveryState: 'TN',
      pickupDate: '2026-09-05',
      deliveryDate: '2026-09-07',
      equipmentType: 'Dry Van',
    });
    submitShipmentRequest(SHIPPER_ORG, draftId);

    const pricing = computePricingDraft(dollarsToMinor(2800), dollarsToMinor(2350));
    const quote = createQuoteFromRequest(
      draftId,
      { ...pricing, validUntil: new Date(Date.now() + 86400000).toISOString() },
      STAFF_ID,
    );
    expect(quote).toBeDefined();
    expect(quote!.revisions).toHaveLength(1);
    expect(quote!.currentRevision).toBe(1);

    sendBrokerageQuoteWorkflow(quote!.id);

    const storeAfterSend = loadDemoStore();
    const sent = storeAfterSend.brokerageFreightQuotes.find((q) => q.id === quote!.id);
    expect(sent?.status).toBe('sent');
    expect(storeAfterSend.shipmentRequests.find((r) => r.id === draftId)?.status).toBe('awaiting_shipper_approval');

    const loadId = acceptBrokerageQuoteWorkflow(quote!.id, SHIPPER_ORG);
    expect(loadId).toBeTruthy();

    const storeAfterAccept = loadDemoStore();
    const load = storeAfterAccept.loads.find((l) => l.id === loadId);
    const req = storeAfterAccept.shipmentRequests.find((r) => r.id === draftId);
    const fin = storeAfterAccept.brokerageLoadFinancials.find((f) => f.loadId === loadId);

    expect(load?.sourceType).toBe('brokerage');
    expect(load?.originCity).toBe('Detroit');
    expect(load?.destinationCity).toBe('Nashville');
    expect(load?.brokerageShipmentRequestId).toBe(draftId);
    expect(req?.status).toBe('converted_to_load');
    expect(req?.convertedLoadId).toBe(loadId);
    expect(fin?.confirmedShipperChargeMinor).toBe(dollarsToMinor(2800));
    expect(storeAfterAccept.loadBoardPublications?.some((p) => p.loadId === loadId)).toBe(true);
  });
});
