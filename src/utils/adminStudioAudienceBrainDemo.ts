/** AUDIENCE BRAIN — customer intelligence & learning system (CMS-ready). */

export const ADMIN_STUDIO_AUDIENCE_BRAIN_SUBTITLE =
  'LEARNING FROM EVERY INTERACTION — THE FEEDBACK ENGINE OF FRONTAL SLAYER STUDIOS.';

export type AudienceDashboardSectionId =
  | 'audience-overview'
  | 'member-behavior'
  | 'content-insights'
  | 'product-insights'
  | 'journey-analytics'
  | 'psa-insights'
  | 'community-health'
  | 'conversion-intelligence'
  | 'predictions'
  | 'recommendations';

export const AUDIENCE_DASHBOARD_SECTIONS: Array<{
  id: AudienceDashboardSectionId;
  title: string;
  metric: string;
  description: string;
}> = [
  { id: 'audience-overview', title: 'AUDIENCE OVERVIEW', metric: '12.4K', description: 'AGGREGATED MEMBER SIGNALS · 30-DAY' },
  { id: 'member-behavior', title: 'MEMBER BEHAVIOR', metric: '+18%', description: 'ENGAGEMENT VS PRIOR PERIOD' },
  { id: 'content-insights', title: 'CONTENT INSIGHTS', metric: '68%', description: 'AVG EPISODE COMPLETION' },
  { id: 'product-insights', title: 'PRODUCT INSIGHTS', metric: 'NOIR', description: 'TOP UNIT BY CONTENT ATTRIBUTION' },
  { id: 'journey-analytics', title: 'JOURNEY ANALYTICS', metric: '9', description: 'STAGES · DROP-OFF MAPPED' },
  { id: 'psa-insights', title: 'PSA INSIGHTS', metric: '94%', description: 'CONVERSATION SATISFACTION' },
  { id: 'community-health', title: 'COMMUNITY HEALTH', metric: 'STRONG', description: 'SLAY CAM · REFERRALS · AFFILIATE' },
  { id: 'conversion-intelligence', title: 'CONVERSION INTELLIGENCE', metric: '3.2×', description: 'HAIR ANALYSIS → PURCHASE LIFT' },
  { id: 'predictions', title: 'PREDICTIONS', metric: '6', description: 'FORECASTS WITH CONFIDENCE %' },
  { id: 'recommendations', title: 'RECOMMENDATIONS', metric: '8', description: 'EVIDENCE-BACKED ACTIONS' },
];

export type AudienceIntelligenceTabId =
  | 'overview'
  | 'content'
  | 'product'
  | 'membership'
  | 'psa'
  | 'community'
  | 'journey'
  | 'conversion'
  | 'predictions'
  | 'recommendations'
  | 'feedback'
  | 'privacy';

export const AUDIENCE_INTELLIGENCE_TABS: Array<{ id: AudienceIntelligenceTabId; label: string }> = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'content', label: 'CONTENT' },
  { id: 'product', label: 'PRODUCT' },
  { id: 'membership', label: 'MEMBERSHIP' },
  { id: 'psa', label: 'PSA' },
  { id: 'community', label: 'COMMUNITY' },
  { id: 'journey', label: 'JOURNEY' },
  { id: 'conversion', label: 'CONVERSION' },
  { id: 'predictions', label: 'PREDICT' },
  { id: 'recommendations', label: 'RECOMMEND' },
  { id: 'feedback', label: 'FEEDBACK' },
  { id: 'privacy', label: 'PRIVACY' },
];

export const AUDIENCE_FEEDBACK_LOOP_TARGETS = [
  'BRAND BRAIN',
  'CREATIVE DIRECTOR',
  'INTELLIGENCE ENGINE',
  'SHOW BIBLE',
  'CONTENT PLANNING',
  'PRODUCTION',
  'DISTRIBUTION',
] as const;

