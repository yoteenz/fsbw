import {useCallback, useMemo, useState} from 'react';
import { AI_MEDIA_WORKSPACE_ID } from '../studio-os-core/ai-media-network/constants';
import {
  bootstrapGovernanceStore,
  getGovernanceForWorkspace,
  mergeGovernancePatch,
  readGovernanceStore,
  refreshGovernanceDashboard,
} from '../studio-os-core/governance/store';
import { buildDemoGovernanceStorePatch } from '../utils/adminStudioGovernanceDemo';

function ensureDemoSeeded(): void {
  bootstrapGovernanceStore();
  const store = readGovernanceStore();
  if (store.trustScores.length === 0) {
    mergeGovernancePatch(buildDemoGovernanceStorePatch());
    refreshGovernanceDashboard(AI_MEDIA_WORKSPACE_ID);
  }
}

export function useAdminStudioGovernanceState() {
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
    return readGovernanceStore();
  }, [version]);

  const workspaceId = AI_MEDIA_WORKSPACE_ID;
  const ws = useMemo(() => getGovernanceForWorkspace(workspaceId), [store, workspaceId]);

  return {
    workspaceId,
    store,
    dashboard: ws.dashboard,
    trustScores: ws.trustScores,
    verificationRequests: ws.verificationRequests,
    qualityReviews: ws.qualityReviews,
    certifications: ws.certifications,
    moderationCases: ws.moderationCases,
    policies: ws.policies,
    appeals: ws.appeals,
    fraudAlerts: ws.fraudAlerts,
    reputations: ws.reputations,
    ecosystemHealth: ws.ecosystemHealth,
    aiGovernance: ws.aiGovernance,
    auditEvents: ws.auditEvents,
    enterpriseRules: ws.enterpriseRules,
    refresh,
  };
}
