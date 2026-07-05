import {
  ODE_DELEGATION_PHILOSOPHY,
  ORGANIZATIONAL_DELEGATION_ENGINE_STORAGE_KEY,
  ORGANIZATIONAL_DELEGATION_ENGINE_VERSION,
} from './constants';
import type { OrganizationalDelegationStore, OrganizationalDelegationWorkspaceId } from './types';

function emptyStore(): OrganizationalDelegationStore {
  return {
    version: ORGANIZATIONAL_DELEGATION_ENGINE_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    companyName: '',
    dashboard: {
      summary: '',
      activeDelegations: 0,
      completedOutcomes: 0,
      pendingFounderDecisions: 0,
      organizationalConfidencePct: 0,
      workflowHealthPct: 0,
      executiveAccountabilityPct: 0,
    },
    delegationPhilosophy: [...ODE_DELEGATION_PHILOSOPHY],
    delegationTypes: [],
    outcomeDelegations: [],
    executiveAssignments: [],
    delegationPlans: [],
    collaborativeExecution: [],
    delegationGovernance: [],
    delegationVisibility: [],
    delegationLearning: [],
    executiveAccountability: [],
    recommendedDelegations: [],
    recommendedNextSteps: [],
    futureOpportunities: [],
  };
}

export function readOrganizationalDelegationStore(): OrganizationalDelegationStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(ORGANIZATIONAL_DELEGATION_ENGINE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as OrganizationalDelegationStore;
    return { ...emptyStore(), ...parsed, version: ORGANIZATIONAL_DELEGATION_ENGINE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeOrganizationalDelegationStore(store: OrganizationalDelegationStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    ORGANIZATIONAL_DELEGATION_ENGINE_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: ORGANIZATIONAL_DELEGATION_ENGINE_VERSION })
  );
}

export function bootstrapOrganizationalDelegationStore(seed?: Partial<OrganizationalDelegationStore>): void {
  const existing = readOrganizationalDelegationStore();
  if (existing.outcomeDelegations.length > 0) return;
  writeOrganizationalDelegationStore({ ...emptyStore(), ...seed });
}

export function selectOrganizationalDelegationWorkspace(id: OrganizationalDelegationWorkspaceId): void {
  const store = readOrganizationalDelegationStore();
  writeOrganizationalDelegationStore({ ...store, activeWorkspaceId: id });
}
