import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import {
  ADMIN_STUDIO_BME_SUBTITLE,
  BME_INHERITANCE_CHAIN,
} from '../../../utils/adminStudioBusinessModelEngineDemo';
import { readBusinessModelEngineStore } from '../../../studio-os-core/business-model-engine/store';
import { AI_MEDIA_WORKSPACE_ID } from '../../../studio-os-core/ai-media-network/constants';

export type BusinessModelEngineSnapshot = {
  workspaceId: string;
  store: ReturnType<typeof readBusinessModelEngineStore>;
  inheritanceChain: readonly string[];
};

export const businessModelEngineStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<BusinessModelEngineSnapshot>>;
} = {
  id: 'business-model-engine',
  label: 'BUSINESS MODEL ENGINE',
  phase: 2,
  enabled: false,
  description:
    'ECONOMIC ENGINE — MEMBERSHIP · BILLING · USAGE · FEES · WALLETS · ROYALTIES · ENTERPRISE · DEMO DATA',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Business Model Engine requires browser localStorage context.');
    }
    return {
      ok: true,
      data: {
        workspaceId: AI_MEDIA_WORKSPACE_ID,
        store: readBusinessModelEngineStore(),
        inheritanceChain: BME_INHERITANCE_CHAIN,
      },
    };
  },
};

export { ADMIN_STUDIO_BME_SUBTITLE, BME_INHERITANCE_CHAIN };

export type BusinessModelEngineStudioService = typeof businessModelEngineStudioService;
