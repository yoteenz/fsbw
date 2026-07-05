import {
  CAMPUS_EVOLUTION_STORAGE_KEY,
  CAMPUS_EVOLUTION_VERSION,
  CAMPUS_PHILOSOPHY,
  CAMPUS_STAGE_DEFS,
} from './constants';
import type { CampusEvolutionStore, CampusEvolutionWorkspaceId, CampusStageId } from './types';

function emptyStore(): CampusEvolutionStore {
  return {
    version: CAMPUS_EVOLUTION_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    companyName: '',
    dashboard: {
      summary: '',
      currentStageId: 'startup-studio',
      stageProgressPct: 0,
      organizationalHealthPct: 0,
      knowledgeGrowthPct: 0,
      relationshipGrowthPct: 0,
      innovationPct: 0,
      activeConstruction: 0,
      futureExpansionPct: 0,
    },
    campusPhilosophy: [...CAMPUS_PHILOSOPHY],
    dayOneSpaces: [],
    stages: CAMPUS_STAGE_DEFS.map((s) => ({ ...s, current: false, progressPct: 0 })),
    organicEvolution: [],
    earnedSpaces: [],
    companyMemory: [],
    livingMuseum: [],
    brandInheritance: {
      companyName: '',
      identity: '',
      materials: '',
      colors: '',
      architecture: '',
      motionLanguage: '',
      lighting: '',
      uniqueness: '',
    },
    cultureProfile: { profile: '', influences: [], expression: '' },
    portfolioDistricts: [],
    campusIntelligence: [],
    livingEnvironment: [],
    simulations: [],
    recommendedNextSteps: [],
    futureOpportunities: [],
  };
}

export function readCampusEvolutionStore(): CampusEvolutionStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(CAMPUS_EVOLUTION_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as CampusEvolutionStore;
    return { ...emptyStore(), ...parsed, version: CAMPUS_EVOLUTION_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeCampusEvolutionStore(store: CampusEvolutionStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    CAMPUS_EVOLUTION_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: CAMPUS_EVOLUTION_VERSION })
  );
}

export function bootstrapCampusEvolutionStore(seed?: Partial<CampusEvolutionStore>): void {
  const existing = readCampusEvolutionStore();
  if (existing.earnedSpaces.length > 0) return;
  writeCampusEvolutionStore({ ...emptyStore(), ...seed });
}

export function selectCampusEvolutionWorkspace(id: CampusEvolutionWorkspaceId): void {
  const store = readCampusEvolutionStore();
  writeCampusEvolutionStore({ ...store, activeWorkspaceId: id });
}

export function setCampusStageFocus(stageId: CampusStageId): void {
  const store = readCampusEvolutionStore();
  writeCampusEvolutionStore({
    ...store,
    dashboard: { ...store.dashboard, currentStageId: stageId },
  });
}
