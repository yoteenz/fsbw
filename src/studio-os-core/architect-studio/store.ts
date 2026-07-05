import {
  ARCHITECT_STUDIO_STORAGE_KEY,
  ARCHITECT_STUDIO_VERSION,
  STUDIO_PHILOSOPHY,
} from './constants';
import type { ArchitectStudioId, ArchitectStudioStore, ArchitectStudioWorkspaceId, SpatialNavMode } from './types';

function emptyStore(): ArchitectStudioStore {
  return {
    version: ARCHITECT_STUDIO_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    companyName: '',
    dashboard: {
      summary: '',
      studioHealthPct: 0,
      activeProjects: 0,
      collaborationScorePct: 0,
      innovationPct: 0,
      genomeSyncPct: 0,
      activeSpatialMode: 'campus',
      focusedStudioId: null,
    },
    studioPhilosophy: [...STUDIO_PHILOSOPHY],
    studios: [],
    collaborationForum: {
      summary: '',
      activeParticipants: [],
      pendingDecisions: 0,
      lastGathering: '',
    },
    livingActivities: [],
    architectCollaborations: [],
    evolutionWall: [],
    innovationLab: [],
    intelligenceGuides: [],
    personalization: {
      architecture: 'Modern minimal atelier',
      lighting: 'Bright natural daylight',
      materials: 'White oak · brushed steel · marble',
      ambientSound: 'Calm innovation studio',
      theme: 'Luxury futurist',
    },
    portfolioCampus: [],
    recommendedNextSteps: [],
    futureOpportunities: [],
  };
}

export function readArchitectStudioStore(): ArchitectStudioStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(ARCHITECT_STUDIO_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ArchitectStudioStore;
    return { ...emptyStore(), ...parsed, version: ARCHITECT_STUDIO_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeArchitectStudioStore(store: ArchitectStudioStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    ARCHITECT_STUDIO_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: ARCHITECT_STUDIO_VERSION })
  );
}

export function bootstrapArchitectStudioStore(seed?: Partial<ArchitectStudioStore>): void {
  const existing = readArchitectStudioStore();
  if (existing.studios.length > 0) return;
  writeArchitectStudioStore({ ...emptyStore(), ...seed });
}

export function selectArchitectStudioWorkspace(id: ArchitectStudioWorkspaceId): void {
  const store = readArchitectStudioStore();
  writeArchitectStudioStore({ ...store, activeWorkspaceId: id });
}

export function setSpatialNavMode(mode: SpatialNavMode): void {
  const store = readArchitectStudioStore();
  writeArchitectStudioStore({
    ...store,
    dashboard: { ...store.dashboard, activeSpatialMode: mode },
  });
}

export function focusArchitectStudio(studioId: ArchitectStudioId | null): void {
  const store = readArchitectStudioStore();
  writeArchitectStudioStore({
    ...store,
    dashboard: {
      ...store.dashboard,
      focusedStudioId: studioId,
      activeSpatialMode: studioId ? 'studio' : store.dashboard.activeSpatialMode,
    },
  });
}
