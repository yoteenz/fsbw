import {
  READER_GRAPH_STORAGE_KEY,
  READER_GRAPH_VERSION,
  READER_JOURNEY_STAGES,
  RELATIONSHIP_PHILOSOPHY,
} from './constants';
import type { GraphZoomLevel, ReaderGraphStore, ReaderGraphWorkspaceId } from './types';

function emptyStore(): ReaderGraphStore {
  return {
    version: READER_GRAPH_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    graphZoom: 'company',
    dashboard: {
      summary: '',
      totalReaders: 0,
      activeRelationships: 0,
      avgHealthPct: 0,
      topAdvocates: 0,
      emergingCommunities: 0,
      crossCompanyReaders: 0,
      relationshipGrowthPct: 0,
    },
    relationshipPhilosophy: [...RELATIONSHIP_PHILOSOPHY],
    journeyStages: READER_JOURNEY_STAGES,
    readers: [],
    relationshipHealth: {},
    timelines: [],
    interests: [],
    behaviorIntel: [],
    communities: [],
    intelligenceSignals: [],
    recommendations: [],
    crossCompany: [],
    creatorOpportunities: [],
    simulations: [],
    graphNodes: [],
    privacyControls: [],
    selectedReaderId: null,
  };
}

function refreshDashboard(store: ReaderGraphStore): ReaderGraphStore['dashboard'] {
  const readers = store.readers.filter((r) => r.workspaceId === store.activeWorkspaceId);
  const healthVals = readers.map((r) => store.relationshipHealth[r.id]?.overallPct ?? 0).filter(Boolean);
  const avgHealth = healthVals.length > 0 ? Math.round(healthVals.reduce((s, h) => s + h, 0) / healthVals.length) : 0;
  const advocates = readers.filter((r) =>
    ['advocate', 'ambassador', 'partner', 'mentor'].includes(r.relationshipStage)
  ).length;

  return {
    ...store.dashboard,
    totalReaders: readers.length,
    activeRelationships: readers.filter((r) => r.engagementScore >= 60).length,
    avgHealthPct: avgHealth,
    topAdvocates: advocates,
    emergingCommunities: store.communities.filter((c) => c.workspaceId === store.activeWorkspaceId).length,
    crossCompanyReaders: store.crossCompany.length,
  };
}

export function readReaderGraphStore(): ReaderGraphStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(READER_GRAPH_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ReaderGraphStore;
    return { ...emptyStore(), ...parsed, version: READER_GRAPH_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeReaderGraphStore(store: ReaderGraphStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    READER_GRAPH_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: READER_GRAPH_VERSION })
  );
}

export function bootstrapReaderGraphStore(seed?: Partial<ReaderGraphStore>): void {
  const existing = readReaderGraphStore();
  if (existing.readers.length > 0) return;
  const merged = { ...emptyStore(), ...seed };
  writeReaderGraphStore({ ...merged, dashboard: refreshDashboard(merged) });
}

export function selectReaderGraphWorkspace(id: ReaderGraphWorkspaceId): void {
  const store = readReaderGraphStore();
  const first = store.readers.find((r) => r.workspaceId === id);
  writeReaderGraphStore({
    ...store,
    activeWorkspaceId: id,
    selectedReaderId: first?.id ?? null,
    dashboard: refreshDashboard({ ...store, activeWorkspaceId: id }),
  });
}

export function selectReaderGraphReader(id: string | null): void {
  const store = readReaderGraphStore();
  writeReaderGraphStore({ ...store, selectedReaderId: id });
}

export function setReaderGraphZoom(zoom: GraphZoomLevel): void {
  const store = readReaderGraphStore();
  writeReaderGraphStore({ ...store, graphZoom: zoom });
}
