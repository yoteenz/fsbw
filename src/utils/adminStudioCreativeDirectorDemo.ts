/** CREATIVE DIRECTOR — demo seeds, options, and executive dashboard defaults. */

export const ADMIN_STUDIO_CREATIVE_DIRECTOR_SUBTITLE =
  'THE MIND BEHIND EVERY FRONTAL SLAYER STORY — DECISION ENGINE BEFORE ANY AI PROVIDER.';

export type CreativeDirectorTabId =
  | 'overview'
  | 'decide'
  | 'validate'
  | 'strategy'
  | 'review'
  | 'ideas';

export const CREATIVE_DIRECTOR_TABS: Array<{ id: CreativeDirectorTabId; label: string }> = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'decide', label: 'DECIDE' },
  { id: 'validate', label: 'VALIDATE' },
  { id: 'strategy', label: 'STRATEGY' },
  { id: 'review', label: 'REVIEW' },
  { id: 'ideas', label: 'IDEAS' },
];

export type ContentPurposeId =
  | 'educational'
  | 'entertainment'
  | 'editorial'
  | 'promotional'
  | 'seasonal'
  | 'product-launch'
  | 'community';

export const CONTENT_PURPOSE_OPTIONS: Array<{ id: ContentPurposeId; label: string }> = [
  { id: 'educational', label: 'EDUCATIONAL' },
  { id: 'entertainment', label: 'ENTERTAINMENT' },
  { id: 'editorial', label: 'EDITORIAL' },
  { id: 'promotional', label: 'PROMOTIONAL' },
  { id: 'seasonal', label: 'SEASONAL' },
  { id: 'product-launch', label: 'PRODUCT LAUNCH' },
  { id: 'community', label: 'COMMUNITY' },
];

export type CreativeOutputId =
  | 'lounge-episode'
  | 'journal'
  | 'email'
  | 'instagram-reel'
  | 'instagram-carousel'
  | 'tiktok'
  | 'pinterest'
  | 'push-notification'
  | 'psa-training'
  | 'seo-expansion';

export type OutputTier = 'required' | 'recommended' | 'optional' | 'off';

export const CREATIVE_OUTPUT_DEFINITIONS: Array<{
  id: CreativeOutputId;
  label: string;
  defaultTier: OutputTier;
}> = [
  { id: 'lounge-episode', label: 'LOUNGE TV EPISODE', defaultTier: 'required' },
  { id: 'journal', label: 'JOURNAL', defaultTier: 'required' },
  { id: 'email', label: 'EMAIL', defaultTier: 'required' },
  { id: 'instagram-reel', label: 'INSTAGRAM REEL', defaultTier: 'recommended' },
  { id: 'instagram-carousel', label: 'INSTAGRAM CAROUSEL', defaultTier: 'recommended' },
  { id: 'tiktok', label: 'TIKTOK', defaultTier: 'recommended' },
  { id: 'pinterest', label: 'PINTEREST', defaultTier: 'recommended' },
  { id: 'push-notification', label: 'PUSH NOTIFICATION', defaultTier: 'optional' },
  { id: 'psa-training', label: 'PSA TRAINING', defaultTier: 'optional' },
  { id: 'seo-expansion', label: 'SEO EXPANSION', defaultTier: 'optional' },
];

export type CreativeTimelineStepId =
  | 'idea'
  | 'research'
  | 'planning'
  | 'generation'
  | 'review'
  | 'scheduling'
  | 'publishing'
  | 'analytics';

export const CREATIVE_TIMELINE_STEPS: Array<{ id: CreativeTimelineStepId; label: string }> = [
  { id: 'idea', label: 'IDEA' },
  { id: 'research', label: 'RESEARCH' },
  { id: 'planning', label: 'PLANNING' },
  { id: 'generation', label: 'GENERATION' },
  { id: 'review', label: 'REVIEW' },
  { id: 'scheduling', label: 'SCHEDULING' },
  { id: 'publishing', label: 'PUBLISHING' },
  { id: 'analytics', label: 'ANALYTICS' },
];

export type DistributionChannelId =
  | 'mobile-website'
  | 'lounge-tv'
  | 'email'
  | 'instagram'
  | 'tiktok'
  | 'pinterest'
  | 'desktop-mansion'
  | 'mobile-app';

