/** DISTRIBUTION NETWORK — centralized broadcasting & channel routing (CMS-ready). */

export const ADMIN_STUDIO_DISTRIBUTION_NETWORK_SUBTITLE =
  'ONE STORY. EVERY DESTINATION. — THE BROADCASTING DEPARTMENT OF FRONTAL SLAYER STUDIOS.';

export type DistributionDashboardSectionId =
  | 'distribution-queue'
  | 'publishing-calendar'
  | 'channel-status'
  | 'scheduled-releases'
  | 'recently-published'
  | 'failed-deliveries'
  | 'approval-queue'
  | 'analytics-snapshot';

export const DISTRIBUTION_DASHBOARD_SECTIONS: Array<{
  id: DistributionDashboardSectionId;
  title: string;
  metric: string;
  description: string;
}> = [
  { id: 'distribution-queue', title: 'DISTRIBUTION QUEUE', metric: '12', description: 'APPROVED PACKS AWAITING ROUTING' },
  { id: 'publishing-calendar', title: 'PUBLISHING CALENDAR', metric: '14', description: 'DAILY · WEEKLY · MONTHLY · CAMPAIGN' },
  { id: 'channel-status', title: 'CHANNEL STATUS', metric: '10/14', description: 'ACTIVE CHANNELS · COMING SOON' },
  { id: 'scheduled-releases', title: 'SCHEDULED RELEASES', metric: '6', description: 'LOCKED PUBLISH SLOTS' },
  { id: 'recently-published', title: 'RECENTLY PUBLISHED', metric: '24', description: 'LAST 30 DAYS' },
  { id: 'failed-deliveries', title: 'FAILED DELIVERIES', metric: '2', description: 'RETRY OR CANCEL' },
  { id: 'approval-queue', title: 'APPROVAL QUEUE', metric: '5', description: 'NEEDS REVIEW BEFORE SCHEDULE' },
  { id: 'analytics-snapshot', title: 'ANALYTICS SNAPSHOT', metric: '—', description: 'UTILIZATION · TOP CHANNELS' },
];

export type DistributionChannelId =
  | 'mobile-website'
  | 'lounge-tv'
  | 'journal'
  | 'email'
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'pinterest'
  | 'x'
  | 'push-notifications'
  | 'desktop-mansion'
  | 'mobile-app'
  | 'public-api'
  | 'future-integrations';

export type DistributionChannelActivation = 'ACTIVE' | 'COMING_SOON' | 'FUTURE';

export type DistributionApprovalStatus =
  | 'ready'
  | 'pending'
  | 'needs-review'
  | 'approved'
  | 'scheduled'
  | 'publishing'
  | 'published'
  | 'archived';

export type DistributionDeliveryStatus =
  | 'queued'
  | 'publishing'
  | 'published'
  | 'failed'
  | 'retry'
  | 'cancelled';

export type DistributionCalendarSlotId =
  | 'mon-am'
  | 'mon-pm'
  | 'tue-am'
  | 'tue-pm'
  | 'wed-am'
  | 'wed-pm'
  | 'thu-am'
  | 'thu-pm'
  | 'fri-am'
  | 'fri-pm'
  | 'sat-am'
  | 'sun-pm';

export const DISTRIBUTION_CALENDAR_SLOTS: Array<{ id: DistributionCalendarSlotId; label: string; day: string }> = [
  { id: 'mon-am', label: 'MON AM', day: 'MON' },
  { id: 'mon-pm', label: 'MON PM', day: 'MON' },
  { id: 'tue-am', label: 'TUE AM', day: 'TUE' },
  { id: 'tue-pm', label: 'TUE PM', day: 'TUE' },
  { id: 'wed-am', label: 'WED AM', day: 'WED' },
  { id: 'wed-pm', label: 'WED PM', day: 'WED' },
  { id: 'thu-am', label: 'THU AM', day: 'THU' },
  { id: 'thu-pm', label: 'THU PM', day: 'THU' },
  { id: 'fri-am', label: 'FRI AM', day: 'FRI' },
  { id: 'fri-pm', label: 'FRI PM', day: 'FRI' },
  { id: 'sat-am', label: 'SAT AM', day: 'SAT' },
  { id: 'sun-pm', label: 'SUN PM', day: 'SUN' },
];

