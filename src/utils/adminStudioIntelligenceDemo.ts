/** Intelligence Engine — connector registry, demo evidence, and intelligence taxonomy. */

export type IntelligenceTypeId =
  | 'brand'
  | 'market'
  | 'customer'
  | 'performance'
  | 'product'
  | 'content'
  | 'seasonal'
  | 'community';

export const INTELLIGENCE_TYPE_LABELS: Record<IntelligenceTypeId, string> = {
  brand: 'BRAND INTELLIGENCE',
  market: 'MARKET INTELLIGENCE',
  customer: 'CUSTOMER INTELLIGENCE',
  performance: 'PERFORMANCE INTELLIGENCE',
  product: 'PRODUCT INTELLIGENCE',
  content: 'CONTENT INTELLIGENCE',
  seasonal: 'SEASONAL INTELLIGENCE',
  community: 'COMMUNITY INTELLIGENCE',
};

export type IntelligenceConnectorId =
  | 'google-trends'
  | 'pinterest-trends'
  | 'instagram-analytics'
  | 'tiktok-analytics'
  | 'youtube-analytics'
  | 'website-analytics'
  | 'supabase'
  | 'orders'
  | 'memberships'
  | 'reward-activity'
  | 'wishlist-activity'
  | 'baw-saves'
  | 'hair-analysis-usage'
  | 'psa-conversations'
  | 'lounge-tv-analytics'
  | 'slay-cam'
  | 'customer-reviews'
  | 'affiliate-activity'
  | 'email-performance'
  | 'referral-activity'
  | 'search-analytics';

export type IntelligenceConnectorDefinition = {
  id: IntelligenceConnectorId;
  label: string;
  category: IntelligenceTypeId;
  description: string;
};

export const INTELLIGENCE_CONNECTOR_REGISTRY: IntelligenceConnectorDefinition[] = [
  { id: 'google-trends', label: 'GOOGLE TRENDS', category: 'market', description: 'SEARCH TREND SIGNALS' },
  { id: 'pinterest-trends', label: 'PINTEREST TRENDS', category: 'market', description: 'PIN & SAVE TRENDS' },
  { id: 'instagram-analytics', label: 'INSTAGRAM ANALYTICS', category: 'performance', description: 'ACCOUNT ENGAGEMENT' },
  { id: 'tiktok-analytics', label: 'TIKTOK ANALYTICS', category: 'performance', description: 'REACH & WATCH' },
  { id: 'youtube-analytics', label: 'YOUTUBE ANALYTICS', category: 'performance', description: 'VIDEO PERFORMANCE' },
  { id: 'website-analytics', label: 'WEBSITE ANALYTICS', category: 'performance', description: 'SITE TRAFFIC & SESSIONS' },
  { id: 'supabase', label: 'SUPABASE', category: 'customer', description: 'PROFILE & EVENT DATA' },
  { id: 'orders', label: 'ORDERS', category: 'customer', description: 'PURCHASE PATTERNS' },
  { id: 'memberships', label: 'MEMBERSHIPS', category: 'customer', description: 'TIER & SUBSCRIPTION' },
  { id: 'reward-activity', label: 'REWARD ACTIVITY', category: 'community', description: 'SLAY CHALLENGE & REDEMPTIONS' },
  { id: 'wishlist-activity', label: 'WISHLIST ACTIVITY', category: 'customer', description: 'SAVES & LISTS' },
  { id: 'baw-saves', label: 'BUILD-A-WIG SAVES', category: 'product', description: 'CUSTOM BUILD COMBOS' },
  { id: 'hair-analysis-usage', label: 'HAIR ANALYSIS USAGE', category: 'product', description: 'SELFIE & ANALYSIS REQUESTS' },
  { id: 'psa-conversations', label: 'PSA CONVERSATIONS', category: 'community', description: 'FOUNDER HOLOGRAM Q&A' },
  { id: 'lounge-tv-analytics', label: 'LOUNGE TV ANALYTICS', category: 'content', description: 'WATCH & COMPLETION' },
  { id: 'slay-cam', label: 'SLAY CAM', category: 'community', description: 'UGC & COMMUNITY VIDEO' },
  { id: 'customer-reviews', label: 'CUSTOMER REVIEWS', category: 'community', description: 'REVIEW SENTIMENT' },
  { id: 'affiliate-activity', label: 'AFFILIATE ACTIVITY', category: 'market', description: 'CREATOR ATTRIBUTION' },
  { id: 'email-performance', label: 'EMAIL PERFORMANCE', category: 'performance', description: 'OPENS · CTR · CAMPAIGNS' },
  { id: 'referral-activity', label: 'REFERRAL ACTIVITY', category: 'customer', description: 'REFERRAL CONVERSIONS' },
  { id: 'search-analytics', label: 'SEARCH ANALYTICS', category: 'market', description: 'ON-SITE SEARCH QUERIES' },
];

