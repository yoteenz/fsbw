import type { ModuleTenantId } from '../studio-os-core/workspace/tenant-ids';
import { getActiveModuleTenantId } from '../studio-os-core/organization-context';
import type {
  DistributionCampaign,
  DistributionChannel,
  DistributionChannelId,
  DistributionPack,
} from './adminStudioDistributionNetworkDemo';
import {
  ADMIN_STUDIO_DISTRIBUTION_CAMPAIGNS,
  ADMIN_STUDIO_DISTRIBUTION_CHANNELS,
  ADMIN_STUDIO_DISTRIBUTION_NETWORK_SUBTITLE,
  ADMIN_STUDIO_DISTRIBUTION_PACK_DEFAULTS,
  createDistributionPack,
} from './adminStudioDistributionNetworkDemo';

export type DistributionNetworkOrgProfile = {
  subtitle: string;
  audience: string;
  accentHex: string;
  ctaRules: string;
  seasonalCampaigns: string;
  membershipExclusives: string;
  packs: DistributionPack[];
  channels: DistributionChannel[];
  campaigns: DistributionCampaign[];
};

function withOrgChannelBranding(
  channels: DistributionChannel[],
  profile: Pick<DistributionNetworkOrgProfile, 'audience' | 'accentHex' | 'ctaRules' | 'seasonalCampaigns' | 'membershipExclusives'>
): DistributionChannel[] {
  return channels.map((channel) => ({
    ...channel,
    accentHex: channel.activation === 'ACTIVE' ? profile.accentHex : channel.accentHex,
    audience: profile.audience,
    ctaRules: profile.ctaRules,
    seasonalCampaigns: profile.seasonalCampaigns,
    membershipExclusives: profile.membershipExclusives,
  }));
}

const NDXBOOK_ROUTING: DistributionChannelId[] = [
  'journal',
  'email',
  'instagram',
  'tiktok',
  'pinterest',
  'push-notifications',
  'mobile-website',
];

const NDXBOOK_PROFILE: DistributionNetworkOrgProfile = {
  subtitle: 'ONE STORY · EVERY KNOWLEDGE PAGE — THE BROADCASTING DEPARTMENT OF NDXBOOK.',
  audience: 'NDXBOOK READERS · SUBSCRIBERS · EDITORIAL COMMUNITY',
  accentHex: '#6366F1',
  ctaRules: 'INDIGO CTA · READ PAGE · SUBSCRIBE',
  seasonalCampaigns: 'VOLUME PREMIERE · MONEY MONDAY · READER WEEK',
  membershipExclusives: 'SUBSCRIBER EARLY ACCESS · VOLUME UNLOCKS',
  packs: [
    createDistributionPack({
      id: 'dist-ndx-money-monday-12',
      title: 'MONEY MONDAY EP 12 — SIDE HUSTLE BLUEPRINT',
      accentHex: '#6366F1',
      contentPackRef: 'pack-ndx-money-monday-12',
      showName: 'MONEY MONDAY',
      campaignName: 'VOLUME 3',
      approvalStatus: 'scheduled',
      calendarSlot: 'mon-am',
      routingChannels: NDXBOOK_ROUTING,
      previewInstagram: 'CAROUSEL · PAGE TEASER · SUBSCRIBE CTA',
      previewJournal: 'ARTICLE · PAGE 042 PREVIEW · 6 MIN READ',
      previewEmail: 'NEWSLETTER · SUBJECT LOCKED',
      channelVersions: {
        instagram: { caption: 'MONEY MONDAY EP 12 — SIDE HUSTLE BLUEPRINT', cta: 'READ PAGE', thumbnail: 'v1.0', metadata: 'NDX-MM-12' },
        journal: { caption: 'THE SIDE HUSTLE BLUEPRINT', cta: 'READ NOW', thumbnail: 'v1.0', metadata: 'NDX-P042' },
      },
    }),
    createDistributionPack({
      id: 'dist-ndx-page-042',
      title: 'PAGE 042 — ENTREPRENEURSHIP GATE',
      accentHex: '#4F46E5',
      contentPackRef: 'pack-ndx-page-042',
      showName: 'NDXBOOK PAGES',
      campaignName: 'VOLUME 3',
      approvalStatus: 'approved',
      calendarSlot: 'tue-pm',
      routingChannels: ['journal', 'email', 'instagram', 'mobile-website'],
    }),
    createDistributionPack({
      id: 'dist-ndx-volume-preview',
      title: 'VOLUME 3 PREVIEW — READER NEWSLETTER',
      accentHex: '#818CF8',
      contentPackRef: 'pack-ndx-volume-preview',
      showName: 'NDXBOOK VOLUMES',
      approvalStatus: 'needs-review',
      calendarSlot: 'thu-am',
      routingChannels: ['email', 'journal', 'push-notifications'],
      validationPassed: false,
      validationThumbnail: 'PENDING',
    }),
    createDistributionPack({
      id: 'dist-ndx-social-cuts',
      title: 'SOCIAL CUTS — PAGE 038 HIGHLIGHTS',
      accentHex: '#6366F1',
      contentPackRef: 'pack-ndx-social-cuts',
      showName: 'SHORT FORM',
      approvalStatus: 'published',
      deliveryStatus: 'published',
      calendarSlot: 'wed-pm',
      routingChannels: ['instagram', 'tiktok', 'pinterest'],
      analyticsPublished: '4',
    }),
  ],
  channels: withOrgChannelBranding(ADMIN_STUDIO_DISTRIBUTION_CHANNELS, {
    audience: 'NDXBOOK READERS · SUBSCRIBERS · EDITORIAL COMMUNITY',
    accentHex: '#6366F1',
    ctaRules: 'INDIGO CTA · READ PAGE · SUBSCRIBE',
    seasonalCampaigns: 'VOLUME PREMIERE · MONEY MONDAY · READER WEEK',
    membershipExclusives: 'SUBSCRIBER EARLY ACCESS · VOLUME UNLOCKS',
  }),
  campaigns: [
    {
      id: 'campaign-ndx-volume-launch',
      title: 'VOLUME 3 LAUNCH',
      accentHex: '#6366F1',
      description: 'PAGE → JOURNAL → EMAIL → SOCIAL → PUSH',
      packIds: ['dist-ndx-page-042', 'dist-ndx-money-monday-12'],
      channels: NDXBOOK_ROUTING,
      timeline: 'MON NEWSLETTER → TUE PAGE → WED SOCIAL → THU EMAIL',
      reusable: true,
    },
  ],
};