export const CREATIVE_DISTRIBUTION_CHANNELS: Array<{
  id: DistributionChannelId;
  label: string;
  activation: 'ACTIVE' | 'COMING_SOON';
  defaultEnabled: boolean;
  demoEngagement: string;
}> = [
  { id: 'mobile-website', label: 'MOBILE WEBSITE', activation: 'ACTIVE', defaultEnabled: true, demoEngagement: '12.4K VIEWS / WK' },
  { id: 'lounge-tv', label: 'LOUNGE TV', activation: 'ACTIVE', defaultEnabled: true, demoEngagement: '8.2K WATCH HRS' },
  { id: 'email', label: 'EMAIL', activation: 'ACTIVE', defaultEnabled: true, demoEngagement: '41% OPEN RATE' },
  { id: 'instagram', label: 'INSTAGRAM', activation: 'ACTIVE', defaultEnabled: true, demoEngagement: '6.8% ENG RATE' },
  { id: 'tiktok', label: 'TIKTOK', activation: 'ACTIVE', defaultEnabled: true, demoEngagement: '22K REACH / POST' },
  { id: 'pinterest', label: 'PINTEREST', activation: 'ACTIVE', defaultEnabled: true, demoEngagement: '3.1K SAVES / WK' },
  { id: 'desktop-mansion', label: 'DESKTOP MANSION', activation: 'COMING_SOON', defaultEnabled: false, demoEngagement: 'PHASE 2' },
  { id: 'mobile-app', label: 'MOBILE APP', activation: 'COMING_SOON', defaultEnabled: false, demoEngagement: 'PHASE 2' },
];

export const PROMPT_ASSEMBLER_STAGES = [
  { id: 'brand-brain', label: 'BRAND BRAIN' },
  { id: 'show-bible', label: 'SHOW BIBLE' },
  { id: 'editorial-rules', label: 'EDITORIAL RULES' },
  { id: 'campaign-framework', label: 'CAMPAIGN FRAMEWORK' },
  { id: 'prompt-framework', label: 'PROMPT FRAMEWORK' },
  { id: 'product-knowledge', label: 'PRODUCT KNOWLEDGE' },
  { id: 'cta-library', label: 'CTA LIBRARY' },
  { id: 'distribution-rules', label: 'DISTRIBUTION RULES' },
  { id: 'master-prompt', label: 'MASTER PROMPT' },
] as const;

export type BrandDimensionId =
  | 'luxury'
  | 'educational'
  | 'interactive'
  | 'community'
  | 'premium'
  | 'original'
  | 'elegant'
  | 'modern'
  | 'rewardOpportunity'
  | 'membershipValue'
  | 'productIntegration';

export const BRAND_DIMENSION_LABELS: Record<BrandDimensionId, string> = {
  luxury: 'LUXURY',
  educational: 'EDUCATIONAL',
  interactive: 'INTERACTIVE',
  community: 'COMMUNITY',
  premium: 'PREMIUM',
  original: 'ORIGINAL',
  elegant: 'ELEGANT',
  modern: 'MODERN',
  rewardOpportunity: 'REWARD OPPORTUNITY',
  membershipValue: 'MEMBERSHIP VALUE',
  productIntegration: 'PRODUCT INTEGRATION',
};

export type ContentScoreId =
  | 'originality'
  | 'entertainment'
  | 'educationalValue'
  | 'viralityPotential'
  | 'conversionPotential'
  | 'membershipValue'
  | 'communityValue'
  | 'shareability'
  | 'evergreenValue'
  | 'productionValue';

export const CONTENT_SCORE_LABELS: Record<ContentScoreId, string> = {
  originality: 'ORIGINALITY',
  entertainment: 'ENTERTAINMENT',
  educationalValue: 'EDUCATIONAL VALUE',
  viralityPotential: 'VIRALITY POTENTIAL',
  conversionPotential: 'CONVERSION POTENTIAL',
  membershipValue: 'MEMBERSHIP VALUE',
  communityValue: 'COMMUNITY VALUE',
  shareability: 'SHAREABILITY',
  evergreenValue: 'EVERGREEN VALUE',
  productionValue: 'PRODUCTION VALUE',
};