export type ConfidenceLevel = 'low' | 'medium' | 'high' | 'very-high';

export function confidenceLevelFromPercent(pct: number): ConfidenceLevel {
  if (pct >= 90) return 'very-high';
  if (pct >= 75) return 'high';
  if (pct >= 55) return 'medium';
  return 'low';
}

export const CONFIDENCE_LEVEL_LABELS: Record<ConfidenceLevel, string> = {
  low: 'LOW',
  medium: 'MEDIUM',
  high: 'HIGH',
  'very-high': 'VERY HIGH',
};

/** Evidence tied to a specific active connector — never fabricated without connector attribution. */
export type IntelligenceEvidenceSeed = {
  connectorId: IntelligenceConnectorId;
  signal: string;
  metric?: string;
};

export type TopicForecastSeed = {
  id: string;
  title: string;
  window: string;
  intelligenceType: IntelligenceTypeId;
  requiredConnectors: IntelligenceConnectorId[];
};

export const TOPIC_FORECAST_SEEDS: TopicForecastSeed[] = [
  { id: 'summer-hair-care', title: 'SUMMER HAIR CARE', window: 'JUN – AUG', intelligenceType: 'seasonal', requiredConnectors: ['google-trends', 'pinterest-trends', 'website-analytics'] },
  { id: 'back-to-school', title: 'BACK-TO-SCHOOL STYLES', window: 'AUG – SEP', intelligenceType: 'seasonal', requiredConnectors: ['search-analytics', 'instagram-analytics'] },
  { id: 'holiday-gifts', title: 'HOLIDAY GIFT GUIDES', window: 'NOV – DEC', intelligenceType: 'seasonal', requiredConnectors: ['orders', 'email-performance'] },
  { id: 'humidity-season', title: 'HUMIDITY SEASON', window: 'JUL – SEP', intelligenceType: 'seasonal', requiredConnectors: ['google-trends', 'customer-reviews'] },
  { id: 'festival-hair', title: 'FESTIVAL HAIR', window: 'APR – OCT', intelligenceType: 'seasonal', requiredConnectors: ['tiktok-analytics', 'instagram-analytics'] },
  { id: 'wedding-season', title: 'WEDDING SEASON', window: 'MAY – JUN', intelligenceType: 'seasonal', requiredConnectors: ['pinterest-trends', 'wishlist-activity'] },
  { id: 'vacation-hair', title: 'VACATION HAIR', window: 'MAY – AUG', intelligenceType: 'seasonal', requiredConnectors: ['baw-saves', 'orders'] },
];

export const TOPIC_RECOMMENDATION_EVIDENCE_MAP: Record<
  string,
  { title: string; evidence: IntelligenceEvidenceSeed[]; suggestedShowId: string; suggestedCtaId: string; suggestedProducts: string[] }
