import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readEcosystemMarketplaceStore } from '../../../studio-os-core/ecosystem-marketplace/store';

export type EcosystemMarketplaceSnapshot = ReturnType<typeof readEcosystemMarketplaceStore>;

export const ECOSYSTEM_MARKETPLACE_CHAIN = [
  'DISCOVER',
  'PREVIEW',
  'SIMULATE',
  'COMPATIBILITY CHECK',
  'INHERIT',
  'EVOLVE',
  'COMPOUND WISDOM',
] as const;

export const ecosystemMarketplaceStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<EcosystemMarketplaceSnapshot>>;
} = {
  id: 'ecosystem-marketplace',
  label: 'ECOSYSTEM MARKETPLACE',
  phase: 2,
  enabled: false,
  description: 'ORGANIZATIONAL INTELLIGENCE EXCHANGE — ASSETS · INHERITANCE · CAPABILITY',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Ecosystem Marketplace requires browser context.');
    }
    return { ok: true, data: readEcosystemMarketplaceStore() };
  },
};
