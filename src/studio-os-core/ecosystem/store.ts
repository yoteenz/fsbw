import { ECOSYSTEM_STORAGE_KEY, ECOSYSTEM_VERSION } from './constants';
import { buildEcosystemRecommendations } from './recommendationEngine';
import type { EcosystemStore } from './types';

function emptyStore(): EcosystemStore {
  return {
    assets: [],
    dependencies: [],
    reviews: [],
    installs: [],
    versions: [],
    recommendations: [],
    creators: [],
    analytics: {
      totalDownloads: 0,
      activeInstalls: 0,
      retentionPct: 0,
      avgRating: 0,
      totalRevenue: 0,
      subscriptionRevenue: 0,
      renewalPct: 0,
      updateAdoptionPct: 0,
      supportRequests: 0,
      satisfactionScore: 0,
    },
    enterpriseLibraries: [],
    hubCards: [],
    version: ECOSYSTEM_VERSION,
  };
}

export function readEcosystemStore(): EcosystemStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(ECOSYSTEM_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as EcosystemStore;
    return { ...emptyStore(), ...parsed, version: ECOSYSTEM_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeEcosystemStore(store: EcosystemStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(ECOSYSTEM_STORAGE_KEY, JSON.stringify(store));
}

export function mergeEcosystemPatch(patch: Partial<EcosystemStore>): void {
  const store = readEcosystemStore();
  writeEcosystemStore({ ...store, ...patch, version: ECOSYSTEM_VERSION });
}

export function getAssetsForWorkspace(workspaceId: string) {
  return readEcosystemStore().assets.filter((a) => a.workspaceId === workspaceId);
}

export function refreshEcosystemRecommendations(workspaceId: string): void {
  const store = readEcosystemStore();
  const recs = buildEcosystemRecommendations(workspaceId, store.assets);
  writeEcosystemStore({
    ...store,
    recommendations: [...store.recommendations.filter((r) => r.workspaceId !== workspaceId), ...recs],
  });
}

export function bootstrapEcosystemStore(): EcosystemStore {
  return readEcosystemStore();
}
