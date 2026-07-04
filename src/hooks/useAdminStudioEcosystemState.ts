import { useCallback, useMemo, useState } from 'react';
import { AI_MEDIA_WORKSPACE_ID } from '../studio-os-core/ai-media-network/constants';
import {
  bootstrapEcosystemStore,
  getAssetsForWorkspace,
  mergeEcosystemPatch,
  readEcosystemStore,
  refreshEcosystemRecommendations,
} from '../studio-os-core/ecosystem/store';
import { buildDemoEcosystemStorePatch } from '../utils/adminStudioEcosystemDemo';

function ensureDemoSeeded(): void {
  bootstrapEcosystemStore();
  const store = readEcosystemStore();
  if (store.assets.length === 0) {
    mergeEcosystemPatch(buildDemoEcosystemStorePatch());
    refreshEcosystemRecommendations(AI_MEDIA_WORKSPACE_ID);
  }
}

export function useAdminStudioEcosystemState() {
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => {
    ensureDemoSeeded();
    setVersion((v) => v + 1);
  }, []);

  const store = useMemo(() => {
    void version;
    ensureDemoSeeded();
    return readEcosystemStore();
  }, [version]);

  const workspaceId = AI_MEDIA_WORKSPACE_ID;
  const assets = useMemo(() => getAssetsForWorkspace(workspaceId), [store, workspaceId]);
  const publishedAssets = assets.filter((a) => a.stage === 'published' || a.stage === 'updates');
  const featuredAssets = assets.filter((a) => a.featured);
  const trendingAssets = assets.filter((a) => a.trending);
  const recommendations = store.recommendations.filter((r) => r.workspaceId === workspaceId);
  const installs = store.installs.filter((i) => i.workspaceId === workspaceId);

  return {
    workspaceId,
    store,
    assets,
    publishedAssets,
    featuredAssets,
    trendingAssets,
    dependencies: store.dependencies,
    reviews: store.reviews,
    installs,
    versions: store.versions,
    recommendations,
    creators: store.creators,
    analytics: store.analytics,
    enterpriseLibraries: store.enterpriseLibraries,
    hubCards: store.hubCards,
    refresh,
  };
}
