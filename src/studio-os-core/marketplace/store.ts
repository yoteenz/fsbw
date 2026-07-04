import { MARKETPLACE_STORAGE_KEY, MARKETPLACE_VERSION } from './constants';
import { buildEcosystemRecommendations } from './ecosystemEngine';
import { buildIntelligentMatches } from './matchingEngine';
import { calculateTrustScore } from './trustScore';
import type { MarketplaceStore, ParticipantProfile } from './types';

function emptyStore(): MarketplaceStore {
  return {
    participants: [],
    matches: [],
    deals: [],
    collaborationHubs: [],
    payments: [],
    ecosystemRecommendations: [],
    version: MARKETPLACE_VERSION,
  };
}

export function readMarketplaceStore(): MarketplaceStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(MARKETPLACE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as MarketplaceStore;
    return { ...emptyStore(), ...parsed, version: MARKETPLACE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeMarketplaceStore(store: MarketplaceStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(MARKETPLACE_STORAGE_KEY, JSON.stringify(store));
}

export function mergeMarketplacePatch(patch: Partial<MarketplaceStore>): void {
  const store = readMarketplaceStore();
  writeMarketplaceStore({ ...store, ...patch, version: MARKETPLACE_VERSION });
}

export function getParticipantsForWorkspace(workspaceId: string): ParticipantProfile[] {
  return readMarketplaceStore().participants.filter((p) => p.workspaceId === workspaceId);
}

export function refreshMarketplaceIntelligence(workspaceId: string): void {
  const store = readMarketplaceStore();
  const participants = store.participants.map((p) => {
    if (p.workspaceId !== workspaceId) return p;
    return {
      ...p,
      trustScore: calculateTrustScore(p.performanceHistory),
      updatedAt: new Date().toISOString(),
    };
  });
  const matches = buildIntelligentMatches(workspaceId, participants);
  const ecosystemRecommendations = buildEcosystemRecommendations(workspaceId, participants);
  writeMarketplaceStore({
    ...store,
    participants,
    matches: [...store.matches.filter((m) => m.workspaceId !== workspaceId), ...matches],
    ecosystemRecommendations: [
      ...store.ecosystemRecommendations.filter((r) => r.workspaceId !== workspaceId),
      ...ecosystemRecommendations,
    ],
  });
}

export function bootstrapMarketplaceStore(): MarketplaceStore {
  return readMarketplaceStore();
}
