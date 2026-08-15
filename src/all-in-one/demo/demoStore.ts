import { AIO_STORAGE_KEYS, readStorage, removeStorage, writeStorage } from '../storage/demoStorage';
import { defaultIntakeAnswers } from '../intake/intakeTypes';
import type { ServicePlanItem } from '../repositories/servicePlanRepository';
import type { RoadmapResult } from '../roadmap/roadmapTypes';
import type { IntakeAnswers } from '../intake/intakeTypes';
import { createDemoSeed } from './demoSeed';
import type { DemoStore, ServiceRequest } from './demoTypes';

export const DEMO_STORE_KEY = 'aio_debug_store';

const STORE_EVENT = 'aio-demo-store-change';

export function loadDemoStore(): DemoStore {
  if (typeof window === 'undefined') return createDemoSeed();

  const existing = readStorage<DemoStore | (Omit<DemoStore, 'version'> & { version: 3 | 4 | 5 | 6 | 7 | 8 | 9 }) | null>(DEMO_STORE_KEY, null);
  if (existing?.version === 10) return existing as DemoStore;

  if (existing?.version === 9) {
    const upgraded = upgradeStoreV9ToV10(existing as DemoStoreV9);
    saveDemoStore(upgraded);
    return upgraded;
  }

  if (existing?.version === 8) {
    const v9 = upgradeStoreV8ToV9(existing as DemoStoreV8);
    const upgraded = upgradeStoreV9ToV10(v9);
    saveDemoStore(upgraded);
    return upgraded;
  }

  if (existing?.version === 7) {
    const v8 = upgradeStoreV7ToV8(existing as unknown as DemoStoreV7);
    const v9 = upgradeStoreV8ToV9(v8);
    const upgraded = upgradeStoreV9ToV10(v9);
    saveDemoStore(upgraded);
    return upgraded;
  }

  if (existing?.version === 6) {
    const v7 = upgradeStoreV6ToV7(existing as DemoStoreV6);
    const v8 = upgradeStoreV7ToV8(v7);
    const v9 = upgradeStoreV8ToV9(v8);
    const upgraded = upgradeStoreV9ToV10(v9);
    saveDemoStore(upgraded);
    return upgraded;
  }

  if (existing?.version === 5) {
    const v6 = upgradeStoreV5ToV6(existing as DemoStoreV5);
    const v7 = upgradeStoreV6ToV7(v6);
    const v8 = upgradeStoreV7ToV8(v7);
    const v9 = upgradeStoreV8ToV9(v8);
    const upgraded = upgradeStoreV9ToV10(v9);
    saveDemoStore(upgraded);
    return upgraded;
  }

  if (existing?.version === 4) {
    const v5 = upgradeStoreV4ToV5(existing as DemoStoreV4);
    const v6 = upgradeStoreV5ToV6(v5);
    const v7 = upgradeStoreV6ToV7(v6);
    const v8 = upgradeStoreV7ToV8(v7);
    const v9 = upgradeStoreV8ToV9(v8);
    const upgraded = upgradeStoreV9ToV10(v9);
    saveDemoStore(upgraded);
    return upgraded;
  }

  if (existing?.version === 3) {
    const v4 = upgradeStoreV3ToV4(existing as Omit<DemoStore, 'version'> & { version: 3 });
    const v5 = upgradeStoreV4ToV5(v4);
    const v6 = upgradeStoreV5ToV6(v5);
    const v7 = upgradeStoreV6ToV7(v6);
    const v8 = upgradeStoreV7ToV8(v7);
    const v9 = upgradeStoreV8ToV9(v8);
    const upgraded = upgradeStoreV9ToV10(v9);
    saveDemoStore(upgraded);
    return upgraded;
  }

  const migrated = migrateLegacyStore();
  if (migrated) {
    saveDemoStore(migrated);
    return migrated;
  }

  const seed = createDemoSeed();
  saveDemoStore(seed);
  return seed;
}

import { createRoadReadySeedData } from './roadReadySeed';
import { createVaultSeedData, defaultNotificationPreferences } from './vaultSeed';
import { createBillingSeedData, defaultServicePricingSeed } from './billingSeed';
import { createDispatchSeedData } from './dispatchSeed';
import { createFactoringSeedData } from './factoringSeed';
import { createBrokerageSeedData } from './brokerageSeed';

type DemoStoreV8 = Omit<
  DemoStore,
  | 'version'
  | 'brokerageCapability'
  | 'shipperProfiles'
  | 'shipmentRequests'
  | 'brokerageFreightQuotes'
  | 'carrierNetworkProfiles'
  | 'carrierOffers'
  | 'brokerageRateConfirmations'
  | 'brokerageLoadFinancials'
  | 'brokerageAccessorials'
  | 'brokerageShipperInvoices'
  | 'carrierPayables'
  | 'brokerageIssues'
  | 'coverageHistory'
  | 'brokerageCounters'
  | 'shipperPortalOrgId'
  | 'brokeragePortalClientId'
> & { version: 8 };

