import { describe, expect, it, beforeAll, beforeEach } from 'vitest';
import { createDemoSeed } from '../../../src/demo/demoSeed';
import { loadDemoStore, saveDemoStore } from '../../../src/demo/demoStore';
import {
  acceptLoadOffer,
  bookLoad,
  completeLoad,
  createLoadOpportunity,
  sendLoadOffer,
  updateLoadOperationalStatus,
  uploadLoadDocument,
} from '../../../src/demo/dispatchActions';

describe('Dispatch readiness', () => {
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

  it('creates load through offer, booking, delivery, and completion', () => {
    const orgId = 'client-e';
    const load = createLoadOpportunity(
      {
        organizationId: orgId,
        originCity: 'Nashville',
        originState: 'TN',
        destinationCity: 'Dallas',
        destinationState: 'TX',
        pickupDate: '2026-10-15',
        deliveryDate: '2026-10-17',
        loadedMiles: 640,
        deadheadMiles: 0,
        linehaulMinor: 265000,
        equipmentType: 'Dry Van',
      },
      'staff-7',
    );

    sendLoadOffer(load.id, 'staff-7');
    acceptLoadOffer(load.id, orgId);
    bookLoad(load.id, 'staff-7');
    updateLoadOperationalStatus(load.id, 'dispatched', 'staff-7');
    updateLoadOperationalStatus(load.id, 'in_transit', 'staff-7');
    updateLoadOperationalStatus(load.id, 'delivered', 'staff-7');
    updateLoadOperationalStatus(load.id, 'pod_needed', 'staff-7');
    uploadLoadDocument(load.id, orgId, 'rate_confirmation', 'rate-con.pdf');
    uploadLoadDocument(load.id, orgId, 'pod', 'pod.pdf');
    completeLoad(load.id, 'staff-7');

    const updated = loadDemoStore().loads.find((l) => l.id === load.id);
    expect(updated?.operationalStatus).toBe('complete');
  });
});
