import { describe, expect, it, beforeAll } from 'vitest';
import { createDemoSeed } from '../demo/demoSeed';
import { loadDemoStore, saveDemoStore } from '../demo/demoStore';
import type { DemoStore } from '../demo/demoTypes';
import {
  handoffBrokerageLoadToBookkeeping,
  handoffIdempotencyKey,
  isLoadReadyForHandoff,
} from './brokerageBookkeepingHandoff';
import { completeLoad } from '../demo/dispatchActions';
import { demoShipperFreightRepository } from '../shipper/demoShipperFreightRepository';

const STAFF_ID = 'staff-test';

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

describe('brokerageBookkeepingHandoff', () => {
  it('builds stable idempotency keys per load revision', () => {
    expect(handoffIdempotencyKey('load-1', 1)).toBe('BROKERAGE_LOAD:load-1:rev:1');
    expect(handoffIdempotencyKey('load-1', 2)).toBe('BROKERAGE_LOAD:load-1:rev:2');
  });

  it('handoffs complete brokerage load once in demo mode', async () => {
    const store = createDemoSeed();
    const load = store.loads.find((l) => l.sourceType === 'brokerage' && l.operationalStatus === 'complete');
    expect(load).toBeTruthy();
    store.brokerageBookkeepingHandoffs = [];
    resetStore(store);

    const first = await handoffBrokerageLoadToBookkeeping({
      load: load!,
      aioBrokerageOrgId: 'aio-internal',
    });
    expect(first.ok).toBe(true);
    if (first.ok) expect(first.created).toBe(true);

    const second = await handoffBrokerageLoadToBookkeeping({
      load: load!,
      aioBrokerageOrgId: 'aio-internal',
    });
    expect(second.ok).toBe(true);
    if (second.ok) expect(second.created).toBe(false);
  });

  it('fires idempotent handoff when brokerage load is completed', async () => {
    const store = createDemoSeed();
    const target = store.loads.find((l) => l.id === 'br-load-e');
    expect(target).toBeTruthy();
    target!.podDocumentId = 'vdoc-pod-test';
    resetStore(store);

    completeLoad(target!.id, STAFF_ID);
    const after = loadDemoStore();
    const handoffs = after.brokerageBookkeepingHandoffs ?? [];
    expect(handoffs.some((h) => h.sourceId === target!.id)).toBe(true);
  });

  it('rejects handoff when load is not complete', async () => {
    const store = createDemoSeed();
    const open = store.loads.find((l) => l.sourceType === 'brokerage' && l.operationalStatus !== 'complete');
    expect(open).toBeTruthy();
    expect(isLoadReadyForHandoff(open!)).toBe(false);

    const result = await handoffBrokerageLoadToBookkeeping({
      load: open!,
      aioBrokerageOrgId: 'aio-internal',
    });
    expect(result.ok).toBe(false);
  });
});

describe('demoShipperFreightRepository', () => {
  it('lists shipper requests scoped to org', async () => {
    const store = resetStore();
    const orgId = store.shipperPortalOrgId ?? 'client-e';
    const result = await demoShipperFreightRepository.listRequests(orgId);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.every((r) => r.shipperOrganizationId === orgId)).toBe(true);
    }
  });
});
