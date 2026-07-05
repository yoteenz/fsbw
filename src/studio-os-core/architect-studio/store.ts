import {
  ARCHITECT_STUDIO_STORAGE_KEY,
  ARCHITECT_STUDIO_VERSION,
  HEADQUARTERS_PHILOSOPHY,
  STUDIO_PHILOSOPHY,
} from './constants';
import type {
  ArchitectStudioId,
  ArchitectStudioStore,
  ArchitectStudioWorkspaceId,
  LivingHeadquarters,
  SpatialNavMode,
} from './types';

function emptyLivingHeadquarters(): LivingHeadquarters {
  return {
    philosophy: [...HEADQUARTERS_PHILOSOPHY],
    morningArrival: [],
    executiveBriefing: {
      preparedBy: 'Chief of Staff',
      organizationalHealthPct: 0,
      majorWins: [],
      majorRisks: [],
      pendingApprovals: [],
      todaysPriorities: [],
      recommendedFocus: '',
      opportunities: [],
      overnightIntelligence: [],
      estimatedFounderWorkload: '',
    },
    executivePresence: [],
    ambientActivity: [],
    overheardConversations: [],
    livingArchitecture: [],
    executiveAvailability: [],
    organizationalRhythm: {
      currentPhase: 'early-morning',
      label: 'EARLY MORNING',
      description: 'Quiet planning · briefing preparation',
      energyPct: 45,
    },
    headquartersCulture: {
      profile: 'Editorial',
      inheritedFrom: [],
      expression: '',
    },
    memorySpaces: [],
  };
}

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
    livingHeadquarters: emptyLivingHeadquarters(),
  };
}

export function readArchitectStudioStore(): ArchitectStudioStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const legacyRaw = localStorage.getItem('studioOsArchitectStudio_v1');
    const raw = localStorage.getItem(ARCHITECT_STUDIO_STORAGE_KEY) ?? legacyRaw;
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ArchitectStudioStore;
    const merged = { ...emptyStore(), ...parsed, version: ARCHITECT_STUDIO_VERSION };
    if (!merged.livingHeadquarters?.morningArrival?.length) {
      merged.livingHeadquarters = emptyLivingHeadquarters();
    }
    return merged;
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
  const fullSeed = { ...emptyStore(), ...seed };
  if (existing.studios.length === 0) {
    writeArchitectStudioStore(fullSeed);
    return;
  }
  if (!existing.livingHeadquarters?.morningArrival?.length && seed?.livingHeadquarters) {
    writeArchitectStudioStore({
      ...existing,
      dashboard: {
        ...existing.dashboard,
        summary: seed.dashboard?.summary ?? existing.dashboard.summary,
      },
      livingHeadquarters: seed.livingHeadquarters,
      futureOpportunities: seed.futureOpportunities ?? existing.futureOpportunities,
      version: ARCHITECT_STUDIO_VERSION,
    });
  }
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
