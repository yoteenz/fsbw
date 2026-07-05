import {
  CGO_EXECUTIVE_COMPASS,
  CGO_LEADERSHIP_PHILOSOPHY,
  CHIEF_GROWTH_OFFICER_STORAGE_KEY,
  CHIEF_GROWTH_OFFICER_VERSION,
  CGO_PRIMARY_RESPONSIBILITIES,
} from './constants';
import type { ChiefGrowthOfficerStore, ChiefGrowthOfficerWorkspaceId } from './types';

function emptyStore(): ChiefGrowthOfficerStore {
  return {
    version: CHIEF_GROWTH_OFFICER_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    companyName: '',
    dashboard: {
      summary: '',
      growthHealthPct: 0,
      relationshipHealthPct: 0,
      pendingReviews: 0,
      protectionAlerts: 0,
      councilCollaborations: 0,
      growthTrajectory: 'stable',
    },
    leadershipPhilosophy: [...CGO_LEADERSHIP_PHILOSOPHY],
    primaryResponsibilities: [...CGO_PRIMARY_RESPONSIBILITIES],
    executiveCompass: CGO_EXECUTIVE_COMPASS,
    growthGovernance: [],
    growthAlignment: [],
    growthIntelligence: [],
    growthEvolution: [],
    growthCouncil: [],
    growthLaboratory: [],
    growthMemory: [],
    growthProtection: [],
    dailyBriefing: [],
    recommendations: [],
    recommendedNextSteps: [],
    futureOpportunities: [],
  };
}

export function readChiefGrowthOfficerStore(): ChiefGrowthOfficerStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(CHIEF_GROWTH_OFFICER_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ChiefGrowthOfficerStore;
    return { ...emptyStore(), ...parsed, version: CHIEF_GROWTH_OFFICER_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeChiefGrowthOfficerStore(store: ChiefGrowthOfficerStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    CHIEF_GROWTH_OFFICER_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: CHIEF_GROWTH_OFFICER_VERSION })
  );
}

export function bootstrapChiefGrowthOfficerStore(seed?: Partial<ChiefGrowthOfficerStore>): void {
  const existing = readChiefGrowthOfficerStore();
  if (existing.growthGovernance.length > 0) return;
  writeChiefGrowthOfficerStore({ ...emptyStore(), ...seed });
}

export function selectChiefGrowthOfficerWorkspace(id: ChiefGrowthOfficerWorkspaceId): void {
  const store = readChiefGrowthOfficerStore();
  writeChiefGrowthOfficerStore({ ...store, activeWorkspaceId: id });
}