export type DistributionCalendarView = 'daily' | 'weekly' | 'monthly' | 'campaign' | 'launch' | 'season';

export const DISTRIBUTION_CALENDAR_VIEWS: Array<{ id: DistributionCalendarView; label: string }> = [
  { id: 'daily', label: 'DAILY' },
  { id: 'weekly', label: 'WEEKLY' },
  { id: 'monthly', label: 'MONTHLY' },
  { id: 'campaign', label: 'CAMPAIGN' },
  { id: 'launch', label: 'LAUNCH' },
  { id: 'season', label: 'SEASON' },
];

export type DistributionChannel = {
  id: DistributionChannelId;
  activation: DistributionChannelActivation;
  accentHex: string;
  name: string;
  purpose: string;
  audience: string;
  publishingRules: string;
  assetRequirements: string;
  schedulingRules: string;
  status: string;
  supportedAssetTypes: string;
  imageRatios: string;
  videoRatios: string;
  maxVideoLength: string;
  captionLength: string;
  ctaRules: string;
  thumbnailRules: string;
  metadataRequirements: string;
  seoRules: string;
  publishingApproval: string;
  lastPublish: string;
  avgPublishTime: string;
  successRate: string;
  failedDeliveries: string;
  queueLength: string;
  pendingApprovals: string;
  preferredPublishDays: string;
  preferredPublishTimes: string;
  launchWindows: string;
  holidayRules: string;
  seasonalCampaigns: string;
  membershipExclusives: string;
};

export type DistributionChannelVersion = {
  caption: string;
  cta: string;
  thumbnail: string;
  metadata: string;
};

export type DistributionPack = {
  id: string;
  accentHex: string;
  title: string;
  contentPackRef: string;
  showName: string;
  campaignName: string;
  approvalStatus: DistributionApprovalStatus;
  deliveryStatus: DistributionDeliveryStatus;
  routingChannels: DistributionChannelId[];
  routingOverride: string;
  calendarSlot: DistributionCalendarSlotId;
  scheduledDate: string;
  scheduledTime: string;
  lastUpdated: string;
  validationThumbnail: string;
  validationCta: string;
  validationMetadata: string;
  validationProducts: string;
  validationMembership: string;
  validationRewards: string;
  validationSeo: string;
  validationTranscript: string;
  validationPassed: boolean;
  previewInstagram: string;
  previewJournal: string;
  previewEmail: string;
  previewLoungeTv: string;
  previewWebsite: string;
  previewPinterest: string;
  channelVersions: Partial<Record<DistributionChannelId, DistributionChannelVersion>>;
  analyticsPublished: string;
  analyticsScheduled: string;
  analyticsFailed: string;
  analyticsAvgPublishTime: string;
};

export type DistributionCampaign = {
  id: string;
  title: string;
  accentHex: string;
  description: string;
  packIds: string[];
  channels: DistributionChannelId[];
  timeline: string;
  reusable: boolean;
};

export const DISTRIBUTION_INHERITANCE_CHAIN = [
  'BRAND BRAIN',
  'CREATIVE DIRECTOR',
  'PRODUCTION PIPELINE',
  'AI PRODUCTION ENGINE',
  'DISTRIBUTION NETWORK',
  'PUBLISHING',
  'ANALYTICS',
] as const;

export const DISTRIBUTION_FUTURE_CHANNELS = [
  'DESKTOP MANSION',
  'MOBILE APP',
  'SMART TV',
  'APPLE VISION',
  'IN-STORE DISPLAYS',
  'DIGITAL SIGNAGE',
  'COMMUNITY PORTAL',
  'PARTNER SITES',
] as const;

