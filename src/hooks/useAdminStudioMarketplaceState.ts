import { useCallback, useMemo, useState } from 'react';
import { AI_MEDIA_WORKSPACE_ID } from '../studio-os-core/ai-media-network/constants';
import {
  bootstrapMarketplaceStore,
  getParticipantsForWorkspace,
  mergeMarketplacePatch,
  readMarketplaceStore,
  refreshMarketplaceIntelligence,
} from '../studio-os-core/marketplace/store';
import { buildDemoMarketplaceStorePatch } from '../utils/adminStudioMarketplaceDemo';

function ensureDemoSeeded(): void {
  bootstrapMarketplaceStore();
  const store = readMarketplaceStore();
  if (store.participants.length === 0) {
    mergeMarketplacePatch(buildDemoMarketplaceStorePatch());
    refreshMarketplaceIntelligence(AI_MEDIA_WORKSPACE_ID);
  }
}

export function useAdminStudioMarketplaceState() {
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => {
    ensureDemoSeeded();
    setVersion((v) => v + 1);
  }, []);

  const store = useMemo(() => {
    void version;
    ensureDemoSeeded();
    return readMarketplaceStore();
  }, [version]);

  const workspaceId = AI_MEDIA_WORKSPACE_ID;
  const participants = useMemo(() => getParticipantsForWorkspace(workspaceId), [store, workspaceId]);
  const matches = store.matches.filter((m) => m.workspaceId === workspaceId);
  const deals = store.deals.filter((d) => d.workspaceId === workspaceId);
  const collaborationHubs = store.collaborationHubs.filter((h) => h.workspaceId === workspaceId);
  const payments = store.payments.filter((p) => p.workspaceId === workspaceId);
  const ecosystemRecommendations = store.ecosystemRecommendations.filter((r) => r.workspaceId === workspaceId);

  const verifiedCount = participants.filter((p) => p.verified).length;
  const avgTrustScore =
    participants.length > 0
      ? Math.round((participants.reduce((s, p) => s + p.trustScore.overall, 0) / participants.length) * 10) / 10
      : 0;
  const activeDeals = deals.filter((d) => d.stage !== 'completed');
  const renewalEligible = deals.filter((d) => d.renewalEligible);
  const totalDealValue = deals.reduce((s, d) => s + d.value, 0);

  return {
    workspaceId,
    store,
    participants,
    matches,
    deals,
    activeDeals,
    renewalEligible,
    collaborationHubs,
    payments,
    ecosystemRecommendations,
    verifiedCount,
    avgTrustScore,
    totalDealValue,
    refresh,
  };
}
