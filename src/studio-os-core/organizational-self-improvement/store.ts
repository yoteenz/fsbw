import {
  ORGANIZATIONAL_SELF_IMPROVEMENT_STORAGE_KEY,
  ORGANIZATIONAL_SELF_IMPROVEMENT_VERSION,
  OSI_IMPROVEMENT_PHILOSOPHY,
} from './constants';
import type {
  OrganizationalSelfImprovementStore,
  OrganizationalSelfImprovementWorkspaceId,
} from './types';

function emptyStore(): OrganizationalSelfImprovementStore {
  return {
    version: ORGANIZATIONAL_SELF_IMPROVEMENT_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    companyName: '',
    dashboard: {
      summary: '',
      organizationalHealthPct: 0,
      recommendedImprovements: 0,
      activeInitiatives: 0,
      learningVelocityPct: 0,
      completedImprovements: 0,
      maturityScorePct: 0,
    },
    improvementPhilosophy: [...OSI_IMPROVEMENT_PHILOSOPHY],
    reflectionDomains: [],
    continuousReflection: [],
    crossFunctionalImprovements: [],
    improvementOpportunities: [],
    organizationalExperiments: [],
    improvementGovernance: [],
    continuousLearning: [],
    maturityDimensions: [],
    chiefOfStaffCoordination: [],
    recommendedNextSteps: [],
    futureOpportunities: [],
  };
}

export function readOrganizationalSelfImprovementStore(): OrganizationalSelfImprovementStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(ORGANIZATIONAL_SELF_IMPROVEMENT_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as OrganizationalSelfImprovementStore;
    return { ...emptyStore(), ...parsed, version: ORGANIZATIONAL_SELF_IMPROVEMENT_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeOrganizationalSelfImprovementStore(store: OrganizationalSelfImprovementStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    ORGANIZATIONAL_SELF_IMPROVEMENT_STORAGE_KEY,
    JSON.stringify({
      ...store,
      lastUpdatedAt: new Date().toISOString(),
      version: ORGANIZATIONAL_SELF_IMPROVEMENT_VERSION,
    })
  );
}

export function bootstrapOrganizationalSelfImprovementStore(
  seed?: Partial<OrganizationalSelfImprovementStore>
): void {
  const existing = readOrganizationalSelfImprovementStore();
  if (existing.improvementOpportunities.length > 0) return;
  writeOrganizationalSelfImprovementStore({ ...emptyStore(), ...seed });
}

export function selectOrganizationalSelfImprovementWorkspace(
  id: OrganizationalSelfImprovementWorkspaceId
): void {
  const store = readOrganizationalSelfImprovementStore();
  writeOrganizationalSelfImprovementStore({ ...store, activeWorkspaceId: id });
}
