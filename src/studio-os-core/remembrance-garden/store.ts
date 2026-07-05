import { GARDEN_PHILOSOPHY, REMEMBRANCE_GARDEN_STORAGE_KEY, REMEMBRANCE_GARDEN_VERSION } from './constants';
import type { RemembranceGardenStore, RemembranceGardenWorkspaceId } from './types';

function emptyStore(): RemembranceGardenStore {
  return {
    version: REMEMBRANCE_GARDEN_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    companyName: '',
    dashboard: {
      summary: '',
      dedicationCount: 0,
      reflectionSpaces: 0,
      preservedMemories: 0,
      legacyLetters: 0,
      gardenMaturityPct: 0,
      gratitudeDepthPct: 0,
      activeSeason: 'spring',
    },
    gardenPhilosophy: [...GARDEN_PHILOSOPHY],
    dedicationSpaces: [],
    memoryPreservations: [],
    reflectionSpaces: [],
    livingSeasons: [],
    gratitudeMoments: [],
    legacyLetters: [],
    familyHeritage: [],
    futureGenerations: [],
    portfolioRemembrance: [],
    campusIntegration: [],
    recommendedNextSteps: [],
    futureOpportunities: [],
  };
}

export function readRemembranceGardenStore(): RemembranceGardenStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(REMEMBRANCE_GARDEN_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as RemembranceGardenStore;
    return { ...emptyStore(), ...parsed, version: REMEMBRANCE_GARDEN_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeRemembranceGardenStore(store: RemembranceGardenStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    REMEMBRANCE_GARDEN_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: REMEMBRANCE_GARDEN_VERSION })
  );
}

export function bootstrapRemembranceGardenStore(seed?: Partial<RemembranceGardenStore>): void {
  const existing = readRemembranceGardenStore();
  if (existing.dedicationSpaces.length > 0) return;
  writeRemembranceGardenStore({ ...emptyStore(), ...seed });
}

export function selectRemembranceGardenWorkspace(id: RemembranceGardenWorkspaceId): void {
  const store = readRemembranceGardenStore();
  writeRemembranceGardenStore({ ...store, activeWorkspaceId: id });
}

export function setRemembranceGardenSeason(season: string): void {
  const store = readRemembranceGardenStore();
  writeRemembranceGardenStore({
    ...store,
    dashboard: { ...store.dashboard, activeSeason: season },
  });
}