export type DistributionPackTabId =
  | 'routing'
  | 'calendar'
  | 'requirements'
  | 'previews'
  | 'versioning'
  | 'approval'
  | 'delivery'
  | 'analytics';

export const DISTRIBUTION_PACK_TABS: Array<{ id: DistributionPackTabId; label: string }> = [
  { id: 'routing', label: 'ROUTING' },
  { id: 'calendar', label: 'CALENDAR' },
  { id: 'requirements', label: 'REQUIREMENTS' },
  { id: 'previews', label: 'PREVIEWS' },
  { id: 'versioning', label: 'VERSIONS' },
  { id: 'approval', label: 'APPROVAL' },
  { id: 'delivery', label: 'DELIVERY' },
  { id: 'analytics', label: 'ANALYTICS' },
];

export type DistributionChannelTabId = 'profile' | 'rules' | 'scheduling' | 'health';

export const DISTRIBUTION_CHANNEL_TABS: Array<{ id: DistributionChannelTabId; label: string }> = [
  { id: 'profile', label: 'PROFILE' },
  { id: 'rules', label: 'RULES' },
  { id: 'scheduling', label: 'SCHEDULING' },
  { id: 'health', label: 'HEALTH' },
];

export type DistributionPackFieldKey = keyof Omit<
  DistributionPack,
  'id' | 'accentHex' | 'approvalStatus' | 'deliveryStatus' | 'routingChannels' | 'channelVersions' | 'validationPassed'
>;

export type DistributionChannelFieldKey = keyof Omit<DistributionChannel, 'id' | 'activation' | 'accentHex'>;

export type DistributionFieldGroup<T extends string> = {
  title: string;
  fields: Array<{ key: T; label: string; multiline?: boolean }>;
};

export const DISTRIBUTION_CHANNEL_PROFILE_GROUPS: DistributionFieldGroup<DistributionChannelFieldKey>[] = [
  {
    title: 'CHANNEL IDENTITY',
    fields: [
      { key: 'name', label: 'NAME' },
      { key: 'purpose', label: 'PURPOSE', multiline: true },
      { key: 'audience', label: 'AUDIENCE' },
      { key: 'status', label: 'STATUS' },
    ],
  },
  {
    title: 'PUBLISHING',
    fields: [
      { key: 'publishingRules', label: 'PUBLISHING RULES', multiline: true },
      { key: 'assetRequirements', label: 'ASSET REQUIREMENTS', multiline: true },
      { key: 'schedulingRules', label: 'SCHEDULING RULES', multiline: true },
    ],
  },
];

export const DISTRIBUTION_CHANNEL_RULES_GROUPS: DistributionFieldGroup<DistributionChannelFieldKey>[] = [
  {
    title: 'CHANNEL PROFILE',
    fields: [
      { key: 'supportedAssetTypes', label: 'SUPPORTED ASSET TYPES', multiline: true },
      { key: 'imageRatios', label: 'IMAGE RATIOS' },
      { key: 'videoRatios', label: 'VIDEO RATIOS' },
      { key: 'maxVideoLength', label: 'MAX VIDEO LENGTH' },
      { key: 'captionLength', label: 'CAPTION LENGTH' },
      { key: 'ctaRules', label: 'CTA RULES', multiline: true },
      { key: 'thumbnailRules', label: 'THUMBNAIL RULES', multiline: true },
      { key: 'metadataRequirements', label: 'METADATA REQUIREMENTS', multiline: true },
      { key: 'seoRules', label: 'SEO RULES', multiline: true },
      { key: 'publishingApproval', label: 'PUBLISHING APPROVAL' },
    ],
  },
];

