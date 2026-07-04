import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { fetchSocialAccounts } from '../../../utils/apiSocialPublishing';
import type { PublicSocialAccount } from '../../../utils/adminStudioSocialPublishing';

export type SocialPublishingSnapshot = {
  accounts: PublicSocialAccount[];
};

export const socialPublishingStudioService: StudioServiceStub & {
  listAccounts(): Promise<StudioServiceResult<SocialPublishingSnapshot>>;
} = {
  id: 'social-publishing',
  label: 'SOCIAL PUBLISHING',
  phase: 2,
  enabled: true,
  description: 'OFFICIAL OAUTH SOCIAL CONNECTORS — ENCRYPTED TOKENS SERVER-SIDE · ADMIN APPROVAL REQUIRED',
  async listAccounts() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Social publishing requires browser context.');
    }
    try {
      const accounts = await fetchSocialAccounts();
      return { ok: true, data: { accounts } };
    } catch (e) {
      return studioServiceNotConnected(e instanceof Error ? e.message : 'Failed to load accounts');
    }
  },
};
