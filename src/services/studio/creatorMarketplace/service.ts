import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readCreatorMarketplaceStore } from '../../../studio-os-core/creator-marketplace/store';

export type CreatorMarketplaceSnapshot = ReturnType<typeof readCreatorMarketplaceStore>;

export const CREATOR_MARKETPLACE_CHAIN = [
  'CREATOR',
  'VERIFIED',
  'PREFERRED',
  'AMBASSADOR',
  'PARTNER',
  'AGENCY',
  'INSTITUTIONAL PARTNERSHIP',
] as const;

export const creatorMarketplaceStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<CreatorMarketplaceSnapshot>>;
} = {
  id: 'creator-marketplace',
  label: 'CREATOR MARKETPLACE',
  phase: 2,
  enabled: false,
  description: 'CREATOR BUSINESS ECOSYSTEM — MATCHING · DEALS · CAREER · ALIGNMENT',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Creator Marketplace requires browser context.');
    }
    return { ok: true, data: readCreatorMarketplaceStore() };
  },
};
