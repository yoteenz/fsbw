import { studioServicePhase2, studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from './types';
import type { AdminStudioDistributionTargetId } from '../../utils/adminStudioDistributionDemo';

export type DistributionDispatchInput = {
  packId: string;
  targetIds: AdminStudioDistributionTargetId[];
};

export type DistributionDispatchOutput = {
  dispatched: AdminStudioDistributionTargetId[];
  skipped: AdminStudioDistributionTargetId[];
};

export const distributionStudioService: StudioServiceStub & {
  dispatchPack(_input: DistributionDispatchInput): Promise<StudioServiceResult<DistributionDispatchOutput>>;
  validateTargets(_packId: string): Promise<StudioServiceResult<{ valid: boolean; targets: string[] }>>;
  isTargetAvailable(targetId: AdminStudioDistributionTargetId): boolean;
} = {
  id: 'distribution',
  label: 'DISTRIBUTION',
  phase: 2,
  enabled: false,
  description: 'MOBILE · LOUNGE TV · EMAIL · SOCIAL · DESKTOP · APP',
  isTargetAvailable(targetId) {
    return targetId !== 'desktop-mansion' && targetId !== 'mobile-app';
  },
  async dispatchPack(input) {
    const comingSoon = input.targetIds.filter(
      (id) => id === 'desktop-mansion' || id === 'mobile-app'
    );
    if (comingSoon.length > 0) {
      return studioServicePhase2(
        `Targets not yet active: ${comingSoon.join(', ')}. Enable in Phase 2.`
      );
    }
    return studioServiceNotConnected('Distribution dispatch is not connected. Wire channels in Phase 2.');
  },
  async validateTargets() {
    return studioServiceNotConnected('Distribution validation is not connected. Wire channels in Phase 2.');
  },
};
