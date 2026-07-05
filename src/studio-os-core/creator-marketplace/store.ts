import {
  CREATOR_CAREER_STAGES,
  CREATOR_MARKETPLACE_STORAGE_KEY,
  CREATOR_MARKETPLACE_VERSION,
  CREATOR_PHILOSOPHY,
} from './constants';
import type { CreatorMarketplaceStore, CreatorMarketplaceWorkspaceId } from './types';

function emptyStore(): CreatorMarketplaceStore {
  return {
    version: CREATOR_MARKETPLACE_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    dashboard: {
      summary: '',
      verifiedCreators: 0,
      activeDeals: 0,
      avgMatchConfidence: 0,
      risingCreators: 0,
      partnershipRenewalPct: 0,
      marketplaceHealthPct: 0,
    },
    creatorPhilosophy: [...CREATOR_PHILOSOPHY],
    careerStages: CREATOR_CAREER_STAGES,
    creators: [],
    brands: [],
    matches: [],
    deals: [],
    creatorOs: {},
    agencyTeams: [],
    intelligenceSignals: [],
    relationships: [],
    simulations: [],
    education: [],
    talentDiscoveries: [],
    careerRecommendations: [],
    paymentIntel: {},
    selectedCreatorId: null,
    selectedBrandId: null,
  };
}

function refreshDashboard(store: CreatorMarketplaceStore): CreatorMarketplaceStore['dashboard'] {
  const creators = store.creators.filter((c) => c.workspaceId === store.activeWorkspaceId);
  const matchConf = store.matches.length > 0
    ? Math.round(store.matches.reduce((s, m) => s + m.confidencePct, 0) / store.matches.length)
    : 0;

  return {
    ...store.dashboard,
    verifiedCreators: creators.filter((c) => c.verified).length,
    activeDeals: store.deals.filter((d) => d.status === 'active' || d.status === 'delivering').length,
    avgMatchConfidence: matchConf,
    risingCreators: store.intelligenceSignals.filter((s) => s.type === 'rising-creator').length,
  };
}

export function readCreatorMarketplaceStore(): CreatorMarketplaceStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(CREATOR_MARKETPLACE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as CreatorMarketplaceStore;
    return { ...emptyStore(), ...parsed, version: CREATOR_MARKETPLACE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeCreatorMarketplaceStore(store: CreatorMarketplaceStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    CREATOR_MARKETPLACE_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: CREATOR_MARKETPLACE_VERSION })
  );
}

export function bootstrapCreatorMarketplaceStore(seed?: Partial<CreatorMarketplaceStore>): void {
  const existing = readCreatorMarketplaceStore();
  if (existing.creators.length > 0) return;
  const merged = { ...emptyStore(), ...seed };
  writeCreatorMarketplaceStore({ ...merged, dashboard: refreshDashboard(merged) });
}

export function selectCreatorMarketplaceWorkspace(id: CreatorMarketplaceWorkspaceId): void {
  const store = readCreatorMarketplaceStore();
  const first = store.creators.find((c) => c.workspaceId === id);
  writeCreatorMarketplaceStore({
    ...store,
    activeWorkspaceId: id,
    selectedCreatorId: first?.id ?? null,
    dashboard: refreshDashboard({ ...store, activeWorkspaceId: id }),
  });
}

export function selectCreatorMarketplaceCreator(id: string | null): void {
  const store = readCreatorMarketplaceStore();
  writeCreatorMarketplaceStore({ ...store, selectedCreatorId: id });
}

export function selectCreatorMarketplaceBrand(id: string | null): void {
  const store = readCreatorMarketplaceStore();
  writeCreatorMarketplaceStore({ ...store, selectedBrandId: id });
}
