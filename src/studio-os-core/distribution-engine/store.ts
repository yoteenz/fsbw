import { DISTRIBUTION_ENGINE_STORAGE_KEY, DISTRIBUTION_ENGINE_VERSION, DISTRIBUTION_HIERARCHY_CHAIN } from './constants';
import type { DistributionEngineStore, DistributionWorkspaceId } from './types';

function emptyStore(): DistributionEngineStore {
  return {
    version: DISTRIBUTION_ENGINE_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    dashboard: {
      summary: '',
      knowledgeAssets: 0,
      formatsGenerated: 0,
      scheduledThisWeek: 0,
      evergreenActive: 0,
      avgHealthPct: 0,
      knowledgeReach: '0',
    },
    hierarchyLevels: DISTRIBUTION_HIERARCHY_CHAIN,
    knowledgeAssets: [],
    strategies: [],
    adaptations: [],
    intelligenceRecs: [],
    calendar: [],
    evergreen: [],
    collections: [],
    audienceSegments: [],
    creatorRecs: [],
    simulations: [],
    performance: {},
    feedback: [],
    lineage: [],
    crossCompany: [],
    health: {
      executionVelocity: 0,
      channelEfficiency: 0,
      formatCoverage: 0,
      evergreenUtilization: 0,
      knowledgeLongevity: 0,
      overallPct: 0,
      bottlenecks: [],
      recommendations: [],
    },
    selectedAssetId: null,
  };
}

function refreshDashboard(store: DistributionEngineStore): DistributionEngineStore['dashboard'] {
  const assets = store.knowledgeAssets.filter((a) => a.workspaceId === store.activeWorkspaceId);
  const adaptations = store.adaptations.filter((a) => assets.some((asset) => asset.id === a.assetId));
  const scheduled = store.calendar.filter((c) => c.status === 'scheduled' || c.status === 'publishing');

  return {
    ...store.dashboard,
    knowledgeAssets: assets.length,
    formatsGenerated: adaptations.filter((a) => a.status === 'ready' || a.status === 'published').length,
    scheduledThisWeek: scheduled.length,
    evergreenActive: store.evergreen.length,
    avgHealthPct: store.health.overallPct,
  };
}

export function readDistributionEngineStore(): DistributionEngineStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(DISTRIBUTION_ENGINE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as DistributionEngineStore;
    return { ...emptyStore(), ...parsed, version: DISTRIBUTION_ENGINE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeDistributionEngineStore(store: DistributionEngineStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    DISTRIBUTION_ENGINE_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: DISTRIBUTION_ENGINE_VERSION })
  );
}

export function bootstrapDistributionEngineStore(seed?: Partial<DistributionEngineStore>): void {
  const existing = readDistributionEngineStore();
  if (existing.knowledgeAssets.length > 0) return;
  const merged = { ...emptyStore(), ...seed };
  writeDistributionEngineStore({ ...merged, dashboard: refreshDashboard(merged) });
}

export function selectDistributionEngineWorkspace(id: DistributionWorkspaceId): void {
  const store = readDistributionEngineStore();
  const first = store.knowledgeAssets.find((a) => a.workspaceId === id);
  writeDistributionEngineStore({
    ...store,
    activeWorkspaceId: id,
    selectedAssetId: first?.id ?? null,
    dashboard: refreshDashboard({ ...store, activeWorkspaceId: id }),
  });
}

export function selectDistributionEngineAsset(id: string | null): void {
  const store = readDistributionEngineStore();
  writeDistributionEngineStore({ ...store, selectedAssetId: id });
}