export const DISTRIBUTION_CHANNEL_SCHEDULING_GROUPS: DistributionFieldGroup<DistributionChannelFieldKey>[] = [
  {
    title: 'SMART SCHEDULING — PREP ONLY',
    fields: [
      { key: 'preferredPublishDays', label: 'PREFERRED PUBLISH DAYS', multiline: true },
      { key: 'preferredPublishTimes', label: 'PREFERRED PUBLISH TIMES', multiline: true },
      { key: 'launchWindows', label: 'LAUNCH WINDOWS', multiline: true },
      { key: 'holidayRules', label: 'HOLIDAY RULES', multiline: true },
      { key: 'seasonalCampaigns', label: 'SEASONAL CAMPAIGNS', multiline: true },
      { key: 'membershipExclusives', label: 'MEMBERSHIP EXCLUSIVES', multiline: true },
    ],
  },
];

export const DISTRIBUTION_PACK_REQUIREMENTS_GROUPS: DistributionFieldGroup<DistributionPackFieldKey>[] = [
  {
    title: 'CHANNEL REQUIREMENTS',
    fields: [
      { key: 'validationThumbnail', label: 'REQUIRED THUMBNAIL' },
      { key: 'validationCta', label: 'REQUIRED CTA' },
      { key: 'validationMetadata', label: 'REQUIRED METADATA' },
      { key: 'validationProducts', label: 'REQUIRED PRODUCTS' },
      { key: 'validationMembership', label: 'MEMBERSHIP RULES' },
      { key: 'validationRewards', label: 'REWARD RULES' },
      { key: 'validationSeo', label: 'REQUIRED SEO' },
      { key: 'validationTranscript', label: 'REQUIRED TRANSCRIPT' },
    ],
  },
];

export const DISTRIBUTION_PACK_PREVIEW_FIELDS: Array<{ key: DistributionPackFieldKey; label: string }> = [
  { key: 'previewInstagram', label: 'INSTAGRAM PREVIEW' },
  { key: 'previewJournal', label: 'JOURNAL PREVIEW' },
  { key: 'previewEmail', label: 'EMAIL PREVIEW' },
  { key: 'previewLoungeTv', label: 'LOUNGE TV PREVIEW' },
  { key: 'previewWebsite', label: 'WEBSITE PREVIEW' },
  { key: 'previewPinterest', label: 'PINTEREST PREVIEW' },
];

export const DISTRIBUTION_ANALYTICS_METRICS = [
  { key: 'analyticsPublished' as const, label: 'PUBLISHED ASSETS' },
  { key: 'analyticsScheduled' as const, label: 'SCHEDULED ASSETS' },
  { key: 'analyticsFailed' as const, label: 'FAILED ASSETS' },
  { key: 'analyticsAvgPublishTime' as const, label: 'AVG PUBLISH TIME' },
];

const ACTIVE_CHANNEL_DEFS: Array<{ id: DistributionChannelId; name: string; accentHex: string }> = [
  { id: 'mobile-website', name: 'MOBILE WEBSITE', accentHex: '#EB1C24' },
  { id: 'lounge-tv', name: 'LOUNGE TV', accentHex: '#C41E3A' },
  { id: 'journal', name: 'JOURNAL', accentHex: '#8B0000' },
  { id: 'email', name: 'EMAIL', accentHex: '#EB1C24' },
  { id: 'instagram', name: 'INSTAGRAM', accentHex: '#CA8A04' },
  { id: 'facebook', name: 'FACEBOOK', accentHex: '#2563EB' },
  { id: 'tiktok', name: 'TIKTOK', accentHex: '#000000' },
  { id: 'pinterest', name: 'PINTEREST', accentHex: '#EB1C24' },
  { id: 'x', name: 'X', accentHex: '#6B7280' },
  { id: 'push-notifications', name: 'PUSH NOTIFICATIONS', accentHex: '#16A34A' },
];