const VXD_PROFILE: DistributionNetworkOrgProfile = {
  subtitle: 'PORTFOLIO SIGNAL ROUTING — THE BROADCASTING LAYER OF VXD INC.',
  audience: 'PORTFOLIO OPERATORS · STUDIO ADMINISTRATION · PLATFORM TEAM',
  accentHex: '#0F172A',
  ctaRules: 'SLATE CTA · OPEN BRIEF · REVIEW INSIGHT',
  seasonalCampaigns: 'QUARTERLY PORTFOLIO REVIEW · PLATFORM RELEASE',
  membershipExclusives: 'ADMINISTRATION ONLY · NO CROSS-ORG LEAKAGE',
  packs: [
    createDistributionPack({
      id: 'dist-vxd-portfolio-brief',
      title: 'PORTFOLIO INTELLIGENCE BRIEF — Q3',
      accentHex: '#0F172A',
      contentPackRef: 'pack-vxd-portfolio-brief',
      showName: 'STUDIO INTELLIGENCE',
      campaignName: 'PORTFOLIO Q3',
      approvalStatus: 'approved',
      calendarSlot: 'mon-pm',
      routingChannels: ['email', 'journal', 'push-notifications'],
      previewEmail: 'PORTFOLIO BRIEF · EXEC SUMMARY',
    }),
    createDistributionPack({
      id: 'dist-vxd-cross-org',
      title: 'CROSS-ORG LEARNING DIGEST',
      accentHex: '#334155',
      contentPackRef: 'pack-vxd-cross-org',
      showName: 'PLATFORM INSIGHTS',
      approvalStatus: 'scheduled',
      calendarSlot: 'fri-am',
      routingChannels: ['email', 'journal'],
    }),
  ],
  channels: withOrgChannelBranding(ADMIN_STUDIO_DISTRIBUTION_CHANNELS, {
    audience: 'PORTFOLIO OPERATORS · STUDIO ADMINISTRATION · PLATFORM TEAM',
    accentHex: '#0F172A',
    ctaRules: 'SLATE CTA · OPEN BRIEF · REVIEW INSIGHT',
    seasonalCampaigns: 'QUARTERLY PORTFOLIO REVIEW · PLATFORM RELEASE',
    membershipExclusives: 'ADMINISTRATION ONLY · NO CROSS-ORG LEAKAGE',
  }),
  campaigns: [],
};

