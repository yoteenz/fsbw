import { useCallback, useMemo, useState } from 'react';
import { AI_MEDIA_WORKSPACE_ID } from '../studio-os-core/ai-media-network/constants';
import {
  bootstrapTalentNetworkStore,
  getTalentsForWorkspace,
  mergeTalentNetworkPatch,
  readTalentNetworkStore,
  refreshTalentScores,
} from '../studio-os-core/talent-network/store';
import { buildDemoTalentNetworkStorePatch } from '../utils/adminStudioTalentNetworkDemo';

function ensureDemoSeeded(): void {
  bootstrapTalentNetworkStore();
  const store = readTalentNetworkStore();
  if (store.talents.length === 0) {
    mergeTalentNetworkPatch(buildDemoTalentNetworkStorePatch());
    refreshTalentScores(AI_MEDIA_WORKSPACE_ID);
  }
}

export function useAdminStudioTalentNetworkState() {
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => {
    ensureDemoSeeded();
    setVersion((v) => v + 1);
  }, []);

  const store = useMemo(() => {
    void version;
    ensureDemoSeeded();
    return readTalentNetworkStore();
  }, [version]);

  const workspaceId = AI_MEDIA_WORKSPACE_ID;
  const talents = useMemo(() => getTalentsForWorkspace(workspaceId), [store, workspaceId]);
  const aiTalents = talents.filter((t) => t.talentType === 'ai-presenter');
  const humanTalents = talents.filter((t) => t.talentType !== 'ai-presenter');
  const wardrobes = store.wardrobes.filter((w) => w.workspaceId === workspaceId);
  const castings = store.castings.filter((c) => c.workspaceId === workspaceId);
  const seriesAssignments = store.seriesAssignments.filter((s) => s.workspaceId === workspaceId);
  const audienceIntel = store.audienceIntel;
  const characterVersions = store.characterVersions;
  const contracts = store.contracts.filter((c) => c.workspaceId === workspaceId);
  const growthRecommendations = store.growthRecommendations.filter((r) => r.workspaceId === workspaceId);
  const onboardingDrafts = store.onboardingDrafts.filter((o) => o.workspaceId === workspaceId);

  const activeCastings = castings.filter((c) => c.status === 'cast' || c.status === 'confirmed');
  const auditionCastings = castings.filter((c) => c.status === 'audition');
  const avgTalentScore =
    talents.length > 0
      ? Math.round((talents.reduce((s, t) => s + t.talentScore.overall, 0) / talents.length) * 10) / 10
      : 0;
  const totalEarnings = talents.reduce(
    (s, t) => s + t.performance.revenue + t.performance.affiliateRevenue + t.performance.sponsorshipRevenue,
    0
  );
  const totalViews = talents.reduce((s, t) => s + t.performance.views, 0);

  return {
    workspaceId,
    store,
    talents,
    aiTalents,
    humanTalents,
    wardrobes,
    castings,
    activeCastings,
    auditionCastings,
    seriesAssignments,
    audienceIntel,
    characterVersions,
    contracts,
    growthRecommendations,
    onboardingDrafts,
    avgTalentScore,
    totalEarnings,
    totalViews,
    refresh,
  };
}