export const AUDIENCE_INHERITANCE_CHAIN = [
  'EVERY INTERACTION',
  'AUDIENCE BRAIN',
  'RECOMMENDATIONS',
  'CREATIVE DIRECTOR',
  'FUTURE CONTENT PACKS',
] as const;

export type AudienceMetric = {
  id: string;
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
};

export type AudienceRecommendation = {
  id: string;
  title: string;
  evidence: string;
  confidence: number;
  category: string;
  accentHex: string;
};

export type AudiencePrediction = {
  id: string;
  topic: string;
  forecast: string;
  confidence: number;
  horizon: string;
};

export type AudienceJourneyStep = {
  id: string;
  label: string;
  continueRate: number;
  dropOffRate: number;
};

export type AudienceInsightRecord = {
  id: string;
  /** AUDIENCE PROFILE */
  newMembers: string;
  returningMembers: string;
  engagementTrend: string;
  avgSessionLength: string;
  contentCompletion: string;
  mostActiveDays: string;
  preferredDevices: string;
  membershipGrowth: string;
  loyaltyTrends: string;
  /** CONTENT */
  episodeStarts: string;
  completionRate: string;
  dropOffPoints: string;
  replayRate: string;
  journalReads: string;
  avgReadTime: string;
  scrollDepth: string;
  carouselSwipes: string;
  emailOpens: string;
  emailClicks: string;
  thumbnailCtr: string;
  mostSharedEpisodes: string;
  mostSavedContent: string;
  favoriteShows: string;
  contentSuccessNotes: string;
  contentFailureNotes: string;
  /** PRODUCT */
  productsViewed: string;
  productsAddedToCart: string;
  productsPurchased: string;
  wishlistActivity: string;
  bawConfigurations: string;
  hairAnalysisResults: string;
  colorPreferences: string;
  texturePreferences: string;
  lengthPreferences: string;
  mostRecommendedProducts: string;
  contentCommerceNotes: string;
  /** MEMBERSHIP */
  freeToPremiumConversions: string;
  renewals: string;
  upgradePaths: string;
  featureUsage: string;
  loungeTvEngagement: string;
  journalEngagement: string;
  rewardParticipation: string;
  voucherUsage: string;
  membershipRetention: string;
  membershipOpportunityNotes: string;
  /** PSA */
  mostAskedQuestions: string;
  conversationTopics: string;
  mostRequestedProducts: string;
  commonObjections: string;
  popularRecommendations: string;
  conversationSatisfaction: string;
  followUpActions: string;
  psaTrainingNotes: string;
  /** COMMUNITY */
  slayCamParticipation: string;
  referralActivity: string;
  affiliateParticipation: string;
  guestCastingInterest: string;
  contestParticipation: string;
  communityGrowth: string;
  mostEngagedSegments: string;
  /** CONVERSION */
  episodesDrivingSales: string;
  emailsDrivingConversions: string;
  topPerformingCtas: string;
  productsPurchasedTogether: string;
  retentionDrivingFeatures: string;
  conversionNotes: string;
  /** PRIVACY */
  privacyPolicy: string;
  aggregationMode: string;
  consentArchitecture: string;
  adminNotes: string;
};

export const AUDIENCE_OVERVIEW_METRICS: AudienceMetric[] = [
  { id: 'new-members', label: 'NEW MEMBERS', value: '842', trend: '+12%', trendUp: true },
  { id: 'returning', label: 'RETURNING', value: '6,218', trend: '+8%', trendUp: true },
  { id: 'session', label: 'AVG SESSION', value: '4:32', trend: '+0:18', trendUp: true },
  { id: 'completion', label: 'CONTENT COMPLETION', value: '68%', trend: '+4%', trendUp: true },
  { id: 'active-days', label: 'MOST ACTIVE', value: 'TUE · FRI', trend: 'STABLE', trendUp: true },
  { id: 'devices', label: 'PREFERRED DEVICE', value: 'MOBILE 78%', trend: '+2%', trendUp: true },
  { id: 'growth', label: 'MEMBERSHIP GROWTH', value: '+14%', trend: '30D', trendUp: true },
  { id: 'loyalty', label: 'LOYALTY TREND', value: 'RISING', trend: 'BLACK TIER', trendUp: true },
];

