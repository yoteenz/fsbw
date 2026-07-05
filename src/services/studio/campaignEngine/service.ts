import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readCampaignEngineStore } from '../../../studio-os-core/campaign-engine/store';

export type CampaignEngineSnapshot = ReturnType<typeof readCampaignEngineStore>;

export const CAMPAIGN_ENGINE_CHAIN = [
  'STRATEGY',
  'INITIATIVE',
  'CAMPAIGN',
  'DELIVERABLES',
  'DISTRIBUTION',
  'ANALYTICS',
  'INSTITUTIONAL LEARNING',
] as const;

export const campaignEngineStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<CampaignEngineSnapshot>>;
} = {
  id: 'campaign-engine',
  label: 'CAMPAIGN ENGINE',
  phase: 2,
  enabled: false,
  description: 'COORDINATED EXECUTION — CAMPAIGNS · DELIVERABLES · ANALYTICS · PLAYBOOKS',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Campaign Engine requires browser context.');
    }
    return { ok: true, data: readCampaignEngineStore() };
  },
};