function upgradeStoreV8ToV9(store: DemoStoreV8): DemoStoreV9 {
  const brokerage = createBrokerageSeedData();
  const dispatchOnlyLoads = store.loads.filter((l) => l.sourceType !== 'brokerage');
  return {
    ...store,
    version: 9,
    shipperPortalOrgId: 'client-e',
    brokerageCapability: brokerage.capability,
    shipperProfiles: brokerage.shipperProfiles,
    shipmentRequests: brokerage.shipmentRequests,
    brokerageFreightQuotes: brokerage.freightQuotes,
    carrierNetworkProfiles: brokerage.carrierNetwork,
    carrierOffers: brokerage.carrierOffers,
    brokerageRateConfirmations: brokerage.rateConfirmations,
    loads: [...dispatchOnlyLoads, ...brokerage.loads],
    brokerageLoadFinancials: brokerage.financials,
    brokerageAccessorials: brokerage.accessorials,
    brokerageShipperInvoices: brokerage.shipperInvoices,
    carrierPayables: brokerage.carrierPayables,
    brokerageIssues: brokerage.issues,
    coverageHistory: brokerage.coverageHistory,
    brokerageCounters: brokerage.counters,
    brokerageQuotes: [],
    shipments: [],
  } as DemoStoreV9;
}

type DemoStoreV9 = Omit<DemoStore, 'version'> & { version: 9 };

function upgradeStoreV9ToV10(store: DemoStoreV9): DemoStore {
  const seed = createBrokerageSeedData();
  const seedLoads = new Map(seed.loads.map((l) => [l.id, l]));
  const seedFinancials = new Map(seed.financials.map((f) => [f.loadId, f]));

  return {
    ...store,
    version: 10,
    brokeragePortalClientId: store.brokeragePortalClientId ?? 'client-b',
    loads: store.loads.map((load) => {
      if (load.sourceType !== 'brokerage') return load;
      const seeded = seedLoads.get(load.id);
      if (!seeded) return load;
      return {
        ...load,
        operationalStatus: seeded.operationalStatus,
        offerStatus: seeded.offerStatus,
        brokerageCoverageStatus: seeded.brokerageCoverageStatus,
        brokerageCarrierOrganizationId: seeded.brokerageCarrierOrganizationId,
        brokerageCarrierNetworkProfileId: seeded.brokerageCarrierNetworkProfileId,
        organizationId: seeded.organizationId,
        linehaulMinor: seeded.linehaulMinor,
        grossMinor: seeded.grossMinor,
        confirmedGrossMinor: seeded.confirmedGrossMinor,
      };
    }),
    brokerageLoadFinancials: store.brokerageLoadFinancials.map((fin) => seedFinancials.get(fin.loadId) ?? fin),
    carrierPayables: store.carrierPayables.map((payable) => {
      if (payable.id !== 'cp-h') return payable;
      return { ...payable, carrierOrganizationId: 'client-d' };
    }),
  };
}

type DemoStoreV7 = Omit<
  DemoStore,
  | 'version'
  | 'factoringProviders'
  | 'factoringProfiles'
  | 'debtorAccounts'
  | 'freightInvoices'
  | 'factoringIssues'
  | 'factoringCounters'
> & {
  version: 7;
  factoringSubmissions?: Array<Record<string, unknown>>;
};

function upgradeStoreV7ToV8(store: DemoStoreV7): DemoStoreV8 {
  const factoring = createFactoringSeedData();
  return {
    ...store,
    version: 8,
    factoringProviders: factoring.providers,
    factoringProfiles: factoring.profiles,
    debtorAccounts: factoring.debtors,
    freightInvoices: factoring.freightInvoices,
    factoringSubmissions: factoring.submissions,
    factoringIssues: factoring.issues,
    factoringCounters: factoring.counters,
  } as DemoStoreV8;
}

type DemoStoreV4 = Omit<DemoStore, 'version' | 'renewals' | 'notificationPreferences' | 'expirationEvaluatorLastRun'> & {
  version: 4;
  renewals?: DemoStore['renewals'];
  notificationPreferences?: DemoStore['notificationPreferences'];
  expirationEvaluatorLastRun?: string;
};

type DemoStoreV5 = Omit<
  DemoStore,
  'version' | 'quotes' | 'payments' | 'receipts' | 'credits' | 'servicePricing' | 'billingCounters' | 'billingEvaluatorLastRun'
> & {
  version: 5;
  quotes?: DemoStore['quotes'];
  payments?: DemoStore['payments'];
  receipts?: DemoStore['receipts'];
  credits?: DemoStore['credits'];
  servicePricing?: DemoStore['servicePricing'];
  billingCounters?: DemoStore['billingCounters'];
  billingEvaluatorLastRun?: string;
  invoices?: DemoStore['invoices'] | Array<{ id: string; amount: number; clientId: string; [key: string]: unknown }>;
};

type DemoStoreV6 = Omit<
  DemoStore,
  | 'version'
  | 'dispatchEnrollments'
  | 'truckProfiles'
  | 'brokerContacts'
  | 'dispatchBillingConfigs'
  | 'dispatchBillingEvents'
  | 'dispatchCounters'
