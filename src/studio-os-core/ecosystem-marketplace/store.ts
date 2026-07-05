import {
  ECOSYSTEM_MARKETPLACE_STORAGE_KEY,
  ECOSYSTEM_MARKETPLACE_VERSION,
  MARKETPLACE_CATEGORIES,
  MARKETPLACE_PHILOSOPHY,
} from './constants';
import type { EcosystemMarketplaceStore, EcosystemMarketplaceWorkspaceId } from './types';

function emptyStore(): EcosystemMarketplaceStore {
  return {
    version: ECOSYSTEM_MARKETPLACE_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    dashboard: {
      summary: '',
      featuredAssets: 0,
      verifiedOrgs: 0,
      installedAssets: 0,
      avgCompatibility: 0,
      topContributors: 0,
      marketplaceHealthPct: 0,
    },
    marketplacePhilosophy: [...MARKETPLACE_PHILOSOPHY],
    categories: MARKETPLACE_CATEGORIES,
    assets: [],
    inheritanceIntegrations: [],
    compatibilitySimulations: [],
    assetEvolutions: [],
    contributions: [],
    collaborations: [],
    intelligenceRecs: [],
    reputations: [],
    installedAssets: [],
    industryCollections: [],
    crossCompanyLearnings: [],
    selectedAssetId: null,
  };
}

function refreshDashboard(store: EcosystemMarketplaceStore): EcosystemMarketplaceStore['dashboard'] {
  const assets = store.assets.filter((a) => a.workspaceId === store.activeWorkspaceId || a.featured);
  const compat = assets.length > 0
    ? Math.round(assets.reduce((s, a) => s + a.compatibilityPct, 0) / assets.length)
    : 0;

  return {
    ...store.dashboard,
    featuredAssets: store.assets.filter((a) => a.featured).length,
    verifiedOrgs: store.reputations.filter((r) => r.verified).length,
    installedAssets: store.installedAssets.length,
    avgCompatibility: compat,
    topContributors: store.contributions.filter((c) => c.status === 'published' || c.status === 'verified').length,
  };
}

export function readEcosystemMarketplaceStore(): EcosystemMarketplaceStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(ECOSYSTEM_MARKETPLACE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as EcosystemMarketplaceStore;
    return { ...emptyStore(), ...parsed, version: ECOSYSTEM_MARKETPLACE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeEcosystemMarketplaceStore(store: EcosystemMarketplaceStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    ECOSYSTEM_MARKETPLACE_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: ECOSYSTEM_MARKETPLACE_VERSION })
  );
}

export function bootstrapEcosystemMarketplaceStore(seed?: Partial<EcosystemMarketplaceStore>): void {
  const existing = readEcosystemMarketplaceStore();
  if (existing.assets.length > 0) return;
  const merged = { ...emptyStore(), ...seed };
  writeEcosystemMarketplaceStore({ ...merged, dashboard: refreshDashboard(merged) });
}

export function selectEcosystemMarketplaceWorkspace(id: EcosystemMarketplaceWorkspaceId): void {
  const store = readEcosystemMarketplaceStore();
  const first = store.assets.find((a) => a.workspaceId === id);
  writeEcosystemMarketplaceStore({
    ...store,
    activeWorkspaceId: id,
    selectedAssetId: first?.id ?? store.selectedAssetId,
    dashboard: refreshDashboard({ ...store, activeWorkspaceId: id }),
  });
}

export function selectEcosystemMarketplaceAsset(id: string | null): void {
  const store = readEcosystemMarketplaceStore();
  writeEcosystemMarketplaceStore({ ...store, selectedAssetId: id });
}