export const ADMIN_STUDIO_CREATIVE_DIRECTOR_DEFAULTS = {
  topic: 'WHY 250% DENSITY IS NOT FOR EVERYONE',
  selectedShowId: 'the-slay-report',
  campaignGoal: 'EDUCATE ON DENSITY + DRIVE BUILD-A-WIG CONSULTS',
  targetAudience: 'PREMIUM MEMBERS · FIRST-TIME WIG BUYERS',
  membershipTier: 'ALL MEMBERS · PREMIUM GATED OPTIONS',
  primaryCtaId: 'cta-hair-analysis',
  contentPurpose: 'educational' as ContentPurposeId,
  featuredProductIds: ['noir', 'soft-wave'],
  rewardId: 'slay-challenge-checkin',
  environment: 'NEWSROOM DESK · MARBLE BACKDROP · RED ACCENT',
  promptFrameworkId: 'pf-video-episode',
  visualLanguage: 'BOLD RED LOWER THIRD · HANDWRITTEN TITLE · EPISODE BADGE',
  publishingStatus: 'DRAFT',
  approvalStatus: 'draft' as const,
  timelineStep: 'planning' as CreativeTimelineStepId,
  showRecommendationOverride: false,
  manualShowId: '',
};

export const CREATIVE_DIRECTOR_BRIEFING = {
  greetingName: 'TEENA',
  bullets: [
    '1 EPISODE SCHEDULED FOR FRIDAY',
    'CHERRY RED SEARCHES ARE TRENDING UPWARD',
    'BEACH WAVE GENERATED THE HIGHEST ENGAGEMENT THIS WEEK',
    'THE SLAY REPORT IS YOUR TOP-PERFORMING SERIES',
    '3 DRAFT CONTENT PACKS ARE AWAITING REVIEW',
    '2 CAMPAIGNS ARE SCHEDULED THIS MONTH',
  ],
  suggestedTopic: 'WHY 250% DENSITY IS NOT FOR EVERYONE',
  suggestedShowId: 'the-slay-report',
  suggestedCtaId: 'cta-hair-analysis',
  suggestedProductIds: ['noir', 'soft-wave'],
};

export const SHOW_RECOMMENDATION_RULES: Array<{
  keywords: string[];
  showId: string;
  reason: string;
  confidence: number;
}> = [
  {
    keywords: ['cherry red', 'forecast', 'trend', 'seasonal', 'fall', 'summer'],
    showId: 'the-slay-report',
    reason: 'SEASONAL TREND CONTENT PERFORMS BEST INSIDE FORECAST FORMAT.',
    confidence: 92,
  },
  {
    keywords: ['density', 'lace', 'install', 'technique', 'experiment', 'lab'],
    showId: 'slay-lab',
    reason: 'HANDS-ON TECHNIQUE TOPICS FIT SLAY LAB EXPERIMENT STRUCTURE.',
    confidence: 88,
  },
  {
    keywords: ['build', 'customize', 'unit', 'color', 'preview', 'wig'],
    showId: 'build-studio',
    reason: 'PRODUCT WALKTHROUGHS CONVERT BEST IN BUILD STUDIO FORMAT.',
    confidence: 90,
  },
  {
    keywords: ['psa', 'analysis', 'best look', 'consult', 'recommend'],
    showId: 'psa-analyzes',
    reason: 'MEMBER QUESTIONS AND UNIT RECS BELONG IN PSA ANALYZES.',
    confidence: 85,
  },
  {
    keywords: ['lesson', 'academy', 'learn', 'care', 'styling'],
    showId: 'slay-academy',
    reason: 'STRUCTURED EDUCATION SERIES MAXIMIZE LESSON COMPLETION.',
    confidence: 87,
  },
  {
    keywords: ['campaign', 'launch', 'brand', 'film', 'season'],
    showId: 'campaigns',
    reason: 'BRAND FILMS AND LAUNCHES NEED CAMPAIGN CINEMATIC FORMAT.',
    confidence: 84,
  },
  {
    keywords: ['vault', 'archive', 'masterclass', 'exclusive'],
    showId: 'the-vault',
    reason: 'RARE EDUCATION AND ARCHIVE CONTENT FITS THE VAULT.',
    confidence: 80,
  },
  {
    keywords: ['lounge', 'pack', 'weekly', 'featured'],
    showId: 'the-lounge',
    reason: 'WEEKLY PACK SYNC AND STREAMING ROWS LIVE IN THE LOUNGE.',
    confidence: 83,
  },
];

