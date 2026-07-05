import { CAMPAIGN_HIERARCHY_CHAIN, CAMPAIGN_ENGINE_STORAGE_KEY, CAMPAIGN_ENGINE_VERSION } from './constants';
import type { CampaignEngineStore, CampaignWorkspaceId } from './types';

function emptyStore(): CampaignEngineStore {
  return {
    version: CAMPAIGN_ENGINE_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    dashboard: {
      summary: '',
      activeCampaigns: 0,
      deliverablesInProduction: 0,
      avgHealthPct: 0,
      totalBudgetAllocated: '$0',
      experimentsRunning: 0,
    },
    hierarchyLevels: CAMPAIGN_HIERARCHY_CHAIN,
    campaigns: [],
    deliverables: [],
    departmentCoordination: [],
    creatorRecommendations: [],
    experiments: [],
    analytics: {},
    healthScores: {},
    intelligence: {},
    simulations: {},
    retrospectives: [],
    calendar: [],
    inheritanceOptions: [],
    playbooks: [],
    builderStep: 0,
    selectedCampaignId: null,
  };
}

function refreshDashboard(store: CampaignEngineStore): CampaignEngineStore['dashboard'] {
  const active = store.campaigns.filter((c) => c.status === 'active' || c.status === 'planning');
  const inProduction = store.deliverables.filter((d) => d.status === 'in-production' || d.status === 'review').length;
  const healthVals = Object.values(store.healthScores);
  const avgHealth =
    healthVals.length > 0 ? Math.round(healthVals.reduce((s, h) => s + h.overallPct, 0) / healthVals.length) : 0;
  const experimentsRunning = store.experiments.filter((e) => e.status === 'running').length;

  return {
    ...store.dashboard,
    activeCampaigns: active.length,
    deliverablesInProduction: inProduction,
    avgHealthPct: avgHealth,
    experimentsRunning,
  };
}

export function readCampaignEngineStore(): CampaignEngineStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(CAMPAIGN_ENGINE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as CampaignEngineStore;
    return { ...emptyStore(), ...parsed, version: CAMPAIGN_ENGINE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeCampaignEngineStore(store: CampaignEngineStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    CAMPAIGN_ENGINE_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: CAMPAIGN_ENGINE_VERSION })
  );
}

export function bootstrapCampaignEngineStore(seed?: Partial<CampaignEngineStore>): void {
  const existing = readCampaignEngineStore();
  if (existing.campaigns.length > 0) return;
  const merged = { ...emptyStore(), ...seed };
  writeCampaignEngineStore({ ...merged, dashboard: refreshDashboard(merged) });
}

export function selectCampaignEngineWorkspace(id: CampaignWorkspaceId): void {
  const store = readCampaignEngineStore();
  const first = store.campaigns.find((c) => c.workspaceId === id);
  writeCampaignEngineStore({
    ...store,
    activeWorkspaceId: id,
    selectedCampaignId: first?.id ?? null,
  });
}

export function selectCampaignEngineCampaign(id: string | null): void {
  const store = readCampaignEngineStore();
  writeCampaignEngineStore({ ...store, selectedCampaignId: id });
}

export function setCampaignBuilderStep(step: number): void {
  const store = readCampaignEngineStore();
  writeCampaignEngineStore({ ...store, builderStep: Math.max(0, Math.min(11, step)) });
}

export function refreshCampaignEngineDashboard(): void {
  const store = readCampaignEngineStore();
  writeCampaignEngineStore({ ...store, dashboard: refreshDashboard(store) });
}
