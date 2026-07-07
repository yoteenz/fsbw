import { createDistributionPack, createDistributionChannel } from '../../../utils/adminStudioDistributionNetworkDemo';
import type { DistributionNetworkOrgProfile } from '../../../utils/adminStudioDistributionNetworkOrgDefaults';

/** Empty distribution profile for founder pilot — Instagram only. */
export function buildPilotDistributionProfile(base: DistributionNetworkOrgProfile): DistributionNetworkOrgProfile {
  return {
    ...base,
    packs: [
      createDistributionPack({
        id: 'dist-ndx-page-001',
        title: 'PROJECT 001 — PILOT · AWAITING PRODUCTION',
        accentHex: '#6366F1',
        contentPackRef: 'page-001',
        showName: 'NDXBOOK PAGES',
        campaignName: 'PILOT · FIRST POST',
        approvalStatus: 'ready',
        deliveryStatus: 'queued',
        calendarSlot: 'tue-pm',
        routingChannels: ['instagram'],
        validationPassed: true,
        validationThumbnail: 'PASS',
        validationCta: 'PASS',
        validationMetadata: 'PASS',
        validationProducts: 'N/A',
        validationMembership: 'N/A',
        validationRewards: 'N/A',
        validationSeo: 'N/A',
        validationTranscript: 'PASS',
      }),
    ],
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
