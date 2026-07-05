import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readDistributionEngineStore } from '../../../studio-os-core/distribution-engine/store';

export type DistributionEngineSnapshot = ReturnType<typeof readDistributionEngineStore>;

export const DISTRIBUTION_ENGINE_CHAIN = [
  'KNOWLEDGE ASSET',
  'CAMPAIGN',
  'DISTRIBUTION STRATEGY',
  'CHANNEL SELECTION',
  'PLATFORM ADAPTATION',
  'PUBLISHING',
  'PERFORMANCE',
  'INSTITUTIONAL LEARNING',
] as const;

export const distributionEngineStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<DistributionEngineSnapshot>>;
} = {
  id: 'distribution-engine',
  label: 'DISTRIBUTION ENGINE',
  phase: 2,
  enabled: false,
  description: 'GLOBAL DISTRIBUTION — KNOWLEDGE ASSETS · CHANNEL OPTIMIZATION · EVERGREEN · LINEAGE',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Distribution Engine requires browser context.');
    }
    return { ok: true, data: readDistributionEngineStore() };
  },
};