export const AUDIENCE_JOURNEY_STEPS: AudienceJourneyStep[] = [
  { id: 'instagram', label: 'INSTAGRAM', continueRate: 72, dropOffRate: 28 },
  { id: 'website', label: 'WEBSITE VISIT', continueRate: 58, dropOffRate: 42 },
  { id: 'hair-analysis', label: 'HAIR ANALYSIS', continueRate: 41, dropOffRate: 59 },
  { id: 'build-a-wig', label: 'BUILD-A-WIG', continueRate: 28, dropOffRate: 72 },
  { id: 'wishlist', label: 'WISHLIST', continueRate: 22, dropOffRate: 78 },
  { id: 'membership', label: 'MEMBERSHIP', continueRate: 18, dropOffRate: 82 },
  { id: 'purchase', label: 'PURCHASE', continueRate: 12, dropOffRate: 88 },
  { id: 'lounge-tv', label: 'LOUNGE TV', continueRate: 64, dropOffRate: 36 },
  { id: 'referral', label: 'REFERRAL', continueRate: 8, dropOffRate: 92 },
  { id: 'repeat', label: 'REPEAT PURCHASE', continueRate: 6, dropOffRate: 94 },
];

export const AUDIENCE_RECOMMENDATIONS: AudienceRecommendation[] = [
  {
    id: 'rec-beach-wave',
    title: 'CREATE MORE BEACH WAVE TUTORIALS',
    evidence: 'BEACH WAVE UNIT VIEWS +34% AFTER SLAY LAB EP 6 · WISHLIST +22%',
    confidence: 87,
    category: 'CONTENT',
    accentHex: '#EB1C24',
  },
  {
    id: 'rec-cherry-red',
    title: 'CHERRY RED INTEREST IS INCREASING',
    evidence: 'COLOR SWATCH ENGAGEMENT +41% · SLAY REPORT EP 13 COMPLETION 82%',
    confidence: 91,
    category: 'TREND',
    accentHex: '#C41E3A',
  },
  {
    id: 'rec-shorter-episodes',
    title: 'MEMBERS PREFER SHORTER LOUNGE TV EPISODES',
    evidence: 'DROP-OFF AT 6:00 MARK ON 10+ MIN EPISODES · 4–6 MIN COMPLETION 74%',
    confidence: 84,
    category: 'FORMAT',
    accentHex: '#CA8A04',
  },
  {
    id: 'rec-journal-edu',
    title: 'JOURNAL OUTPERFORMS EMAIL FOR EDUCATION',
    evidence: 'SCROLL DEPTH 78% JOURNAL VS 42% EMAIL · READ TIME 3:12 VS 0:48',
    confidence: 79,
    category: 'CHANNEL',
    accentHex: '#2563EB',
  },
  {
    id: 'rec-hair-analysis',
    title: 'HAIR ANALYSIS DRIVES HIGHEST CONVERSIONS',
    evidence: '3.2× PURCHASE LIFT POST-ANALYSIS · 28% BAW START RATE',
    confidence: 93,
    category: 'CONVERSION',
    accentHex: '#16A34A',
  },
  {
    id: 'rec-noir-spotlight',
    title: 'PAIR NOIR SPOTLIGHTS WITH SLAY REPORT',
    evidence: 'CO-PURCHASE NOIR + ACCESSORIES 2.1× WHEN FEATURED SAME WEEK',
    confidence: 76,
    category: 'COMMERCE',
    accentHex: '#8B0000',
  },
  {
    id: 'rec-psa-lace',
    title: 'EXPAND PSA LACE EDUCATION',
    evidence: 'TOP PSA QUESTION: LACE TENSION · 18% FOLLOW-UP TO BUILD-A-WIG',
    confidence: 82,
    category: 'PSA',
    accentHex: '#EB1C24',
  },
  {
    id: 'rec-referral-push',
    title: 'REFERRAL PROMPT AFTER LOUNGE COMPLETION',
    evidence: 'REFERRAL RATE 2.4× WHEN PROMPTED POST 80%+ COMPLETION',
    confidence: 71,
    category: 'COMMUNITY',
    accentHex: '#6B7280',
  },
];

