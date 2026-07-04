import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import {
  ADMIN_STUDIO_AI_MEDIA_NETWORK_SUBTITLE,
  AI_MEDIA_NETWORK_INHERITANCE_CHAIN,
} from '../../../utils/adminStudioAiMediaNetworkDemo';
import { readAiMediaNetworkStore } from '../../../studio-os-core/ai-media-network/store';
import { AI_MEDIA_WORKSPACE_ID } from '../../../studio-os-core/ai-media-network/constants';

export type AiMediaNetworkSnapshot = {
  workspaceId: string;
  store: ReturnType<typeof readAiMediaNetworkStore>;
  inheritanceChain: readonly string[];
};

export const aiMediaNetworkStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<AiMediaNetworkSnapshot>>;
} = {
  id: 'ai-media-network',
  label: 'AI MEDIA NETWORK',
  phase: 2,
  enabled: false,
  description:
    'DIGITAL MEDIA NETWORK — PROGRAMMING · PILLARS · CALENDAR · MONETIZATION · LABS · DEMO DATA',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('AI Media Network requires browser localStorage context.');
    }
    return {
      ok: true,
      data: {
        workspaceId: AI_MEDIA_WORKSPACE_ID,
        store: readAiMediaNetworkStore(),
        inheritanceChain: AI_MEDIA_NETWORK_INHERITANCE_CHAIN,
      },
    };
  },
};

export { ADMIN_STUDIO_AI_MEDIA_NETWORK_SUBTITLE, AI_MEDIA_NETWORK_INHERITANCE_CHAIN };

export type AiMediaNetworkStudioService = typeof aiMediaNetworkStudioService;
