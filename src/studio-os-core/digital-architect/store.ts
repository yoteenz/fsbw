import {
  DIGITAL_ARCHITECT_STORAGE_KEY,
  DIGITAL_ARCHITECT_VERSION,
  DIGITAL_PHILOSOPHY,
} from './constants';
import type { DigitalArchitectStore, DigitalArchitectWorkspaceId } from './types';

function emptyStore(): DigitalArchitectStore {
  return {
    version: DIGITAL_ARCHITECT_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    companyName: '',
    dashboard: {
      summary: '',
      architectureHealthPct: 0,
      inheritanceCompletenessPct: 0,
      designSystemPct: 0,
      implementationReadinessPct: 0,
      selectedMode: null,
      approvalStatus: 'draft',
    },
    digitalPhilosophy: [...DIGITAL_PHILOSOPHY],
    experienceModes: [],
    hybridArchitectures: [],
    recommendations: [],
    immersivePreviews: [],
    ecosystemProducts: [],
    solutionArchitecture: {
      businessObjectives: [],
      userRoles: [],
      workflows: [],
      integrations: [],
      securityNotes: [],
      performanceNotes: [],
      scalabilityNotes: [],
    },
    experienceInheritance: [],
    designSystem: [],
    applicationArchitecture: {
      informationArchitecture: [],
      navigation: [],
      featureHierarchy: [],
      authModel: '',
      permissions: [],
      databasePlan: [],
      apiPlan: [],
      technicalRoadmap: [],
    },
    aiFeatures: [],
    simulations: [],
    implementationRoadmap: [],
    developerHandoff: [],
    integrations: [],
    launchHandoff: {
      status: 'pending',
      transferredAt: null,
      inheritedAssets: [],
      downstreamTargets: [],
    },
  };
}

function refreshDashboard(store: DigitalArchitectStore): DigitalArchitectStore['dashboard'] {
  const selected = store.experienceModes.find((m) => m.status === 'selected');
  const hybrid = store.hybridArchitectures[0];
  const inheritanceComplete = store.experienceInheritance.filter((i) => i.status === 'complete').length;
  const inheritancePct = store.experienceInheritance.length > 0
    ? Math.round((inheritanceComplete / store.experienceInheritance.length) * 100)
    : 0;
  const designApproved = store.designSystem.filter((d) => d.status === 'approved' || d.status === 'inherited').length;
  const designPct = store.designSystem.length > 0
    ? Math.round((designApproved / store.designSystem.length) * 100)
    : 0;
  const roadmapReady = store.implementationRoadmap.length;

  return {
    ...store.dashboard,
    inheritanceCompletenessPct: inheritancePct,
    designSystemPct: designPct,
    implementationReadinessPct: roadmapReady > 0 ? Math.min(95, 60 + roadmapReady * 5) : 0,
    selectedMode: selected?.id ?? (hybrid ? 'hybrid' : store.dashboard.selectedMode),
  };
}

export function readDigitalArchitectStore(): DigitalArchitectStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(DIGITAL_ARCHITECT_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as DigitalArchitectStore;
    return { ...emptyStore(), ...parsed, version: DIGITAL_ARCHITECT_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeDigitalArchitectStore(store: DigitalArchitectStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    DIGITAL_ARCHITECT_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: DIGITAL_ARCHITECT_VERSION })
  );
}

export function bootstrapDigitalArchitectStore(seed?: Partial<DigitalArchitectStore>): void {
  const existing = readDigitalArchitectStore();
  if (existing.experienceModes.length > 0) return;
  const merged = { ...emptyStore(), ...seed };
  writeDigitalArchitectStore({ ...merged, dashboard: refreshDashboard(merged) });
}

export function selectDigitalArchitectWorkspace(id: DigitalArchitectWorkspaceId): void {
  const store = readDigitalArchitectStore();
  writeDigitalArchitectStore({
    ...store,
    activeWorkspaceId: id,
    dashboard: refreshDashboard({ ...store, activeWorkspaceId: id }),
  });
}