const COMING_SOON_DEFS: Array<{ id: DistributionChannelId; name: string }> = [
  { id: 'desktop-mansion', name: 'DESKTOP MANSION' },
  { id: 'mobile-app', name: 'MOBILE APP' },
  { id: 'public-api', name: 'PUBLIC API' },
  { id: 'future-integrations', name: 'FUTURE INTEGRATIONS' },
];

function createChannel(
  def: { id: DistributionChannelId; name: string; accentHex?: string },
  activation: DistributionChannelActivation,
  partial?: Partial<DistributionChannel>
): DistributionChannel {
  return {
    accentHex: def.accentHex ?? '#9CA3AF',
    name: def.name,
    purpose: 'LUXURY CONTENT DISTRIBUTION',
    audience: 'FRONTAL SLAYER MEMBERS & GUESTS',
    publishingRules: 'MANUAL APPROVAL REQUIRED · NO AUTO-PUBLISH',
    assetRequirements: 'MASTER CONTENT PACK ASSETS',
    schedulingRules: 'PREFERRED SLOTS — ADMIN CONFIRMS',
    status: activation === 'ACTIVE' ? 'ACTIVE' : 'COMING SOON',
    supportedAssetTypes: 'VIDEO · IMAGE · TEXT · METADATA',
    imageRatios: '9:16 · 4:5 · 1:1',
    videoRatios: '9:16 · 16:9',
    maxVideoLength: '90 SEC',
    captionLength: '2200 CHAR',
    ctaRules: 'BRAND RED CTA · SHOP LINK',
    thumbnailRules: 'LUXURY EDITORIAL · NO CLUTTER',
    metadataRequirements: 'TITLE · DESCRIPTION · TAGS',
    seoRules: 'KEYWORDS · SLUG · OG TAGS',
    publishingApproval: 'REQUIRED',
    lastPublish: 'JUL 2',
    avgPublishTime: '4.2 MIN',
    successRate: '98%',
    failedDeliveries: '0',
    queueLength: '3',
    pendingApprovals: '1',
    preferredPublishDays: 'TUE · THU · FRI',
    preferredPublishTimes: '7PM ET · 12PM ET',
    launchWindows: 'CAMPAIGN LAUNCH · SEASON PREMIERE',
    holidayRules: 'NO PUBLISH DEC 24–25',
    seasonalCampaigns: 'SUMMER SLAY · HOLIDAY GLOW',
    membershipExclusives: 'PREMIUM EARLY ACCESS',
    ...partial,
    id: def.id,
    activation,
  };
}

export const ADMIN_STUDIO_DISTRIBUTION_CHANNELS: DistributionChannel[] = [
  ...ACTIVE_CHANNEL_DEFS.map((d) => createChannel(d, 'ACTIVE')),
  ...COMING_SOON_DEFS.map((d) => createChannel(d, 'COMING_SOON', { status: 'ARCHITECTURE ONLY' })),
];

export const DEFAULT_SLAY_REPORT_ROUTING: DistributionChannelId[] = [
  'lounge-tv',
  'journal',
  'instagram',
  'pinterest',
  'email',
  'push-notifications',
  'mobile-website',
];

