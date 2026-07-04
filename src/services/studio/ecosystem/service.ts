import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import {
  ADMIN_STUDIO_ECOSYSTEM_SUBTITLE,
  ECOSYSTEM_INHERITANCE_CHAIN,
} from '../../../utils/adminStudioEcosystemDemo';
import { readEcosystemStore } from '../../../studio-os-core/ecosystem/store';
import { AI_MEDIA_WORKSPACE_ID } from '../../../studio-os-core/ai-media-network/constants';

export type EcosystemSnapshot = {
  workspaceId: string;
  store: ReturnType<typeof readEcosystemStore>;
  inheritanceChain: readonly string[];
};

export const ecosystemStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<EcosystemSnapshot>>;
} = {
  id: 'ecosystem',
  label: 'STUDIO OS ECOSYSTEM',
  phase: 2,
  enabled: false,
  description:
    'BUSINESS OPERATING ECOSYSTEM — BLUEPRINTS · DNA · AUTOMATIONS · EXECUTIVES · DEMO DATA',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Ecosystem requires browser localStorage context.');
    }
    return {
      ok: true,
      data: {
        workspaceId: AI_MEDIA_WORKSPACE_ID,
        store: readEcosystemStore(),
        inheritanceChain: ECOSYSTEM_INHERITANCE_CHAIN,
      },
    };
  },
};

export { ADMIN_STUDIO_ECOSYSTEM_SUBTITLE, ECOSYSTEM_INHERITANCE_CHAIN };

export type EcosystemStudioService = typeof ecosystemStudioService;