export const AUDIENCE_PREDICTIONS: AudiencePrediction[] = [
  { id: 'pred-cherry', topic: 'CHERRY RED FORECAST', forecast: 'HIGH DEMAND Q3', confidence: 88, horizon: '90 DAYS' },
  { id: 'pred-beach', topic: 'BEACH WAVE DEMAND', forecast: 'RISING', confidence: 82, horizon: '60 DAYS' },
  { id: 'pred-membership', topic: 'MEMBERSHIP GROWTH', forecast: '+12–16%', confidence: 74, horizon: 'Q3' },
  { id: 'pred-summer', topic: 'SUMMER CAMPAIGN INTEREST', forecast: 'PEAK AUG 1–15', confidence: 69, horizon: 'CAMPAIGN' },
  { id: 'pred-short-form', topic: 'SHORT-FORM CONTENT', forecast: 'PREFERRED FORMAT', confidence: 85, horizon: 'ONGOING' },
  { id: 'pred-psa-volume', topic: 'PSA VOLUME', forecast: '+20% QUESTIONS', confidence: 62, horizon: '30 DAYS' },
];

function createDefaultInsight(): AudienceInsightRecord {
  return {
    id: 'audience-brain-default',
    newMembers: '842 (30D AGGREGATED)',
    returningMembers: '6,218 ACTIVE RETURNING',
    engagementTrend: 'RISING · +18% VS PRIOR 30D',
    avgSessionLength: '4:32 AVG',
    contentCompletion: '68% EPISODE COMPLETION',
    mostActiveDays: 'TUESDAY · FRIDAY · 7PM ET',
    preferredDevices: 'MOBILE 78% · TABLET 14% · DESKTOP 8%',
    membershipGrowth: '+14% NET NEW MEMBERS',
    loyaltyTrends: 'BLACK TIER RETENTION 94% · REWARDS REDEMPTION +11%',
    episodeStarts: '18,420 STARTS (30D)',
    completionRate: '68% AVG · SLAY REPORT 82%',
    dropOffPoints: '6:00 ON LONG EPISODES · INTRO 0:15 ON REELS',
    replayRate: '24% REPLAY WITHIN 7D',
    journalReads: '4,210 READS',
    avgReadTime: '3:12 AVG',
    scrollDepth: '78% AVG SCROLL',
    carouselSwipes: '2.4 SWIPES PER SESSION',
    emailOpens: '42% OPEN RATE',
    emailClicks: '18% CTR',
    thumbnailCtr: '6.8% LOUNGE TV CTR',
    mostSharedEpisodes: 'SLAY REPORT EP 11 · SLAY LAB EP 6',
    mostSavedContent: 'LACE MASTERY · CHERRY RED FORECAST',
    favoriteShows: 'SLAY REPORT · PSA ANALYZES · SLAY LAB',
    contentSuccessNotes: 'SHORTER EPISODES · STRONG THUMBNAILS · PRODUCT TIE-IN',
    contentFailureNotes: '10+ MIN WITHOUT HOOK · GENERIC CTAs',
    productsViewed: 'NOIR 4,820 · BEACH WAVE 2,140 · SOFT WAVE 1,890',
    productsAddedToCart: 'NOIR 412 · BEACH WAVE 186',
    productsPurchased: 'NOIR 128 · BEACH WAVE 64',
    wishlistActivity: '+22% BEACH WAVE ADDS',
    bawConfigurations: 'NOIR CUSTOM 68% · CHERRY RED 24%',
    hairAnalysisResults: '1,240 COMPLETED · 28% → BAW',
    colorPreferences: 'CHERRY RED · 1B · 613',
    texturePreferences: 'BODY WAVE · SOFT WAVE',
    lengthPreferences: '18" · 20" · 22"',
    mostRecommendedProducts: 'NOIR · BEACH WAVE · BLANCO',
    contentCommerceNotes: 'SLAY REPORT → NOIR +41% VIEWS SAME WEEK',
    freeToPremiumConversions: '4.2% FREE → PREMIUM (30D)',
    renewals: '91% RENEWAL RATE',
    upgradePaths: 'STANDARD → PREMIUM VIA REWARDS CHART',
    featureUsage: 'LOUNGE TV 72% · JOURNAL 48% · PSA 31%',
    loungeTvEngagement: '4.2 EPISODES / MEMBER / MO',
    journalEngagement: '2.1 ARTICLES / MEMBER / MO',
    rewardParticipation: 'SLAY CHALLENGE 64% ACTIVE',
    voucherUsage: 'VOUCHER REDEMPTION +8%',
    membershipRetention: '94% PREMIUM · 88% STANDARD',
    membershipOpportunityNotes: 'EARLY LOUNGE ACCESS DRIVES UPGRADE',
    mostAskedQuestions: 'LACE TENSION · CAP SIZE · COLOR MATCH',
    conversationTopics: 'STYLING · PRODUCT FIT · MEMBERSHIP VALUE',
    mostRequestedProducts: 'NOIR · BEACH WAVE · GIFT CARDS',
    commonObjections: 'PRICE · SHIPPING TIMELINE · CAP FIT',
    popularRecommendations: 'NOIR FOR VERSATILITY · SOFT WAVE FOR DAILY',
    conversationSatisfaction: '94% SATISFIED (AGGREGATED)',
    followUpActions: '18% → BUILD-A-WIG · 12% → CART',
    psaTrainingNotes: 'EXPAND LACE + COLOR DEPTH',
    slayCamParticipation: '340 SUBMISSIONS (30D)',
    referralActivity: '+16% REFERRAL LINKS SHARED',
    affiliateParticipation: '42 ACTIVE AFFILIATES',
    guestCastingInterest: '128 GUEST CASTING REQUESTS',
    contestParticipation: 'SLAY CHALLENGE 2,140 ENTRIES',
    communityGrowth: '+9% COMMUNITY ACTIONS',
    mostEngagedSegments: 'PREMIUM · BLACK TIER · REPEAT BUYERS',
    episodesDrivingSales: 'SLAY REPORT EP 11 · SLAY LAB EP 6',
    emailsDrivingConversions: 'FRIDAY SLAY REPORT · RESTOCK ALERTS',
    topPerformingCtas: 'SHOP NOIR · WATCH EPISODE · BUILD CUSTOM',
    productsPurchasedTogether: 'NOIR + EDGE CONTROL · BEACH WAVE + BONNET',
    retentionDrivingFeatures: 'LOUNGE TV · REWARDS · PSA',
    conversionNotes: 'HAIR ANALYSIS → PURCHASE 3.2× LIFT',
    privacyPolicy: 'AGGREGATED ANALYTICS ONLY · NO PII IN DASHBOARDS',
    aggregationMode: 'COHORT-LEVEL · MINIMUM N=50',
    consentArchitecture: 'OPT-IN ANALYTICS · FUTURE GDPR/CCPA READY',
    adminNotes: '',
  };
}