export const CONTENT_OPPORTUNITIES_DEMO = [
  { id: 'opp-1', title: 'SUMMER LACE CARE', source: 'SEASON · CUSTOMER FAQS', priority: 'HIGH' },
  { id: 'opp-2', title: 'CHERRY RED FORECAST', source: 'TRENDING SEARCHES', priority: 'HIGH' },
  { id: 'opp-3', title: 'BEACH WAVE STYLING', source: 'TOP PRODUCT ENGAGEMENT', priority: 'MEDIUM' },
  { id: 'opp-4', title: 'WHY DENSITY MATTERS', source: 'PSA QUESTIONS', priority: 'HIGH' },
  { id: 'opp-5', title: 'BUILD-A-WIG SECRETS', source: 'RECENT PURCHASES', priority: 'MEDIUM' },
  { id: 'opp-6', title: 'OFF BLACK VS JET BLACK', source: 'BLOG TRAFFIC', priority: 'LOW' },
  { id: 'opp-7', title: 'SLAY CHALLENGE MIDPOINT', source: 'COMMUNITY CALENDAR', priority: 'MEDIUM' },
];

export const REWARD_OPTIONS = [
  { id: 'slay-challenge-checkin', label: 'SLAY CHALLENGE CHECK-IN' },
  { id: 'member-spotlight', label: 'MEMBER SPOTLIGHT SHOUTOUT' },
  { id: 'bundle-offer', label: 'CAMPAIGN BUNDLE OFFER' },
  { id: 'slay-tickets', label: 'SLAY TICKETS EARLY ACCESS' },
  { id: 'none', label: 'NONE' },
];

export const CAMPAIGN_GOAL_OPTIONS = [
  'EDUCATE ON DENSITY + DRIVE BUILD-A-WIG CONSULTS',
  'SEASONAL TREND AUTHORITY + COLOR SALES',
  'MEMBERSHIP UPGRADE · LOUNGE ACTIVATION',
  'PRODUCT LAUNCH AWARENESS',
  'COMMUNITY ENGAGEMENT + SLAY CHALLENGE',
];

export const AUDIENCE_OPTIONS = [
  'ALL MEMBERS',
  'PREMIUM MEMBERS',
  'BLACK TIER',
  'FIRST-TIME WIG BUYERS',
  'PREMIUM MEMBERS · FIRST-TIME WIG BUYERS',
  'CONTENT CREATORS',
];

export const MEMBERSHIP_TIER_OPTIONS = [
  'ALL MEMBERS',
  'PREMIUM MEMBERS',
  'BLACK + PREMIUM',
  'PUBLIC + MEMBERS',
  'ALL MEMBERS · PREMIUM GATED OPTIONS',
];

export const BRAND_ALIGNMENT_THRESHOLD = 85;

export const QUALITY_GATE_CHECKS = [
  { id: 'topic', label: 'TOPIC', field: 'topic' as const },
  { id: 'audience', label: 'AUDIENCE', field: 'targetAudience' as const },
  { id: 'show', label: 'SHOW', field: 'selectedShowId' as const },
  { id: 'cta', label: 'CTA', field: 'primaryCtaId' as const },
  { id: 'products', label: 'PRODUCTS', field: 'featuredProductIds' as const },
  { id: 'rewards', label: 'REWARDS', field: 'rewardId' as const },
  { id: 'prompt', label: 'PROMPT FRAMEWORK', field: 'promptFrameworkId' as const },
  { id: 'distribution', label: 'DISTRIBUTION', field: 'distribution' as const },
  { id: 'brand', label: 'BRAND ALIGNMENT', field: 'brandAlignment' as const },
  { id: 'approval', label: 'APPROVAL STATUS', field: 'approvalStatus' as const },
] as const;

export const EDITOR_REVIEW_ACTIONS = [
  { id: 'approve', label: 'APPROVE' },
  { id: 'reject', label: 'REJECT' },
  { id: 'revision', label: 'REQUEST REVISION' },
  { id: 'regenerate', label: 'REGENERATE SECTION' },
  { id: 'duplicate', label: 'DUPLICATE' },
  { id: 'archive', label: 'ARCHIVE' },
] as const;