> = {
  'cherry-red-forecast': {
    title: 'CHERRY RED FORECAST',
    suggestedShowId: 'the-slay-report',
    suggestedCtaId: 'cta-browse-colors',
    suggestedProducts: ['noir', 'blanco'],
    evidence: [
      { connectorId: 'pinterest-trends', signal: 'PINTEREST SEARCHES INCREASING', metric: '+18% WOW' },
      { connectorId: 'google-trends', signal: 'GOOGLE TRENDS RISING', metric: 'CHERRY RED +22%' },
      { connectorId: 'wishlist-activity', signal: 'WISHLIST SAVES INCREASED', metric: 'CHERRY SWATCHES +14%' },
      { connectorId: 'orders', signal: 'CHERRY PRODUCTS AVAILABLE', metric: 'IN STOCK' },
      { connectorId: 'search-analytics', signal: 'SEASONAL RELEVANCE HIGH', metric: 'FALL QUERIES UP' },
      { connectorId: 'instagram-analytics', signal: 'INSTAGRAM ENGAGEMENT INCREASING', metric: '+9% ON COLOR POSTS' },
    ],
  },
  'density-education': {
    title: 'WHY 250% DENSITY IS NOT FOR EVERYONE',
    suggestedShowId: 'slay-lab',
    suggestedCtaId: 'cta-hair-analysis',
    suggestedProducts: ['noir', 'soft-wave'],
    evidence: [
      { connectorId: 'psa-conversations', signal: 'MOST ASKED PSA QUESTIONS', metric: 'DENSITY × 47' },
      { connectorId: 'baw-saves', signal: 'MOST SAVED BAW COMBOS', metric: '150% + 180% SPLIT' },
      { connectorId: 'lounge-tv-analytics', signal: 'HIGHEST WATCHED EDUCATION', metric: 'SLAY LAB 78% COMPLETE' },
      { connectorId: 'search-analytics', signal: 'SEARCH QUERIES RISING', metric: '"DENSITY" +31%' },
    ],
  },
  'beach-wave-styling': {
    title: 'BEACH WAVE STYLING',
    suggestedShowId: 'build-studio',
    suggestedCtaId: 'cta-build-a-wig',
    suggestedProducts: ['beach-wave', 'soft-wave'],
    evidence: [
      { connectorId: 'lounge-tv-analytics', signal: 'MOST WATCHED EPISODES', metric: 'BEACH WAVE EP +24%' },
      { connectorId: 'orders', signal: 'HIGHEST CONVERTING UNIT', metric: 'BEACH WAVE 12% CTR' },
      { connectorId: 'wishlist-activity', signal: 'HIGHEST WISHLIST ACTIVITY', metric: 'BEACH WAVE #1' },
      { connectorId: 'email-performance', signal: 'HIGHEST PERFORMING CTA', metric: 'SHOP BEACH WAVE 8.2% CTR' },
    ],
  },
};

export const CUSTOMER_INTELLIGENCE_DEMO_SIGNALS: Array<{
  label: string;
  value: string;
  connectorId: IntelligenceConnectorId;
}> = [
  { label: 'MOST SAVED BAW COMBO', value: 'NOIR · 22" · 180% · JET BLACK', connectorId: 'baw-saves' },
  { label: 'MOST VIEWED PRODUCT', value: 'BEACH WAVE', connectorId: 'website-analytics' },
  { label: 'HIGHEST WISHLIST', value: 'SOFT WAVE · 20"', connectorId: 'wishlist-activity' },
  { label: 'TOP PSA QUESTION', value: 'WHAT DENSITY IS RIGHT FOR ME?', connectorId: 'psa-conversations' },
  { label: 'MOST REDEEMED REWARD', value: 'SLAY CHALLENGE GIFT', connectorId: 'reward-activity' },
  { label: 'TOP EMAIL CTA', value: 'START YOUR HAIR ANALYSIS', connectorId: 'email-performance' },
  { label: 'MOST WATCHED EPISODE', value: 'SLAY REPORT — CHERRY RED', connectorId: 'lounge-tv-analytics' },
];

export const PERFORMANCE_INTELLIGENCE_DEMO_SIGNALS: Array<{
  metric: string;
  value: string;
  connectorId: IntelligenceConnectorId;
  recommendation: string;
}> = [
  { metric: 'EPISODE COMPLETION', value: '72%', connectorId: 'lounge-tv-analytics', recommendation: 'SHORTEN COLD OPENS ON EDUCATION EPISODES' },
  { metric: 'AVG WATCH TIME', value: '6:42', connectorId: 'lounge-tv-analytics', recommendation: 'ADD CHAPTER MARKERS AT 3 MIN' },
  { metric: 'EMAIL OPENS', value: '41%', connectorId: 'email-performance', recommendation: 'A/B SUBJECT LINES ON FRIDAY SEND' },
  { metric: 'SOCIAL SHARES', value: '1.2K / WK', connectorId: 'instagram-analytics', recommendation: 'REPURPOSE SLAY LAB CLIPS AS REELS' },
  { metric: 'MEMBERSHIP CONVERSIONS', value: '3.8%', connectorId: 'memberships', recommendation: 'LEAD WITH LOUNGE PREVIEW IN EMAIL' },
  { metric: 'RETURN VISITORS', value: '28%', connectorId: 'website-analytics', recommendation: 'SURFACE CONTINUE WATCHING ON HOME' },
];

export const ADMIN_STUDIO_INTELLIGENCE_ENGINE_SUBTITLE =
  'FRONTAL SLAYER STRATEGIST — EVIDENCE-BASED RECOMMENDATIONS FROM CONNECTED SOURCES ONLY.';

export const CREATIVE_DIRECTOR_INTELLIGENCE_FEED_FIELDS = [
  'dailyBriefing',
  'topicRecommendations',
  'campaignSuggestions',
  'publishingStrategy',
  'contentScores',
  'brandAlignmentSignals',
  'outputRecommendations',
] as const;
