import {
  EC_COUNCIL_PHILOSOPHY,
  EC_EXECUTIVE_COUNCIL_OATH,
  EC_LEADERSHIP_CULTURE,
  EXECUTIVE_COUNCIL_STORAGE_KEY,
  EXECUTIVE_COUNCIL_VERSION,
} from './constants';
import type { ExecutiveCouncilStore, ExecutiveCouncilWorkspaceId } from './types';

function emptyStore(): ExecutiveCouncilStore {
  return {
    version: EXECUTIVE_COUNCIL_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    companyName: '',
    dashboard: {
      summary: '',
      councilHealthPct: 0,
      activeSessions: 0,
      pendingDecisions: 0,
      healthyDisagreements: 0,
      simulationsScheduled: 0,
      organizationalWisdomPct: 0,
    },
    councilPhilosophy: [...EC_COUNCIL_PHILOSOPHY],
    executiveCouncilOath: [...EC_EXECUTIVE_COUNCIL_OATH],
    leadershipCulture: [...EC_LEADERSHIP_CULTURE],
    councilChamber: [],
    councilResponsibilities: [],
    executiveDebate: [],
    healthyDisagreements: [],
    cosFacilitation: [],
    decisionSynthesis: [],
    executiveTransparency: [],
    meetingModes: [],
    councilSimulations: [],
    organizationalLearning: [],
    founderParticipation: [],
    councilIntelligence: [],
    recommendedNextSteps: [],
    futureOpportunities: [],
  };
}

export function readExecutiveCouncilStore(): ExecutiveCouncilStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(EXECUTIVE_COUNCIL_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ExecutiveCouncilStore;
    return { ...emptyStore(), ...parsed, version: EXECUTIVE_COUNCIL_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeExecutiveCouncilStore(store: ExecutiveCouncilStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    EXECUTIVE_COUNCIL_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: EXECUTIVE_COUNCIL_VERSION })
  );
}

export function bootstrapExecutiveCouncilStore(seed?: Partial<ExecutiveCouncilStore>): void {
  const existing = readExecutiveCouncilStore();
  if (existing.councilResponsibilities.length > 0) return;
  writeExecutiveCouncilStore({ ...emptyStore(), ...seed });
}

export function selectExecutiveCouncilWorkspace(id: ExecutiveCouncilWorkspaceId): void {
  const store = readExecutiveCouncilStore();
  writeExecutiveCouncilStore({ ...store, activeWorkspaceId: id });
}
