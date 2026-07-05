import {
  CBO_LEADERSHIP_PHILOSOPHY,
  CHIEF_BRAND_OFFICER_STORAGE_KEY,
  CHIEF_BRAND_OFFICER_VERSION,
  CBO_PRIMARY_RESPONSIBILITIES,
  EXECUTIVE_COMPASS_QUESTION,
} from './constants';
import type { ChiefBrandOfficerStore, ChiefBrandOfficerWorkspaceId } from './types';

function emptyStore(): ChiefBrandOfficerStore {
  return {
    version: CHIEF_BRAND_OFFICER_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    companyName: '',
    dashboard: {
      summary: '',
      brandHealthPct: 0,
      consistencyScorePct: 0,
      pendingReviews: 0,
      protectionAlerts: 0,
      councilCollaborations: 0,
      brandEquityTrend: 'stable',
    },
    leadershipPhilosophy: [...CBO_LEADERSHIP_PHILOSOPHY],
    primaryResponsibilities: [...CBO_PRIMARY_RESPONSIBILITIES],
    executiveCompass: EXECUTIVE_COMPASS_QUESTION,
    brandGovernance: [],
    brandAlignment: [],
    brandIntelligence: [],
    brandEvolution: [],
    brandCouncil: [],
    creativeReviewStudio: [],
    brandMemory: [],
    brandProtection: [],
    dailyBriefing: [],
    recommendations: [],
    recommendedNextSteps: [],
    futureOpportunities: [],
  };
}

export function readChiefBrandOfficerStore(): ChiefBrandOfficerStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(CHIEF_BRAND_OFFICER_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ChiefBrandOfficerStore;
    return { ...emptyStore(), ...parsed, version: CHIEF_BRAND_OFFICER_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeChiefBrandOfficerStore(store: ChiefBrandOfficerStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    CHIEF_BRAND_OFFICER_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: CHIEF_BRAND_OFFICER_VERSION })
  );
}

export function bootstrapChiefBrandOfficerStore(seed?: Partial<ChiefBrandOfficerStore>): void {
  const existing = readChiefBrandOfficerStore();
  if (existing.brandGovernance.length > 0) return;
  writeChiefBrandOfficerStore({ ...emptyStore(), ...seed });
}

export function selectChiefBrandOfficerWorkspace(id: ChiefBrandOfficerWorkspaceId): void {
  const store = readChiefBrandOfficerStore();
  writeChiefBrandOfficerStore({ ...store, activeWorkspaceId: id });
}
