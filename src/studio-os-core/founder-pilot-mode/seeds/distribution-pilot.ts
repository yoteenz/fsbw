import type { DistributionNetworkOrgProfile } from '../../../utils/adminStudioDistributionNetworkOrgDefaults';
import { createDistributionChannel } from '../../../utils/adminStudioDistributionNetworkDemo';

/** Empty distribution profile for founder pilot — Instagram only. */
export function buildPilotDistributionProfile(base: DistributionNetworkOrgProfile): DistributionNetworkOrgProfile {
  return {
    ...base,
    packs: [],
    campaigns: [],
    channels: [
      createDistributionChannel({ id: 'instagram', name: 'INSTAGRAM', accentHex: base.accentHex }, 'ACTIVE', {
        status: 'NOT CONNECTED',
        audience: base.audience,
        ctaRules: base.ctaRules,
        purpose: 'Connect Instagram to begin your first publishing pipeline.',
      }),
      createDistributionChannel({ id: 'tiktok', name: 'TIKTOK' }, 'COMING_SOON', {
        status: 'LOCKED',
        purpose: 'Locked — perfect Instagram first.',
      }),
      createDistributionChannel({ id: 'facebook', name: 'FACEBOOK' }, 'COMING_SOON', {
        status: 'LOCKED',
        purpose: 'Locked — unlock after pilot milestones.',
      }),
      createDistributionChannel({ id: 'mobile-website', name: 'YOUTUBE' }, 'COMING_SOON', {
        status: 'LOCKED',
        purpose: 'YouTube — locked during pilot phase.',
      }),
      createDistributionChannel({ id: 'email', name: 'NEWSLETTER' }, 'COMING_SOON', {
        status: 'LOCKED',
        purpose: 'Newsletter — locked until editorial rhythm is established.',
      }),
    ],
  };
}