export const ADMIN_STUDIO_AUDIENCE_INSIGHT_DEFAULT: AudienceInsightRecord = createDefaultInsight();

export type AudienceInsightFieldKey = keyof Omit<AudienceInsightRecord, 'id'>;

export type AudienceFieldGroup = {
  title: string;
  fields: Array<{ key: AudienceInsightFieldKey; label: string; multiline?: boolean }>;
};

export const AUDIENCE_CONTENT_GROUPS: AudienceFieldGroup[] = [
  {
    title: 'CONTENT INTELLIGENCE',
    fields: [
      { key: 'episodeStarts', label: 'EPISODE STARTS' },
      { key: 'completionRate', label: 'COMPLETION RATE' },
      { key: 'dropOffPoints', label: 'DROP-OFF POINTS', multiline: true },
      { key: 'replayRate', label: 'REPLAY RATE' },
      { key: 'journalReads', label: 'JOURNAL READS' },
      { key: 'avgReadTime', label: 'AVG READ TIME' },
      { key: 'scrollDepth', label: 'SCROLL DEPTH' },
      { key: 'carouselSwipes', label: 'CAROUSEL SWIPES' },
      { key: 'emailOpens', label: 'EMAIL OPENS' },
      { key: 'emailClicks', label: 'EMAIL CLICKS' },
      { key: 'thumbnailCtr', label: 'THUMBNAIL CTR' },
      { key: 'mostSharedEpisodes', label: 'MOST SHARED', multiline: true },
      { key: 'mostSavedContent', label: 'MOST SAVED', multiline: true },
      { key: 'favoriteShows', label: 'FAVORITE SHOWS' },
      { key: 'contentSuccessNotes', label: 'WHY CONTENT SUCCEEDS', multiline: true },
      { key: 'contentFailureNotes', label: 'WHY CONTENT FAILS', multiline: true },
    ],
  },
];

