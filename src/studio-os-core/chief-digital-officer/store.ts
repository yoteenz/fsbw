import {
  CDO_EXECUTIVE_COMPASS,
  CDO_LEADERSHIP_PHILOSOPHY,
  CHIEF_DIGITAL_OFFICER_STORAGE_KEY,
  CHIEF_DIGITAL_OFFICER_VERSION,
  CDO_PRIMARY_RESPONSIBILITIES,
} from './constants';
import type { ChiefDigitalOfficerStore, ChiefDigitalOfficerWorkspaceId } from './types';

function emptyStore(): ChiefDigitalOfficerStore {
  return {
    version: CHIEF_DIGITAL_OFFICER_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    companyName: '',
    dashboard: {
      summary: '',
      digitalHealthPct: 0,
      architectureScorePct: 0,
      pendingReviews: 0,
      protectionAlerts: 0,
      councilCollaborations: 0,
      platformHealthTrend: 'stable',
    },
    leadershipPhilosophy: [...CDO_LEADERSHIP_PHILOSOPHY],
    primaryResponsibilities: [...CDO_PRIMARY_RESPONSIBILITIES],
    executiveCompass: CDO_EXECUTIVE_COMPASS,
    digitalGovernance: [],
    digitalAlignment: [],
    digitalIntelligence: [],
    digitalEvolution: [],
    solutionArchitecture: [],
    aiEcosystem: [],
    technologyCouncil: [],
    digitalStudio: [],
    digitalMemory: [],
    digitalProtection: [],
    dailyBriefing: [],
    recommendations: [],
    recommendedNextSteps: [],
    futureOpportunities: [],
  };
}

export function readChiefDigitalOfficerStore(): ChiefDigitalOfficerStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(CHIEF_DIGITAL_OFFICER_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ChiefDigitalOfficerStore;
    return { ...emptyStore(), ...parsed, version: CHIEF_DIGITAL_OFFICER_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeChiefDigitalOfficerStore(store: ChiefDigitalOfficerStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    CHIEF_DIGITAL_OFFICER_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: CHIEF_DIGITAL_OFFICER_VERSION })
  );
}

export function bootstrapChiefDigitalOfficerStore(seed?: Partial<ChiefDigitalOfficerStore>): void {
  const existing = readChiefDigitalOfficerStore();
  if (existing.digitalGovernance.length > 0) return;
  writeChiefDigitalOfficerStore({ ...emptyStore(), ...seed });
}

export function selectChiefDigitalOfficerWorkspace(id: ChiefDigitalOfficerWorkspaceId): void {
  const store = readChiefDigitalOfficerStore();
  writeChiefDigitalOfficerStore({ ...store, activeWorkspaceId: id });
}
