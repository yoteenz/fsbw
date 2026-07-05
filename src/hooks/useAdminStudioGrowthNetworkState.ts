import {useCallback, useMemo, useState} from 'react';
import { scopeStorageKey, getRuntimeActiveWorkspaceId } from '../studio-os-core/workspace/storage';
import {
  bootstrapGrowthProfiles,
  getGrowthProfile,
  readGrowthNetworkStore,
  refreshOpportunitiesForWorkspace,
  registerOpportunityCatalog,
  syncRecommendationsForWorkspace,
  upsertGrowthProfile,
  writeGrowthNetworkStore,
  type GrowthProfile,
} from '../studio-os-core/growth-network';
import {
  buildDemoGrowthStorePatch,
  OPPORTUNITY_CATALOG,
} from '../utils/adminStudioGrowthNetworkDemo';

const GROWTH_NETWORK_ACTIVE_WS_KEY = 'adminStudioGrowthNetworkActiveWs_v1';

function readActiveWorkspaceOverride(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(scopeStorageKey(GROWTH_NETWORK_ACTIVE_WS_KEY, getRuntimeActiveWorkspaceId()));
}

function ensureDemoSeeded(): void {
  registerOpportunityCatalog(OPPORTUNITY_CATALOG);
  bootstrapGrowthProfiles();
  const store = readGrowthNetworkStore();
  if (store.registry.length === 0) {
    writeGrowthNetworkStore({ ...store, ...buildDemoGrowthStorePatch() });
  }
  const ws = readActiveWorkspaceOverride() ?? getRuntimeActiveWorkspaceId();
  syncRecommendationsForWorkspace(ws);
}

export function useAdminStudioGrowthNetworkState(workspaceIdOverride?: string) {
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => {
    ensureDemoSeeded();
    setVersion((v) => v + 1);
  }, []);

  const workspaceId = workspaceIdOverride ?? readActiveWorkspaceOverride() ?? getRuntimeActiveWorkspaceId();

  const store = useMemo(() => {
    void version;
    return readGrowthNetworkStore();
  }, [version]);

  const profile = store.profiles[workspaceId] ?? getGrowthProfile(workspaceId);
  const opportunities = useMemo(
    () => refreshOpportunitiesForWorkspace(workspaceId),
    [store, workspaceId, version]
  );
  const recommendations = store.recommendations.filter((r) => r.workspaceId === workspaceId);
  const partnerships = store.partnerships.filter((p) => p.workspaceId === workspaceId);
  const contracts = store.contracts.filter((c) => c.workspaceId === workspaceId);
  const revenue = store.revenueStreams.filter((r) => r.workspaceId === workspaceId);

  const updateProfile = useCallback(
    (patch: Partial<GrowthProfile>) => {
      if (!profile) return;
      upsertGrowthProfile({ ...profile, ...patch, workspaceId: profile.workspaceId });
      syncRecommendationsForWorkspace(profile.workspaceId);
      refresh();
    },
    [profile, refresh]
  );

  const monthlyRevenue = revenue.reduce((s, r) => s + r.monthlyAmount, 0);
  const annualRevenue = revenue.reduce((s, r) => s + r.annualAmount, 0);

  return {
    workspaceId,
    store,
    profile,
    opportunities,
    recommendations,
    partnerships,
    contracts,
    revenue,
    monthlyRevenue,
    annualRevenue,
    registry: store.registry,
    serviceProviders: store.serviceProviders,
    updateProfile,
    refresh,
  };
}