export const AUDIENCE_PRODUCT_GROUPS: AudienceFieldGroup[] = [
  {
    title: 'PRODUCT INTELLIGENCE',
    fields: [
      { key: 'productsViewed', label: 'PRODUCTS VIEWED', multiline: true },
      { key: 'productsAddedToCart', label: 'ADDED TO CART', multiline: true },
      { key: 'productsPurchased', label: 'PURCHASED', multiline: true },
      { key: 'wishlistActivity', label: 'WISHLIST ACTIVITY' },
      { key: 'bawConfigurations', label: 'BUILD-A-WIG CONFIGS', multiline: true },
      { key: 'hairAnalysisResults', label: 'HAIR ANALYSIS', multiline: true },
      { key: 'colorPreferences', label: 'COLOR PREFERENCES' },
      { key: 'texturePreferences', label: 'TEXTURE PREFERENCES' },
      { key: 'lengthPreferences', label: 'LENGTH PREFERENCES' },
      { key: 'mostRecommendedProducts', label: 'MOST RECOMMENDED' },
      { key: 'contentCommerceNotes', label: 'CONTENT → COMMERCE', multiline: true },
    ],
  },
];

export const AUDIENCE_MEMBERSHIP_GROUPS: AudienceFieldGroup[] = [
  {
    title: 'MEMBERSHIP INTELLIGENCE',
    fields: [
      { key: 'freeToPremiumConversions', label: 'FREE → PREMIUM' },
      { key: 'renewals', label: 'RENEWALS' },
      { key: 'upgradePaths', label: 'UPGRADE PATHS', multiline: true },
      { key: 'featureUsage', label: 'FEATURE USAGE', multiline: true },
      { key: 'loungeTvEngagement', label: 'LOUNGE TV ENGAGEMENT' },
      { key: 'journalEngagement', label: 'JOURNAL ENGAGEMENT' },
      { key: 'rewardParticipation', label: 'REWARD PARTICIPATION' },
      { key: 'voucherUsage', label: 'VOUCHER USAGE' },
      { key: 'membershipRetention', label: 'RETENTION' },
      { key: 'membershipOpportunityNotes', label: 'OPPORTUNITIES', multiline: true },
    ],
  },
];