function createDistributionPack(partial: Partial<DistributionPack> & Pick<DistributionPack, 'id' | 'title'>): DistributionPack {
  const routing = partial.routingChannels ?? DEFAULT_SLAY_REPORT_ROUTING;
  return {
    accentHex: '#EB1C24',
    contentPackRef: partial.id,
    showName: 'THE SLAY REPORT',
    campaignName: 'SUMMER SLAY',
    approvalStatus: 'approved',
    deliveryStatus: 'queued',
    routingChannels: routing,
    routingOverride: '',
    calendarSlot: 'fri-pm',
    scheduledDate: '2026-07-04',
    scheduledTime: '7:00 PM ET',
    lastUpdated: 'JUL 4',
    validationThumbnail: 'PASS',
    validationCta: 'PASS',
    validationMetadata: 'PASS',
    validationProducts: 'PASS',
    validationMembership: 'PASS',
    validationRewards: 'N/A',
    validationSeo: 'PASS',
    validationTranscript: 'PASS',
    validationPassed: true,
    previewInstagram: 'REEL · CAROUSEL · CAPTION v2',
    previewJournal: 'ARTICLE · HERO · READ TIME 4 MIN',
    previewEmail: 'HTML TEMPLATE · SUBJECT LINE LOCKED',
    previewLoungeTv: 'EPISODE · THUMBNAIL · CHECKLIST',
    previewWebsite: 'HERO · METADATA · SEO',
    previewPinterest: 'PIN · 2:3 · KEYWORDS',
    channelVersions: {
      instagram: { caption: 'CHERRY RED FORECAST — SLAY REPORT EP 13', cta: 'SHOP NOIR', thumbnail: 'v2.1', metadata: 'IG-EP13-2026' },
      journal: { caption: 'THE CHERRY RED MOMENT', cta: 'READ MORE', thumbnail: 'v1.0', metadata: 'JR-EP13' },
      email: { caption: 'YOUR FRIDAY SLAY REPORT', cta: 'WATCH NOW', thumbnail: 'v1.2', metadata: 'EM-EP13' },
    },
    analyticsPublished: '0',
    analyticsScheduled: '7',
    analyticsFailed: '0',
    analyticsAvgPublishTime: '—',
    ...partial,
  };
}

export const ADMIN_STUDIO_DISTRIBUTION_PACK_DEFAULTS: DistributionPack[] = [
  createDistributionPack({
    id: 'dist-slay-report-13',
    title: 'SLAY REPORT EP 13 — CHERRY RED FORECAST',
    contentPackRef: 'pack-slay-report-13',
    approvalStatus: 'scheduled',
    deliveryStatus: 'queued',
    calendarSlot: 'fri-pm',
    scheduledDate: '2026-07-04',
    scheduledTime: '7:00 PM ET',
  }),
  createDistributionPack({
    id: 'dist-psa-22',
    title: 'PSA ANALYZES EP 22',
    accentHex: '#C41E3A',
    contentPackRef: 'pack-psa-22',
    showName: 'PSA ANALYZES',
    approvalStatus: 'needs-review',
    deliveryStatus: 'queued',
    validationPassed: false,
    validationThumbnail: 'PENDING',
    calendarSlot: 'thu-pm',
    routingChannels: ['lounge-tv', 'journal', 'email', 'mobile-website'],
  }),
  createDistributionPack({
    id: 'dist-campaign-summer',
    title: 'SUMMER LAUNCH MANIFESTO',
    contentPackRef: 'pack-campaign-summer',
    showName: 'CAMPAIGN FILMS',
    campaignName: 'SUMMER LAUNCH',
    approvalStatus: 'approved',
    deliveryStatus: 'publishing',
    calendarSlot: 'tue-am',
    analyticsScheduled: '10',
  }),
  createDistributionPack({
    id: 'dist-slay-lab-8',
    title: 'SLAY LAB EP 8 — LACE TENSION',
    accentHex: '#8B0000',
    contentPackRef: 'pack-slay-lab-8',
    showName: 'SLAY LAB',
    approvalStatus: 'pending',
    deliveryStatus: 'queued',
    calendarSlot: 'wed-am',
    routingChannels: ['lounge-tv', 'journal', 'tiktok', 'instagram'],
  }),
  createDistributionPack({
    id: 'dist-build-5',
    title: 'BUILD STUDIO EP 5',
    contentPackRef: 'pack-build-5',
    showName: 'BUILD STUDIO',
    approvalStatus: 'published',
    deliveryStatus: 'published',
    calendarSlot: 'mon-pm',
    analyticsPublished: '6',
    analyticsScheduled: '0',
  }),
  createDistributionPack({
    id: 'dist-failed-demo',
    title: 'OCEAN CURL CAMPAIGN — RETRY',
    accentHex: '#2563EB',
    showName: 'PRODUCT SPOTLIGHT',
    approvalStatus: 'approved',
    deliveryStatus: 'failed',
    validationPassed: true,
    analyticsFailed: '1',
    calendarSlot: 'sat-am',
  }),
];

