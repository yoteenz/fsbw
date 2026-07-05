import {
  OAF_AUTONOMY_PHILOSOPHY,
  OAF_FOUNDER_RESERVED,
  ORGANIZATIONAL_AUTONOMY_FRAMEWORK_STORAGE_KEY,
  ORGANIZATIONAL_AUTONOMY_FRAMEWORK_VERSION,
} from './constants';
import type { OrganizationalAutonomyStore, OrganizationalAutonomyWorkspaceId } from './types';

function emptyStore(): OrganizationalAutonomyStore {
  return {
    version: ORGANIZATIONAL_AUTONOMY_FRAMEWORK_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    companyName: '',
    dashboard: {
      summary: '',
      organizationalAutonomyLevel: 0,
      trustScorePct: 0,
      activeWorkflows: 0,
      recentAutonomousDecisions: 0,
      pendingApprovals: 0,
      executiveConfidencePct: 0,
      workflowHealthPct: 0,
    },
    autonomyPhilosophy: [...OAF_AUTONOMY_PHILOSOPHY],
    autonomyLevels: [],
    autonomyGovernance: [],
    founderPermissions: [],
    trustEngine: [],
    executiveCoordination: [],
    autonomousWorkflows: [],
    autonomousActions: [],
    learningLoop: [],
    autonomyUpgrades: [],
    founderReservedDecisions: [...OAF_FOUNDER_RESERVED],
    recommendedNextSteps: [],
    futureOpportunities: [],
  };
}

export function readOrganizationalAutonomyStore(): OrganizationalAutonomyStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(ORGANIZATIONAL_AUTONOMY_FRAMEWORK_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as OrganizationalAutonomyStore;
    return { ...emptyStore(), ...parsed, version: ORGANIZATIONAL_AUTONOMY_FRAMEWORK_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeOrganizationalAutonomyStore(store: OrganizationalAutonomyStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    ORGANIZATIONAL_AUTONOMY_FRAMEWORK_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: ORGANIZATIONAL_AUTONOMY_FRAMEWORK_VERSION })
  );
}

export function bootstrapOrganizationalAutonomyStore(seed?: Partial<OrganizationalAutonomyStore>): void {
  const existing = readOrganizationalAutonomyStore();
  if (existing.autonomyLevels.length > 0) return;
  writeOrganizationalAutonomyStore({ ...emptyStore(), ...seed });
}

export function selectOrganizationalAutonomyWorkspace(id: OrganizationalAutonomyWorkspaceId): void {
  const store = readOrganizationalAutonomyStore();
  writeOrganizationalAutonomyStore({ ...store, activeWorkspaceId: id });
}
