import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import {
  ADMIN_STUDIO_TALENT_NETWORK_SUBTITLE,
  TALENT_NETWORK_INHERITANCE_CHAIN,
} from '../../../utils/adminStudioTalentNetworkDemo';
import { readTalentNetworkStore } from '../../../studio-os-core/talent-network/store';
import { AI_MEDIA_WORKSPACE_ID } from '../../../studio-os-core/ai-media-network/constants';

export type TalentNetworkSnapshot = {
  workspaceId: string;
  store: ReturnType<typeof readTalentNetworkStore>;
  inheritanceChain: readonly string[];
};

export const talentNetworkStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<TalentNetworkSnapshot>>;
} = {
  id: 'talent-network',
  label: 'TALENT NETWORK',
  phase: 2,
  enabled: false,
  description:
    'UNIFIED TALENT OS — AI + HUMAN REGISTRY · CASTING · WARDROBE · CONTRACTS · SCORE · DEMO DATA',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Talent Network requires browser localStorage context.');
    }
    return {
      ok: true,
      data: {
        workspaceId: AI_MEDIA_WORKSPACE_ID,
        store: readTalentNetworkStore(),
        inheritanceChain: TALENT_NETWORK_INHERITANCE_CHAIN,
      },
    };
  },
};

export { ADMIN_STUDIO_TALENT_NETWORK_SUBTITLE, TALENT_NETWORK_INHERITANCE_CHAIN };

export type TalentNetworkStudioService = typeof talentNetworkStudioService;
