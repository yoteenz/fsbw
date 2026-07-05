import { FOUNDER_WALK_STORAGE_KEY, FOUNDER_WALK_VERSION, WALK_PHILOSOPHY } from './constants';
import type { FounderWalkStore, FounderWalkWorkspaceId, TimelineEra } from './types';

function emptyStore(): FounderWalkStore {
  return {
    version: FOUNDER_WALK_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    companyName: '',
    dashboard: {
      summary: '',
      pathLengthMilestones: 0,
      reflectionSpaces: 0,
      preservedMemories: 0,
      activeTimelineEra: 'day-one',
      landscapeMaturityPct: 0,
      legacyDepthPct: 0,
    },
    walkPhilosophy: [...WALK_PHILOSOPHY],
    dayOnePath: { description: '', atmosphere: '' },
    pathwayMilestones: [],
    memoryMarkers: [],
    reflectionSpaces: [],
    livingLandscape: [],
    organizationalConnections: [],
    futureGenerations: [],
    familyLegacy: [],
    portfolioLegacy: [],
    memoryIntelligence: [],
    campusIntegration: [],
    recommendedNextSteps: [],
    futureOpportunities: [],
  };
}

export function readFounderWalkStore(): FounderWalkStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(FOUNDER_WALK_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as FounderWalkStore;
    return { ...emptyStore(), ...parsed, version: FOUNDER_WALK_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeFounderWalkStore(store: FounderWalkStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    FOUNDER_WALK_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: FOUNDER_WALK_VERSION })
  );
}

export function bootstrapFounderWalkStore(seed?: Partial<FounderWalkStore>): void {
  const existing = readFounderWalkStore();
  if (existing.pathwayMilestones.length > 0) return;
  writeFounderWalkStore({ ...emptyStore(), ...seed });
}

export function selectFounderWalkWorkspace(id: FounderWalkWorkspaceId): void {
  const store = readFounderWalkStore();
  writeFounderWalkStore({ ...store, activeWorkspaceId: id });
}

export function setFounderWalkTimelineEra(era: TimelineEra): void {
  const store = readFounderWalkStore();
  writeFounderWalkStore({
    ...store,
    dashboard: { ...store.dashboard, activeTimelineEra: era },
  });
}
