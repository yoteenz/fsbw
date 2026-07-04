import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import {
  ADMIN_STUDIO_STUDIO_INTELLIGENCE_SUBTITLE,
  STUDIO_INTELLIGENCE_INHERITANCE_CHAIN,
} from '../../../utils/adminStudioStudioIntelligenceDemo';
import { readStudioIntelligenceStore } from '../../../studio-os-core/studio-intelligence/store';
import { AI_MEDIA_WORKSPACE_ID } from '../../../studio-os-core/ai-media-network/constants';

export type StudioIntelligenceSnapshot = {
  workspaceId: string;
  store: ReturnType<typeof readStudioIntelligenceStore>;
  inheritanceChain: readonly string[];
};

export const studioIntelligenceStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<StudioIntelligenceSnapshot>>;
} = {
  id: 'studio-intelligence',
  label: 'STUDIO INTELLIGENCE',
  phase: 2,
  enabled: false,
  description:
    'OPERATING INTELLIGENCE · EXECUTIVE BRIEFINGS · OPPORTUNITY & RISK ENGINES · DEMO DATA',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Studio Intelligence requires browser localStorage context.');
    }
    return {
      ok: true,
      data: {
        workspaceId: AI_MEDIA_WORKSPACE_ID,
        store: readStudioIntelligenceStore(),
        inheritanceChain: STUDIO_INTELLIGENCE_INHERITANCE_CHAIN,
      },
    };
  },
};

export { ADMIN_STUDIO_STUDIO_INTELLIGENCE_SUBTITLE, STUDIO_INTELLIGENCE_INHERITANCE_CHAIN };

export type StudioIntelligenceStudioService = typeof studioIntelligenceStudioService;
