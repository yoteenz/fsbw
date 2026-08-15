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

  const existing = readStorage<DemoStore | (Omit<DemoStore, 'version'> & { version: 3 | 4 }) | null>(DEMO_STORE_KEY, null);
  if (existing?.version === 5) return existing as DemoStore;

  if (existing?.version === 4) {
    const upgraded = upgradeStoreV4ToV5(existing as DemoStoreV4);
    saveDemoStore(upgraded);
    return upgraded;
  }

  if (existing?.version === 3) {
    const v4 = upgradeStoreV3ToV4(existing as Omit<DemoStore, 'version'> & { version: 3 });
    const upgraded = upgradeStoreV4ToV5(v4);
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

type DemoStoreV4 = Omit<DemoStore, 'version' | 'renewals' | 'notificationPreferences' | 'expirationEvaluatorLastRun'> & {
  version: 4;
  renewals?: DemoStore['renewals'];
  notificationPreferences?: DemoStore['notificationPreferences'];
  expirationEvaluatorLastRun?: string;
};

function upgradeStoreV4ToV5(store: DemoStoreV4): DemoStore {
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
  };
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
