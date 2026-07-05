import {
  KNOWLEDGE_ASSET_ENGINE_STORAGE_KEY,
  KNOWLEDGE_ASSET_ENGINE_VERSION,
  KNOWLEDGE_ASSET_TYPES,
  KNOWLEDGE_PHILOSOPHY,
  MATURITY_STAGES,
} from './constants';
import type { KnowledgeAssetEngineStore, KnowledgeAssetWorkspaceId } from './types';

function emptyStore(): KnowledgeAssetEngineStore {
  return {
    version: KNOWLEDGE_ASSET_ENGINE_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    dashboard: {
      summary: '',
      totalAssets: 0,
      canonicalSources: 0,
      avgMaturityPct: 0,
      derivedFormats: 0,
      academyPaths: 0,
      knowledgeHealthPct: 0,
    },
    knowledgePhilosophy: [...KNOWLEDGE_PHILOSOPHY],
    assetTypes: KNOWLEDGE_ASSET_TYPES,
    maturityStages: MATURITY_STAGES,
    assets: [],
    singleSourceOfTruth: [],
    evolutions: [],
    lineage: [],
    maturityMetrics: [],
    relationships: [],
    transformations: [],
    intelligenceRecs: [],
    revenue: {},
    academyPaths: [],
    executiveLinks: [],
    inheritancePackages: [],
    health: {
      overallPct: 0,
      connectedAssetsPct: 0,
      orphanedAssets: 0,
      staleAssets: 0,
      avgMaturityPct: 0,
      revenueGenerating: 0,
    },
    selectedAssetId: null,
  };
}

function refreshDashboard(store: KnowledgeAssetEngineStore): KnowledgeAssetEngineStore['dashboard'] {
  const assets = store.assets.filter((a) => a.workspaceId === store.activeWorkspaceId);
  const avgMaturity = assets.length > 0
    ? Math.round(assets.reduce((s, a) => s + a.knowledgeMaturityPct, 0) / assets.length)
    : 0;
  const derived = store.singleSourceOfTruth.reduce((s, ssot) => s + ssot.derivedAssets.length, 0);

  return {
    ...store.dashboard,
    totalAssets: assets.length,
    canonicalSources: store.singleSourceOfTruth.length,
    avgMaturityPct: avgMaturity,
    derivedFormats: derived,
    academyPaths: store.academyPaths.length,
  };
}

export function readKnowledgeAssetEngineStore(): KnowledgeAssetEngineStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(KNOWLEDGE_ASSET_ENGINE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as KnowledgeAssetEngineStore;
    return { ...emptyStore(), ...parsed, version: KNOWLEDGE_ASSET_ENGINE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeKnowledgeAssetEngineStore(store: KnowledgeAssetEngineStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    KNOWLEDGE_ASSET_ENGINE_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: KNOWLEDGE_ASSET_ENGINE_VERSION })
  );
}

export function bootstrapKnowledgeAssetEngineStore(seed?: Partial<KnowledgeAssetEngineStore>): void {
  const existing = readKnowledgeAssetEngineStore();
  if (existing.assets.length > 0) return;
  const merged = { ...emptyStore(), ...seed };
  writeKnowledgeAssetEngineStore({ ...merged, dashboard: refreshDashboard(merged) });
}

export function selectKnowledgeAssetEngineWorkspace(id: KnowledgeAssetWorkspaceId): void {
  const store = readKnowledgeAssetEngineStore();
  const first = store.assets.find((a) => a.workspaceId === id);
  writeKnowledgeAssetEngineStore({
    ...store,
    activeWorkspaceId: id,
    selectedAssetId: first?.id ?? store.selectedAssetId,
    dashboard: refreshDashboard({ ...store, activeWorkspaceId: id }),
  });
}

export function selectKnowledgeAsset(id: string | null): void {
  const store = readKnowledgeAssetEngineStore();
  writeKnowledgeAssetEngineStore({ ...store, selectedAssetId: id });
}
