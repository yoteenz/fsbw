import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import {
  ADMIN_STUDIO_MARKETPLACE_SUBTITLE,
  MARKETPLACE_INHERITANCE_CHAIN,
} from '../../../utils/adminStudioMarketplaceDemo';
import { readMarketplaceStore } from '../../../studio-os-core/marketplace/store';
import { AI_MEDIA_WORKSPACE_ID } from '../../../studio-os-core/ai-media-network/constants';

export type MarketplaceSnapshot = {
  workspaceId: string;
  store: ReturnType<typeof readMarketplaceStore>;
  inheritanceChain: readonly string[];
};

export const marketplaceStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<MarketplaceSnapshot>>;
} = {
  id: 'marketplace',
  label: 'MARKETPLACE',
  phase: 2,
  enabled: false,
  description:
    'PROFESSIONAL OPERATING NETWORK — MATCHING · DEALS · COLLABORATION · TRUST · DEMO DATA',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Marketplace requires browser localStorage context.');
    }
    return {
      ok: true,
      data: {
        workspaceId: AI_MEDIA_WORKSPACE_ID,
        store: readMarketplaceStore(),
        inheritanceChain: MARKETPLACE_INHERITANCE_CHAIN,
      },
    };
  },
};

export { ADMIN_STUDIO_MARKETPLACE_SUBTITLE, MARKETPLACE_INHERITANCE_CHAIN };

export type MarketplaceStudioService = typeof marketplaceStudioService;