> & {
  version: 6;
  loads: DemoStore['loads'] | Array<Record<string, unknown>>;
  dispatchEnrollments?: DemoStore['dispatchEnrollments'];
  truckProfiles?: DemoStore['truckProfiles'];
  brokerContacts?: DemoStore['brokerContacts'];
  dispatchBillingConfigs?: DemoStore['dispatchBillingConfigs'];
  dispatchBillingEvents?: DemoStore['dispatchBillingEvents'];
  dispatchCounters?: DemoStore['dispatchCounters'];
};

function upgradeStoreV6ToV7(store: DemoStoreV6): DemoStoreV7 {
  const dispatch = createDispatchSeedData();
  return {
    ...store,
    version: 7,
    loads: dispatch.loads,
    dispatchEnrollments: dispatch.enrollments,
    truckProfiles: dispatch.truckProfiles,
    brokerContacts: dispatch.brokerContacts,
    dispatchBillingConfigs: dispatch.dispatchBillingConfigs,
    dispatchBillingEvents: [],
    dispatchCounters: dispatch.dispatchCounters,
    factoringSubmissions: [],
  } as DemoStoreV7;
}

function upgradeStoreV5ToV6(store: DemoStoreV5): DemoStoreV6 {
  const billing = createBillingSeedData();
  return {
    ...store,
    version: 6,
    quotes: billing.quotes,
    invoices: billing.invoices,
    payments: billing.payments,
    receipts: billing.receipts,
    credits: billing.credits,
    servicePricing: defaultServicePricingSeed(),
    billingCounters: billing.billingCounters,
    billingEvaluatorLastRun: new Date().toISOString(),
  } as DemoStoreV6;
}

function upgradeStoreV4ToV5(store: DemoStoreV4): DemoStoreV5 {
  const vault = createVaultSeedData();
  return {
    ...store,
    version: 5,
    documents: vault.documents,
    renewals: vault.renewals,
    deadlines: [...store.deadlines.filter((d) => !d.documentId), ...vault.deadlines],
    notifications: vault.notifications,
    notificationPreferences: defaultNotificationPreferences(),
    expirationEvaluatorLastRun: new Date().toISOString(),
  } as DemoStoreV5;
}

function upgradeStoreV3ToV4(store: Omit<DemoStore, 'version'> & { version: 3 }): DemoStoreV4 {
  const rr = createRoadReadySeedData();
  return {
    ...store,
    version: 4,
    roadReadyProfiles: rr.profiles,
    roadReadyItems: rr.items,
    roadReadyHistory: rr.history,
    roadReadyVerifications: rr.verifications,
    powerUnits: rr.powerUnits,
    trailers: rr.trailers,
    drivers: rr.drivers,
  };
}

function migrateLegacyStore(): DemoStore | null {
  const seed = createDemoSeed();
  const intake = readStorage<IntakeAnswers>(AIO_STORAGE_KEYS.intake, defaultIntakeAnswers());
  const roadmap = readStorage<RoadmapResult | null>(AIO_STORAGE_KEYS.roadmap, null);
  const servicePlan = readStorage<ServicePlanItem[]>(AIO_STORAGE_KEYS.servicePlan, []);
  const legacyRequests = readStorage<unknown[]>(AIO_STORAGE_KEYS.requests, []);
  const counter = readStorage(AIO_STORAGE_KEYS.requestCounter, seed.requestCounter);

  const hasLegacy =
    legacyRequests.length > 0 ||
    servicePlan.length > 0 ||
    roadmap !== null ||
    JSON.stringify(intake) !== JSON.stringify(defaultIntakeAnswers());

  if (!hasLegacy) return null;

  seed.intake = intake;
  seed.roadmap = roadmap;
  seed.servicePlan = servicePlan;
  seed.requestCounter = counter;

  // Merge legacy requests into seed if any
  if (legacyRequests.length > 0) {
    seed.requests = (legacyRequests as ServiceRequest[]).map((r) => ({
      ...r,
      clientId: r.clientId ?? seed.portalClientId ?? 'client-a',
      division: r.division ?? r.services?.[0]?.division ?? 'permitting',
      workflowStep: r.workflowStep ?? r.status ?? 'new_request',
      priority: r.priority ?? 'normal',
      documentIds: r.documentIds ?? [],
      taskIds: r.taskIds ?? [],
    }));
  }

  Object.values(AIO_STORAGE_KEYS).forEach(removeStorage);
  return seed;
}

export function saveDemoStore(store: DemoStore): void {
  writeStorage(DEMO_STORE_KEY, store);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(STORE_EVENT));
  }
}

export function resetDemoStore(): DemoStore {
  Object.values(AIO_STORAGE_KEYS).forEach(removeStorage);
  removeStorage(DEMO_STORE_KEY);
  const seed = createDemoSeed();
  saveDemoStore(seed);
  return seed;
}

export function subscribeDemoStore(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => cb();
  window.addEventListener(STORE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(STORE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

export function updateDemoStore(updater: (store: DemoStore) => DemoStore): DemoStore {
  const next = updater(structuredClone(loadDemoStore()));
  saveDemoStore(next);
  return next;
}
