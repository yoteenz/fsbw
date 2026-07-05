import {
  RELATIONSHIP_ENGINE_STORAGE_KEY,
  RELATIONSHIP_ENGINE_VERSION,
  RELATIONSHIP_LIFECYCLE_STAGES,
} from './constants';
import type { RelationshipEngineStore, RelationshipEngineWorkspaceId } from './types';

function emptyStore(): RelationshipEngineStore {
  return {
    version: RELATIONSHIP_ENGINE_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    dashboard: {
      summary: '',
      activeRelationships: 0,
      avgHealthPct: 0,
      pendingActions: 0,
      communityLeaders: 0,
      recognitionsDue: 0,
      portfolioRelationships: 0,
      trustTrendPct: 0,
    },
    lifecycleStages: RELATIONSHIP_LIFECYCLE_STAGES,
    relationships: [],
    healthDetails: {},
    nextBestActions: [],
    timelines: [],
    intelligenceSignals: [],
    communities: [],
    communications: [],
    recognitions: [],
    loyaltyIntel: {},
    portfolio: [],
    cosAlerts: [],
    simulations: [],
    institutionalLearning: [],
    selectedRelationshipId: null,
  };
}

function refreshDashboard(store: RelationshipEngineStore): RelationshipEngineStore['dashboard'] {
  const rels = store.relationships.filter((r) => r.workspaceId === store.activeWorkspaceId);
  const healthVals = rels.map((r) => store.healthDetails[r.id]?.overallPct ?? r.relationshipHealthPct).filter(Boolean);
  const avgHealth = healthVals.length > 0 ? Math.round(healthVals.reduce((s, h) => s + h, 0) / healthVals.length) : 0;

  return {
    ...store.dashboard,
    activeRelationships: rels.length,
    avgHealthPct: avgHealth,
    pendingActions: store.nextBestActions.filter((a) =>
      rels.some((r) => r.id === a.relationshipId)
    ).length,
    communityLeaders: rels.filter((r) => r.advocacyScore >= 80).length,
    recognitionsDue: store.recognitions.filter((rec) => !rec.sent).length,
    portfolioRelationships: store.portfolio.length,
  };
}

export function readRelationshipEngineStore(): RelationshipEngineStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(RELATIONSHIP_ENGINE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as RelationshipEngineStore;
    return { ...emptyStore(), ...parsed, version: RELATIONSHIP_ENGINE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeRelationshipEngineStore(store: RelationshipEngineStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    RELATIONSHIP_ENGINE_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: RELATIONSHIP_ENGINE_VERSION })
  );
}

export function bootstrapRelationshipEngineStore(seed?: Partial<RelationshipEngineStore>): void {
  const existing = readRelationshipEngineStore();
  if (existing.relationships.length > 0) return;
  const merged = { ...emptyStore(), ...seed };
  writeRelationshipEngineStore({ ...merged, dashboard: refreshDashboard(merged) });
}

export function selectRelationshipEngineWorkspace(id: RelationshipEngineWorkspaceId): void {
  const store = readRelationshipEngineStore();
  const first = store.relationships.find((r) => r.workspaceId === id);
  writeRelationshipEngineStore({
    ...store,
    activeWorkspaceId: id,
    selectedRelationshipId: first?.id ?? null,
    dashboard: refreshDashboard({ ...store, activeWorkspaceId: id }),
  });
}

export function selectRelationshipEngineRelationship(id: string | null): void {
  const store = readRelationshipEngineStore();
  writeRelationshipEngineStore({ ...store, selectedRelationshipId: id });
}
