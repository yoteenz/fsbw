import { TALENT_NETWORK_STORAGE_KEY, TALENT_NETWORK_VERSION } from './constants';
import { buildGrowthTalentRecommendations } from './growthBridge';
import { calculateTalentScore } from './talentScore';
import type { TalentNetworkStore, TalentProfile } from './types';

function emptyStore(): TalentNetworkStore {
  return {
    talents: [],
    wardrobes: [],
    castings: [],
    seriesAssignments: [],
    audienceIntel: [],
    characterVersions: [],
    contracts: [],
    growthRecommendations: [],
    onboardingDrafts: [],
    version: TALENT_NETWORK_VERSION,
  };
}

export function readTalentNetworkStore(): TalentNetworkStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(TALENT_NETWORK_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as TalentNetworkStore;
    return { ...emptyStore(), ...parsed, version: TALENT_NETWORK_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeTalentNetworkStore(store: TalentNetworkStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(TALENT_NETWORK_STORAGE_KEY, JSON.stringify(store));
}

export function mergeTalentNetworkPatch(patch: Partial<TalentNetworkStore>): void {
  const store = readTalentNetworkStore();
  writeTalentNetworkStore({ ...store, ...patch, version: TALENT_NETWORK_VERSION });
}

export function getTalentsForWorkspace(workspaceId: string): TalentProfile[] {
  return readTalentNetworkStore().talents.filter((t) => t.workspaceId === workspaceId);
}

export function refreshTalentScores(workspaceId: string): void {
  const store = readTalentNetworkStore();
  const talents = store.talents.map((t) => {
    if (t.workspaceId !== workspaceId) return t;
    return { ...t, talentScore: calculateTalentScore(t.performance), updatedAt: new Date().toISOString() };
  });
  const growthRecommendations = buildGrowthTalentRecommendations(workspaceId, talents);
  writeTalentNetworkStore({
    ...store,
    talents,
    growthRecommendations: [
      ...store.growthRecommendations.filter((r) => r.workspaceId !== workspaceId),
      ...growthRecommendations,
    ],
  });
}

export function bootstrapTalentNetworkStore(): TalentNetworkStore {
  return readTalentNetworkStore();
}
