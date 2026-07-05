import {
  CEO_LEADERSHIP_PHILOSOPHY,
  CHIEF_EXPERIENCE_OFFICER_STORAGE_KEY,
  CHIEF_EXPERIENCE_OFFICER_VERSION,
  CEO_PRIMARY_RESPONSIBILITIES,
  CEO_EXECUTIVE_COMPASS,
} from './constants';
import type { ChiefExperienceOfficerStore, ChiefExperienceOfficerWorkspaceId } from './types';

function emptyStore(): ChiefExperienceOfficerStore {
  return {
    version: CHIEF_EXPERIENCE_OFFICER_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    companyName: '',
    dashboard: {
      summary: '',
      experienceHealthPct: 0,
      trustScorePct: 0,
      pendingReviews: 0,
      frictionAlerts: 0,
      councilCollaborations: 0,
      relationshipHealthTrend: 'stable',
    },
    leadershipPhilosophy: [...CEO_LEADERSHIP_PHILOSOPHY],
    primaryResponsibilities: [...CEO_PRIMARY_RESPONSIBILITIES],
    executiveCompass: CEO_EXECUTIVE_COMPASS,
    experienceGovernance: [],
    experienceAlignment: [],
    journeyIntelligence: [],
    experienceIntelligence: [],
    experienceEvolution: [],
    experienceCouncil: [],
    experienceStudio: [],
    experienceMemory: [],
    experienceProtection: [],
    dailyBriefing: [],
    recommendations: [],
    recommendedNextSteps: [],
    futureOpportunities: [],
  };
}

export function readChiefExperienceOfficerStore(): ChiefExperienceOfficerStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(CHIEF_EXPERIENCE_OFFICER_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ChiefExperienceOfficerStore;
    return { ...emptyStore(), ...parsed, version: CHIEF_EXPERIENCE_OFFICER_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeChiefExperienceOfficerStore(store: ChiefExperienceOfficerStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    CHIEF_EXPERIENCE_OFFICER_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: CHIEF_EXPERIENCE_OFFICER_VERSION })
  );
}

export function bootstrapChiefExperienceOfficerStore(seed?: Partial<ChiefExperienceOfficerStore>): void {
  const existing = readChiefExperienceOfficerStore();
  if (existing.experienceGovernance.length > 0) return;
  writeChiefExperienceOfficerStore({ ...emptyStore(), ...seed });
}

export function selectChiefExperienceOfficerWorkspace(id: ChiefExperienceOfficerWorkspaceId): void {
  const store = readChiefExperienceOfficerStore();
  writeChiefExperienceOfficerStore({ ...store, activeWorkspaceId: id });
}
