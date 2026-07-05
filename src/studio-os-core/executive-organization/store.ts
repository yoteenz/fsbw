import {
  EXECUTIVE_ORGANIZATION_STORAGE_KEY,
  EXECUTIVE_ORGANIZATION_VERSION,
  ORG_HIERARCHY_CHAIN,
} from './constants';
import type { ExecutiveId, ExecutiveOrganizationStore } from './types';

function emptyStore(): ExecutiveOrganizationStore {
  return {
    version: EXECUTIVE_ORGANIZATION_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    dashboard: {
      summary: '',
      executiveCount: 0,
      departmentCount: 0,
      teamCount: 0,
      workerCount: 0,
      activeCollaborations: 0,
      overallOrgHealthPct: 0,
      cultureMaturityPct: 0,
    },
    hierarchyLevels: ORG_HIERARCHY_CHAIN,
    executives: [],
    departments: [],
    workers: [],
    collaborations: [],
    organizationalMemory: [],
    meetings: [],
    orgGraph: [],
    companyCulture: {
      mission: '',
      vision: '',
      values: [],
      leadershipPrinciples: [],
      brandPhilosophy: [],
      decisionPhilosophy: [],
      operatingPrinciples: [],
      traditions: [],
    },
    successionPackages: [],
    selectedExecutiveId: null,
    selectedDepartmentId: null,
  };
}

function refreshDashboard(store: ExecutiveOrganizationStore): ExecutiveOrganizationStore['dashboard'] {
  const teamCount = store.departments.reduce((s, d) => s + d.teams.length, 0);
  const avgHealth =
    store.executives.length > 0
      ? Math.round(store.executives.reduce((s, e) => s + e.departmentHealthPct, 0) / store.executives.length)
      : 0;

  return {
    ...store.dashboard,
    executiveCount: store.executives.length,
    departmentCount: store.departments.length,
    teamCount,
    workerCount: store.workers.length,
    activeCollaborations: store.collaborations.filter((c) => c.status !== 'complete').length,
    overallOrgHealthPct: avgHealth,
  };
}

export function readExecutiveOrganizationStore(): ExecutiveOrganizationStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(EXECUTIVE_ORGANIZATION_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ExecutiveOrganizationStore;
    return { ...emptyStore(), ...parsed, version: EXECUTIVE_ORGANIZATION_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeExecutiveOrganizationStore(store: ExecutiveOrganizationStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    EXECUTIVE_ORGANIZATION_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: EXECUTIVE_ORGANIZATION_VERSION })
  );
}

export function bootstrapExecutiveOrganizationStore(seed?: Partial<ExecutiveOrganizationStore>): void {
  const existing = readExecutiveOrganizationStore();
  if (existing.executives.length > 0) return;
  const merged = { ...emptyStore(), ...seed };
  writeExecutiveOrganizationStore({ ...merged, dashboard: refreshDashboard(merged) });
}

export function selectExecutiveOrganizationExecutive(id: ExecutiveId | null): void {
  const store = readExecutiveOrganizationStore();
  const dept = id ? store.departments.find((d) => d.executiveId === id) : null;
  writeExecutiveOrganizationStore({
    ...store,
    selectedExecutiveId: id,
    selectedDepartmentId: dept?.id ?? null,
  });
}

export function selectExecutiveOrganizationDepartment(id: string | null): void {
  const store = readExecutiveOrganizationStore();
  writeExecutiveOrganizationStore({ ...store, selectedDepartmentId: id });
}

export function refreshExecutiveOrganizationDashboard(): void {
  const store = readExecutiveOrganizationStore();
  writeExecutiveOrganizationStore({ ...store, dashboard: refreshDashboard(store) });
}
