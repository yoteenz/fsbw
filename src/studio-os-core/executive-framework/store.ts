import {
  EXECUTIVE_FRAMEWORK_STORAGE_KEY,
  EXECUTIVE_FRAMEWORK_VERSION,
  EXECUTIVE_PHILOSOPHY,
  EXECUTIVE_STANDARDS,
} from './constants';
import type { ExecutiveFrameworkStore, ExecutiveFrameworkWorkspaceId } from './types';

function emptyStore(): ExecutiveFrameworkStore {
  return {
    version: EXECUTIVE_FRAMEWORK_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    companyName: '',
    dashboard: {
      summary: '',
      activeExecutives: 0,
      activeCollaborations: 0,
      recommendationPipeline: 0,
      executiveHealthPct: 0,
      organizationalAlignmentPct: 0,
      futureRolesPrepared: 0,
    },
    executivePhilosophy: [...EXECUTIVE_PHILOSOPHY],
    executiveStandards: [...EXECUTIVE_STANDARDS],
    identityInheritance: [],
    decisionCriteria: [],
    collaborations: [],
    institutionalMemory: [],
    executiveWorkspaces: [],
    accountability: [],
    recommendationPipeline: [],
    futureExecutives: [],
    leadershipMap: [],
    organizationalPriorities: [],
    recommendedNextSteps: [],
    futureOpportunities: [],
  };
}

export function readExecutiveFrameworkStore(): ExecutiveFrameworkStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(EXECUTIVE_FRAMEWORK_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ExecutiveFrameworkStore;
    return { ...emptyStore(), ...parsed, version: EXECUTIVE_FRAMEWORK_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeExecutiveFrameworkStore(store: ExecutiveFrameworkStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    EXECUTIVE_FRAMEWORK_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: EXECUTIVE_FRAMEWORK_VERSION })
  );
}

export function bootstrapExecutiveFrameworkStore(seed?: Partial<ExecutiveFrameworkStore>): void {
  const existing = readExecutiveFrameworkStore();
  if (existing.leadershipMap.length > 0) return;
  writeExecutiveFrameworkStore({ ...emptyStore(), ...seed });
}

export function selectExecutiveFrameworkWorkspace(id: ExecutiveFrameworkWorkspaceId): void {
  const store = readExecutiveFrameworkStore();
  writeExecutiveFrameworkStore({ ...store, activeWorkspaceId: id });
}
