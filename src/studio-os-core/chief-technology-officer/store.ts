import {
  CTO_EXECUTIVE_COMPASS,
  CTO_LEADERSHIP_PHILOSOPHY,
  CHIEF_TECHNOLOGY_OFFICER_STORAGE_KEY,
  CHIEF_TECHNOLOGY_OFFICER_VERSION,
  CTO_PRIMARY_RESPONSIBILITIES,
} from './constants';
import type { ChiefTechnologyOfficerStore, ChiefTechnologyOfficerWorkspaceId } from './types';

function emptyStore(): ChiefTechnologyOfficerStore {
  return {
    version: CHIEF_TECHNOLOGY_OFFICER_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    companyName: '',
    dashboard: {
      summary: '',
      engineeringHealthPct: 0,
      platformStabilityPct: 0,
      pendingReviews: 0,
      protectionAlerts: 0,
      councilCollaborations: 0,
      reliabilityTrend: 'stable',
    },
    leadershipPhilosophy: [...CTO_LEADERSHIP_PHILOSOPHY],
    primaryResponsibilities: [...CTO_PRIMARY_RESPONSIBILITIES],
    executiveCompass: CTO_EXECUTIVE_COMPASS,
    technologyGovernance: [],
    engineeringAlignment: [],
    engineeringIntelligence: [],
    engineeringEvolution: [],
    platformArchitecture: [],
    engineeringCouncil: [],
    technologyOpsCenter: [],
    engineeringMemory: [],
    technologyProtection: [],
    dailyBriefing: [],
    recommendations: [],
    recommendedNextSteps: [],
    futureOpportunities: [],
  };
}

export function readChiefTechnologyOfficerStore(): ChiefTechnologyOfficerStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(CHIEF_TECHNOLOGY_OFFICER_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ChiefTechnologyOfficerStore;
    return { ...emptyStore(), ...parsed, version: CHIEF_TECHNOLOGY_OFFICER_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeChiefTechnologyOfficerStore(store: ChiefTechnologyOfficerStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    CHIEF_TECHNOLOGY_OFFICER_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: CHIEF_TECHNOLOGY_OFFICER_VERSION })
  );
}

export function bootstrapChiefTechnologyOfficerStore(seed?: Partial<ChiefTechnologyOfficerStore>): void {
  const existing = readChiefTechnologyOfficerStore();
  if (existing.technologyGovernance.length > 0) return;
  writeChiefTechnologyOfficerStore({ ...emptyStore(), ...seed });
}

export function selectChiefTechnologyOfficerWorkspace(id: ChiefTechnologyOfficerWorkspaceId): void {
  const store = readChiefTechnologyOfficerStore();
  writeChiefTechnologyOfficerStore({ ...store, activeWorkspaceId: id });
}