const STUDIO_OS_PROFILE: DistributionNetworkOrgProfile = {
  subtitle: 'ENTERPRISE HOLDING DISTRIBUTION — ALL IN ONE ENTERPRISE.',
  audience: 'ENTERPRISE BRANDS · INTERNAL STAKEHOLDERS · HOLDING LEADERSHIP',
  accentHex: '#2563EB',
  ctaRules: 'BLUE CTA · OPEN INITIATIVE · REVIEW PLAN',
  seasonalCampaigns: 'ENTERPRISE LAUNCH · BRAND ROLLOUT',
  membershipExclusives: 'HOLDING EXECUTIVES · BRAND LEADS ONLY',
  packs: [
    createDistributionPack({
      id: 'dist-aio-brand-rollout',
      title: 'BRAND ROLLOUT — ENTERPRISE INITIATIVE',
      accentHex: '#2563EB',
      contentPackRef: 'pack-aio-brand-rollout',
      showName: 'ENTERPRISE CAMPAIGNS',
      campaignName: 'HOLDING Q3',
      approvalStatus: 'approved',
      calendarSlot: 'tue-am',
      routingChannels: ['email', 'journal', 'mobile-website', 'push-notifications'],
    }),
    createDistributionPack({
      id: 'dist-aio-automation',
      title: 'AUTOMATION PLAYBOOK — DISTRIBUTION',
      accentHex: '#1D4ED8',
      contentPackRef: 'pack-aio-automation',
      showName: 'AUTOMATION',
      approvalStatus: 'pending',
      calendarSlot: 'wed-pm',
      routingChannels: ['email', 'journal'],
    }),
  ],
  channels: withOrgChannelBranding(ADMIN_STUDIO_DISTRIBUTION_CHANNELS, {
    audience: 'ENTERPRISE BRANDS · INTERNAL STAKEHOLDERS · HOLDING LEADERSHIP',
    accentHex: '#2563EB',
    ctaRules: 'BLUE CTA · OPEN INITIATIVE · REVIEW PLAN',
    seasonalCampaigns: 'ENTERPRISE LAUNCH · BRAND ROLLOUT',
    membershipExclusives: 'HOLDING EXECUTIVES · BRAND LEADS ONLY',
  }),
  campaigns: [],
};

const FRONTAL_SLAYER_PROFILE: DistributionNetworkOrgProfile = {
  subtitle: ADMIN_STUDIO_DISTRIBUTION_NETWORK_SUBTITLE,
  audience: 'FRONTAL SLAYER MEMBERS & GUESTS',
  accentHex: '#EB1C24',
  ctaRules: 'BRAND RED CTA · SHOP LINK',
  seasonalCampaigns: 'SUMMER SLAY · HOLIDAY GLOW',
  membershipExclusives: 'PREMIUM EARLY ACCESS',
  packs: ADMIN_STUDIO_DISTRIBUTION_PACK_DEFAULTS,
  channels: ADMIN_STUDIO_DISTRIBUTION_CHANNELS,
  campaigns: ADMIN_STUDIO_DISTRIBUTION_CAMPAIGNS,
};

const PROFILES: Record<ModuleTenantId, DistributionNetworkOrgProfile> = {
  'frontal-slayer': FRONTAL_SLAYER_PROFILE,
  ndxbook: NDXBOOK_PROFILE,
  'studio-os': STUDIO_OS_PROFILE,
  portfolio: VXD_PROFILE,
};

export function getDistributionNetworkOrgProfile(moduleTenantId?: ModuleTenantId): DistributionNetworkOrgProfile {
  const tenant = moduleTenantId ?? getActiveModuleTenantId();
  return PROFILES[tenant] ?? FRONTAL_SLAYER_PROFILE;
}

export function getDistributionNetworkSubtitle(moduleTenantId?: ModuleTenantId): string {
  return getDistributionNetworkOrgProfile(moduleTenantId).subtitle;
}

export function getDistributionPackDefaults(moduleTenantId?: ModuleTenantId): DistributionPack[] {
  return getDistributionNetworkOrgProfile(moduleTenantId).packs;
}

export function getDistributionChannelDefaults(moduleTenantId?: ModuleTenantId): DistributionChannel[] {
  return getDistributionNetworkOrgProfile(moduleTenantId).channels;
}

export function getDistributionCampaignDefaults(moduleTenantId?: ModuleTenantId): DistributionCampaign[] {
  return getDistributionNetworkOrgProfile(moduleTenantId).campaigns;
}

export function getDistributionNetworkAccent(moduleTenantId?: ModuleTenantId): string {
  return getDistributionNetworkOrgProfile(moduleTenantId).accentHex;
}
