import { studioServiceNotConnected, studioServicePhase2, type StudioServiceStub, type StudioServiceResult } from '../types';
import {
  DISTRIBUTION_INHERITANCE_CHAIN,
  inferRoutingForShow,
  validateDistributionPack,
} from '../../../utils/adminStudioDistributionNetworkDemo';
import {
  exportDistributionNetworkSnapshot,
  getDistributionPackById,
  listDistributionChannels,
} from '../../../hooks/useAdminStudioDistributionNetworkState';

export type DistributionNetworkSnapshot = ReturnType<typeof exportDistributionNetworkSnapshot>;

export type DistributionPackValidation = {
  packId: string;
  title: string;
  passed: boolean;
  suggestedRouting: string[];
  readyForScheduling: boolean;
  inheritanceChain: readonly string[];
};

export const distributionNetworkStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<DistributionNetworkSnapshot>>;
  validatePack(packId: string): Promise<StudioServiceResult<DistributionPackValidation>>;
  listActiveChannels(): Promise<StudioServiceResult<{ id: string; name: string; status: string }[]>>;
} = {
  id: 'distribution-network',
  label: 'DISTRIBUTION NETWORK',
  phase: 2,
  enabled: false,
  description:
    'CENTRALIZED BROADCASTING — ONE STORY · EVERY DESTINATION · MANUAL PUBLISHING · CONNECTORS NOT CONNECTED',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Distribution Network requires browser localStorage context.');
    }
    return { ok: true, data: exportDistributionNetworkSnapshot() };
  },
  async validatePack(packId) {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Pack validation requires browser context.');
    }
    const pack = getDistributionPackById(packId);
    if (!pack) return studioServicePhase2(`Distribution pack not found: ${packId}`);
    const passed = validateDistributionPack(pack);
    return {
      ok: true,
      data: {
        packId: pack.id,
        title: pack.title,
        passed,
        suggestedRouting: inferRoutingForShow(pack.showName),
        readyForScheduling: passed && (pack.approvalStatus === 'approved' || pack.approvalStatus === 'scheduled'),
        inheritanceChain: DISTRIBUTION_INHERITANCE_CHAIN,
      },
    };
  },
  async listActiveChannels() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Channel list requires browser context.');
    }
    const channels = listDistributionChannels()
      .filter((c) => c.activation === 'ACTIVE')
      .map((c) => ({ id: c.id, name: c.name, status: c.status }));
    return { ok: true, data: channels };
  },
};

export { DISTRIBUTION_INHERITANCE_CHAIN };
