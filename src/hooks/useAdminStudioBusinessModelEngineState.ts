import {useCallback, useMemo, useState} from 'react';
import { AI_MEDIA_WORKSPACE_ID } from '../studio-os-core/ai-media-network/constants';
import {
  bootstrapBusinessModelEngineStore,
  getWorkspaceBilling,
  mergeBusinessModelEnginePatch,
  readBusinessModelEngineStore,
} from '../studio-os-core/business-model-engine/store';
import { summarizeStoreEconomics } from '../studio-os-core/business-model-engine/economicsEngine';
import { TIER_CAPABILITIES } from '../studio-os-core/business-model-engine/constants';
import { buildDemoBusinessModelEngineStorePatch } from '../utils/adminStudioBusinessModelEngineDemo';

function ensureDemoSeeded(): void {
  bootstrapBusinessModelEngineStore();
  const store = readBusinessModelEngineStore();
  if (store.workspaceBilling.length === 0) {
    mergeBusinessModelEnginePatch(buildDemoBusinessModelEngineStorePatch());
  }
}

export function useAdminStudioBusinessModelEngineState() {
  const [version, setVersion] = useState(() => {
    ensureDemoSeeded();
    return 0;
  });
  const refresh = useCallback(() => {
    ensureDemoSeeded();
    setVersion((v) => v + 1);
  }, []);

  const store = useMemo(() => {
    void version;
    return readBusinessModelEngineStore();
  }, [version]);

  const workspaceId = AI_MEDIA_WORKSPACE_ID;
  const billing = getWorkspaceBilling(workspaceId);
  const usageMetrics = store.usageMetrics.filter((u) => u.workspaceId === workspaceId);
  const payments = store.payments.filter((p) => p.workspaceId === workspaceId);
  const wallets = store.wallets.filter((w) => w.workspaceId === workspaceId);
  const affiliatePrograms = store.affiliatePrograms.filter((a) => a.workspaceId === workspaceId);
  const royalties = store.royalties.filter((r) => r.workspaceId === workspaceId);
  const assetListings = store.assetListings.filter((l) => l.workspaceId === workspaceId);
  const economics = useMemo(() => summarizeStoreEconomics(store), [store]);

  const tierCapabilities = billing ? TIER_CAPABILITIES[billing.tier] : TIER_CAPABILITIES.free;

  return {
    workspaceId,
    store,
    billing,
    tierCapabilities,
    usageMetrics,
    platformFees: store.platformFees,
    payments,
    wallets,
    affiliatePrograms,
    royalties,
    assetListings,
    appEcosystem: store.appEcosystem,
    certifications: store.certifications,
    enterpriseLicenses: store.enterpriseLicenses,
    economics,
    pricingScenarios: store.pricingScenarios,
    ecosystemHealth: store.ecosystemHealth,
    refresh,
  };
}