export const AUDIENCE_PSA_GROUPS: AudienceFieldGroup[] = [
  {
    title: 'PSA INTELLIGENCE',
    fields: [
      { key: 'mostAskedQuestions', label: 'MOST ASKED', multiline: true },
      { key: 'conversationTopics', label: 'TOPICS', multiline: true },
      { key: 'mostRequestedProducts', label: 'REQUESTED PRODUCTS' },
      { key: 'commonObjections', label: 'OBJECTIONS', multiline: true },
      { key: 'popularRecommendations', label: 'POPULAR RECS', multiline: true },
      { key: 'conversationSatisfaction', label: 'SATISFACTION' },
      { key: 'followUpActions', label: 'FOLLOW-UP ACTIONS' },
      { key: 'psaTrainingNotes', label: 'PSA TRAINING OPS', multiline: true },
    ],
  },
];

export const AUDIENCE_COMMUNITY_GROUPS: AudienceFieldGroup[] = [
  {
    title: 'COMMUNITY INTELLIGENCE',
    fields: [
      { key: 'slayCamParticipation', label: 'SLAY CAM' },
      { key: 'referralActivity', label: 'REFERRALS' },
      { key: 'affiliateParticipation', label: 'AFFILIATE' },
      { key: 'guestCastingInterest', label: 'GUEST CASTING' },
      { key: 'contestParticipation', label: 'CONTESTS' },
      { key: 'communityGrowth', label: 'GROWTH' },
      { key: 'mostEngagedSegments', label: 'MOST ENGAGED', multiline: true },
    ],
  },
];

export const AUDIENCE_CONVERSION_GROUPS: AudienceFieldGroup[] = [
  {
    title: 'CONVERSION INTELLIGENCE',
    fields: [
      { key: 'episodesDrivingSales', label: 'EPISODES → SALES', multiline: true },
      { key: 'emailsDrivingConversions', label: 'EMAILS → CONVERSIONS', multiline: true },
      { key: 'topPerformingCtas', label: 'TOP CTAS' },
      { key: 'productsPurchasedTogether', label: 'BUNDLED PURCHASES', multiline: true },
      { key: 'retentionDrivingFeatures', label: 'RETENTION DRIVERS' },
      { key: 'conversionNotes', label: 'RECOMMENDATIONS', multiline: true },
    ],
  },
];

export const AUDIENCE_OVERVIEW_GROUPS: AudienceFieldGroup[] = [
  {
    title: 'AUDIENCE PROFILE — AGGREGATED',
    fields: [
      { key: 'newMembers', label: 'NEW MEMBERS' },
      { key: 'returningMembers', label: 'RETURNING MEMBERS' },
      { key: 'engagementTrend', label: 'ENGAGEMENT TREND' },
      { key: 'avgSessionLength', label: 'AVG SESSION LENGTH' },
      { key: 'contentCompletion', label: 'CONTENT COMPLETION' },
      { key: 'mostActiveDays', label: 'MOST ACTIVE DAYS' },
      { key: 'preferredDevices', label: 'PREFERRED DEVICES' },
      { key: 'membershipGrowth', label: 'MEMBERSHIP GROWTH' },
      { key: 'loyaltyTrends', label: 'LOYALTY TRENDS', multiline: true },
    ],
  },
];

export const AUDIENCE_PRIVACY_GROUPS: AudienceFieldGroup[] = [
  {
    title: 'PRIVACY & CONSENT',
    fields: [
      { key: 'privacyPolicy', label: 'PRIVACY POLICY', multiline: true },
      { key: 'aggregationMode', label: 'AGGREGATION MODE', multiline: true },
      { key: 'consentArchitecture', label: 'CONSENT ARCHITECTURE', multiline: true },
      { key: 'adminNotes', label: 'ADMIN NOTES', multiline: true },
    ],
  },
];

export function confidenceLabel(score: number): string {
  if (score >= 90) return 'HIGH';
  if (score >= 75) return 'MODERATE';
  if (score >= 60) return 'EMERGING';
  return 'LOW';
}
