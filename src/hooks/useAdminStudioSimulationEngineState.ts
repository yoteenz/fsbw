import {useCallback, useMemo, useState} from 'react';
import { AI_MEDIA_WORKSPACE_ID } from '../studio-os-core/ai-media-network/constants';
import {
  bootstrapSimulationEngineStore,
  getSimulationsForWorkspace,
  mergeSimulationEnginePatch,
  readSimulationEngineStore,
  refreshSimulationDashboard,
} from '../studio-os-core/simulation-engine/store';
import { buildDemoSimulationEngineStorePatch } from '../utils/adminStudioSimulationEngineDemo';

function ensureDemoSeeded(): void {
  bootstrapSimulationEngineStore();
  const store = readSimulationEngineStore();
  if (store.simulations.length === 0) {
    mergeSimulationEnginePatch(buildDemoSimulationEngineStorePatch());
    refreshSimulationDashboard(AI_MEDIA_WORKSPACE_ID);
  }
}

export function useAdminStudioSimulationEngineState() {
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
    return readSimulationEngineStore();
  }, [version]);

  const workspaceId = AI_MEDIA_WORKSPACE_ID;
  const ws = useMemo(() => getSimulationsForWorkspace(workspaceId), [store, workspaceId]);

  return {
    workspaceId,
    store,
    dashboard: ws.dashboard,
    simulations: ws.simulations,
    scenarios: ws.scenarios,
    riskAnalyses: ws.riskAnalyses,
    financialSims: ws.financialSims,
    marketingSims: ws.marketingSims,
    contentSims: ws.contentSims,
    organizationSims: ws.organizationSims,
    marketplaceSims: ws.marketplaceSims,
    timelineProjections: ws.timelineProjections,
    decisionReports: ws.decisionReports,
    executiveContributions: ws.executiveContributions,
    library: ws.library,
    learningLoops: ws.learningLoops,
    intelligenceRecommendations: ws.intelligenceRecommendations,
    refresh,
  };
}
