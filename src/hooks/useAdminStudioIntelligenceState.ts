import { useCallback, useMemo, useState } from 'react';
import { AI_MEDIA_WORKSPACE_ID } from '../studio-os-core/ai-media-network/constants';
import {
  bootstrapStudioIntelligenceStore,
  getIntelligenceForWorkspace,
  mergeStudioIntelligencePatch,
  readStudioIntelligenceStore,
  refreshIntelligenceDashboard,
} from '../studio-os-core/studio-intelligence/store';
import { buildDemoStudioIntelligenceStorePatch } from '../utils/adminStudioStudioIntelligenceDemo';

function ensureDemoSeeded(): void {
  bootstrapStudioIntelligenceStore();
  const store = readStudioIntelligenceStore();
  if (store.briefings.length === 0) {
    mergeStudioIntelligencePatch(buildDemoStudioIntelligenceStorePatch());
    refreshIntelligenceDashboard(AI_MEDIA_WORKSPACE_ID);
  }
}

export function useAdminStudioIntelligenceState() {
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => {
    ensureDemoSeeded();
    setVersion((v) => v + 1);
  }, []);

  const store = useMemo(() => {
    void version;
    ensureDemoSeeded();
    return readStudioIntelligenceStore();
  }, [version]);

  const workspaceId = AI_MEDIA_WORKSPACE_ID;
  const ws = useMemo(() => getIntelligenceForWorkspace(workspaceId), [store, workspaceId]);

  return {
    workspaceId,
    store,
    dashboard: ws.dashboard,
    briefings: ws.briefings,
    workspaceSignals: ws.workspaceSignals,
    opportunities: ws.opportunities,
    risks: ws.risks,
    executiveSynthesis: ws.executiveSynthesis,
    crossWorkspaceInsights: ws.crossWorkspaceInsights,
    institutionalLearnings: ws.institutionalLearnings,
    recommendations: ws.recommendations,
    businessHealth: ws.businessHealth,
    decisionJournal: ws.decisionJournal,
    learningRecords: ws.learningRecords,
    confidenceBreakdowns: ws.confidenceBreakdowns,
    refresh,
  };
}
