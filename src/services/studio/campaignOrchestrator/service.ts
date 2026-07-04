import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { CAMPAIGN_ORCHESTRATOR_INHERITANCE_CHAIN } from '../../../utils/adminStudioCampaignOrchestratorDemo';
import { exportCampaignOrchestratorSnapshot } from '../../../hooks/useAdminStudioCampaignOrchestratorState';

export type CampaignOrchestratorSnapshot = ReturnType<typeof exportCampaignOrchestratorSnapshot>;

export type CampaignOrchestratorSummary = {
  campaignCount: number;
  inheritanceChain: readonly string[];
};

export const campaignOrchestratorStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<CampaignOrchestratorSnapshot>>;
  getSummary(): Promise<StudioServiceResult<CampaignOrchestratorSummary>>;
} = {
  id: 'campaign-orchestrator',
  label: 'CAMPAIGN ORCHESTRATOR',
  phase: 2,
  enabled: false,
  description:
    'OPERATIONAL LAUNCH PLANNER — WIZARD · TIMELINE · TASKS · APPROVAL GATES · CONNECTORS NOT CONNECTED',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Campaign Orchestrator requires browser context.');
    }
    return { ok: true, data: exportCampaignOrchestratorSnapshot() };
  },
  async getSummary() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Campaign Orchestrator summary requires browser context.');
    }
    const snap = exportCampaignOrchestratorSnapshot();
    return {
      ok: true,
      data: {
        campaignCount: Object.keys(snap.campaigns).length,
        inheritanceChain: CAMPAIGN_ORCHESTRATOR_INHERITANCE_CHAIN,
      },
    };
  },
};

export { CAMPAIGN_ORCHESTRATOR_INHERITANCE_CHAIN };
