import { BME_STORAGE_KEY, BME_VERSION } from './constants';
import { buildDefaultEconomics, buildDefaultEcosystemHealth } from './economicsEngine';
import type { BusinessModelEngineStore } from './types';

function emptyStore(): BusinessModelEngineStore {
  return {
    workspaceBilling: [],
    usageMetrics: [],
    platformFees: [],
    payments: [],
    wallets: [],
    affiliatePrograms: [],
    royalties: [],
    assetListings: [],
    appEcosystem: [],
    certifications: [],
    enterpriseLicenses: [],
    economics: buildDefaultEconomics(),
    pricingScenarios: [],
    ecosystemHealth: buildDefaultEcosystemHealth(),
    version: BME_VERSION,
  };
}

export function readBusinessModelEngineStore(): BusinessModelEngineStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(BME_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as BusinessModelEngineStore;
    return { ...emptyStore(), ...parsed, version: BME_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeBusinessModelEngineStore(store: BusinessModelEngineStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(BME_STORAGE_KEY, JSON.stringify(store));
}

export function mergeBusinessModelEnginePatch(patch: Partial<BusinessModelEngineStore>): void {
  const store = readBusinessModelEngineStore();
  writeBusinessModelEngineStore({ ...store, ...patch, version: BME_VERSION });
}

export function getWorkspaceBilling(workspaceId: string) {
  return readBusinessModelEngineStore().workspaceBilling.find((b) => b.workspaceId === workspaceId);
}

export function bootstrapBusinessModelEngineStore(): BusinessModelEngineStore {
  return readBusinessModelEngineStore();
}