export const ADMIN_STUDIO_DISTRIBUTION_CAMPAIGNS: DistributionCampaign[] = [
  {
    id: 'campaign-launch-week',
    title: 'LAUNCH WEEK',
    accentHex: '#EB1C24',
    description: 'EPISODE → JOURNAL → EMAIL → SOCIAL → PUSH → HERO',
    packIds: ['dist-slay-report-13', 'dist-campaign-summer'],
    channels: ['lounge-tv', 'journal', 'email', 'instagram', 'tiktok', 'pinterest', 'push-notifications', 'mobile-website'],
    timeline: 'MON HERO → TUE JOURNAL → WED SOCIAL → THU EMAIL → FRI EPISODE → SAT PUSH',
    reusable: true,
  },
  {
    id: 'campaign-summer-slay',
    title: 'SUMMER SLAY',
    accentHex: '#CA8A04',
    description: 'SEASONAL CAMPAIGN — REUSABLE TEMPLATE',
    packIds: ['dist-campaign-summer'],
    channels: ['instagram', 'pinterest', 'email', 'mobile-website'],
    timeline: 'LAUNCH WINDOW AUG 1–15',
    reusable: true,
  },
];

export function getDistributionChannelById(id: string): DistributionChannel | undefined {
  return ADMIN_STUDIO_DISTRIBUTION_CHANNELS.find((c) => c.id === id);
}

export function getDistributionPackById(id: string): DistributionPack | undefined {
  return ADMIN_STUDIO_DISTRIBUTION_PACK_DEFAULTS.find((p) => p.id === id);
}

export function inferRoutingForShow(showName: string): DistributionChannelId[] {
  const upper = showName.toUpperCase();
  if (upper.includes('SLAY REPORT')) return DEFAULT_SLAY_REPORT_ROUTING;
  if (upper.includes('PSA')) return ['lounge-tv', 'journal', 'email', 'mobile-website'];
  if (upper.includes('CAMPAIGN')) return ['mobile-website', 'instagram', 'email', 'pinterest'];
  return ['lounge-tv', 'journal', 'mobile-website'];
}

export function validateDistributionPack(pack: DistributionPack): boolean {
  return [
    pack.validationThumbnail,
    pack.validationCta,
    pack.validationMetadata,
    pack.validationProducts,
    pack.validationSeo,
    pack.validationTranscript,
  ].every((v) => v === 'PASS' || v === 'N/A');
}

export function createBlankDistributionPack(title: string): DistributionPack {
  const id = `dist-custom-${Date.now()}`;
  return createDistributionPack({
    id,
    title: title.toUpperCase(),
    contentPackRef: id,
    approvalStatus: 'ready',
    deliveryStatus: 'queued',
    routingChannels: DEFAULT_SLAY_REPORT_ROUTING,
    validationPassed: false,
    validationThumbnail: 'PENDING',
    validationCta: 'PENDING',
    validationMetadata: 'PENDING',
    validationProducts: 'PENDING',
    validationMembership: 'PENDING',
    validationRewards: 'PENDING',
    validationSeo: 'PENDING',
    validationTranscript: 'PENDING',
  });
}

export const DISTRIBUTION_APPROVAL_STATUSES: DistributionApprovalStatus[] = [
  'ready',
  'pending',
  'needs-review',
  'approved',
  'scheduled',
  'publishing',
  'published',
  'archived',
];

export const DISTRIBUTION_DELIVERY_STATUSES: DistributionDeliveryStatus[] = [
  'queued',
  'publishing',
  'published',
  'failed',
  'retry',
  'cancelled',
];
