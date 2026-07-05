import { WORK_HIERARCHY_CHAIN, WORK_ORCHESTRATION_STORAGE_KEY, WORK_ORCHESTRATION_VERSION } from './constants';
import type { TimelineZoom, WorkOrchestrationStore, WorkOrchestrationWorkspaceId } from './types';

function emptyStore(): WorkOrchestrationStore {
  return {
    version: WORK_ORCHESTRATION_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    dashboard: {
      summary: '',
      activeWorkPackages: 0,
      totalActivities: 0,
      blockedActivities: 0,
      automatedActivities: 0,
      founderWorkloadMins: 0,
      operationalHealthPct: 0,
    },
    hierarchyLevels: WORK_HIERARCHY_CHAIN,
    workPackages: [],
    activities: [],
    dependencies: [],
    generationTemplates: [],
    departmentCapacity: [],
    executiveQueues: [],
    founderWorkspace: {
      organizationalPriorities: [],
      leadershipRequired: [],
      strategicApprovals: [],
      majorRisks: [],
      majorOpportunities: [],
      estimatedFounderWorkloadMins: 0,
      briefingSummary: '',
    },
    priorityAdjustments: [],
    timeline: [],
    operationalHealth: {
      executionVelocity: 0,
      organizationalEfficiency: 0,
      departmentHealth: 0,
      resourceUtilization: 0,
      bottleneckScore: 0,
      executionConfidence: 0,
      deliveryRisk: 0,
      overallPct: 0,
      recommendations: [],
    },
    knowledgeContributions: [],
    cosActions: [],
    timelineZoom: 'week',
    selectedWorkPackageId: null,
  };
}

function refreshDashboard(store: WorkOrchestrationStore): WorkOrchestrationStore['dashboard'] {
  const active = store.workPackages.filter((p) => p.status === 'active' || p.status === 'at-risk').length;
  const blocked = store.activities.filter((a) => a.status === 'blocked').length;
  const automated = store.activities.filter((a) => a.automated || a.status === 'automated').length;

  return {
    ...store.dashboard,
    activeWorkPackages: active,
    totalActivities: store.activities.length,
    blockedActivities: blocked,
    automatedActivities: automated,
    founderWorkloadMins: store.founderWorkspace.estimatedFounderWorkloadMins,
    operationalHealthPct: store.operationalHealth.overallPct,
  };
}

export function readWorkOrchestrationStore(): WorkOrchestrationStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(WORK_ORCHESTRATION_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as WorkOrchestrationStore;
    return { ...emptyStore(), ...parsed, version: WORK_ORCHESTRATION_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeWorkOrchestrationStore(store: WorkOrchestrationStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    WORK_ORCHESTRATION_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: WORK_ORCHESTRATION_VERSION })
  );
}

export function bootstrapWorkOrchestrationStore(seed?: Partial<WorkOrchestrationStore>): void {
  const existing = readWorkOrchestrationStore();
  if (existing.workPackages.length > 0) return;
  const merged = { ...emptyStore(), ...seed };
  writeWorkOrchestrationStore({ ...merged, dashboard: refreshDashboard(merged) });
}

export function selectWorkOrchestrationWorkspace(id: WorkOrchestrationWorkspaceId): void {
  const store = readWorkOrchestrationStore();
  const first = store.workPackages.find((p) => p.workspaceId === id);
  writeWorkOrchestrationStore({
    ...store,
    activeWorkspaceId: id,
    selectedWorkPackageId: first?.id ?? null,
  });
}

export function selectWorkOrchestrationPackage(id: string | null): void {
  const store = readWorkOrchestrationStore();
  writeWorkOrchestrationStore({ ...store, selectedWorkPackageId: id });
}

export function setWorkOrchestrationTimelineZoom(zoom: TimelineZoom): void {
  const store = readWorkOrchestrationStore();
  writeWorkOrchestrationStore({ ...store, timelineZoom: zoom });
}

export function refreshWorkOrchestrationDashboard(): void {
  const store = readWorkOrchestrationStore();
  writeWorkOrchestrationStore({ ...store, dashboard: refreshDashboard(store) });
}
