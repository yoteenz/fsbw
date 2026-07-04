/** EXECUTIVE COMMAND CENTER — CEO headquarters & live executive summary (CMS-ready). */

export const ADMIN_STUDIO_EXECUTIVE_COMMAND_CENTER_SUBTITLE =
  'ONE COMPANY. ONE VIEW. — THE EXECUTIVE CONTROL ROOM OF FRONTAL SLAYER STUDIOS.';

export type ExecutiveOverviewCardId =
  | 'priorities'
  | 'creative-briefing'
  | 'business-health'
  | 'studio-health'
  | 'audience-health'
  | 'launch-status'
  | 'revenue'
  | 'membership'
  | 'production'
  | 'upcoming'
  | 'wins'
  | 'risks';

export const EXECUTIVE_OVERVIEW_CARDS: Array<{
  id: ExecutiveOverviewCardId;
  title: string;
  metric: string;
  description: string;
  accentHex: string;
}> = [
  { id: 'priorities', title: "TODAY'S PRIORITIES", metric: '5', description: 'CEO ACTION ITEMS', accentHex: '#EB1C24' },
  { id: 'creative-briefing', title: 'CREATIVE BRIEFING', metric: '87%', description: 'CD CONFIDENCE · CHERRY RED', accentHex: '#C41E3A' },
  { id: 'business-health', title: 'BUSINESS HEALTH', metric: 'STRONG', description: 'REVENUE · ORDERS · AOV', accentHex: '#16A34A' },
  { id: 'studio-health', title: 'STUDIO HEALTH', metric: '7', description: 'PRODUCTIONS IN PROGRESS', accentHex: '#2563EB' },
  { id: 'audience-health', title: 'AUDIENCE HEALTH', metric: '+18%', description: 'ENGAGEMENT · 30D', accentHex: '#CA8A04' },
  { id: 'launch-status', title: 'LAUNCH STATUS', metric: 'FRI 7PM', description: 'SLAY REPORT EP 13', accentHex: '#EB1C24' },
  { id: 'revenue', title: 'REVENUE SNAPSHOT', metric: '$42.8K', description: '30D AGGREGATED', accentHex: '#16A34A' },
  { id: 'membership', title: 'MEMBERSHIP SNAPSHOT', metric: '+14%', description: 'NET NEW MEMBERS', accentHex: '#8B0000' },
  { id: 'production', title: 'PRODUCTION SNAPSHOT', metric: '68%', description: 'AVG ASSET COMPLETION', accentHex: '#6B7280' },
  { id: 'upcoming', title: 'UPCOMING RELEASES', metric: '6', description: 'SCHEDULED THIS WEEK', accentHex: '#2563EB' },
  { id: 'wins', title: 'RECENT WINS', metric: '4', description: 'LAST 7 DAYS', accentHex: '#16A34A' },
  { id: 'risks', title: 'POTENTIAL RISKS', metric: '3', description: 'PRIORITIZED BY URGENCY', accentHex: '#EB1C24' },
];

export type ExecutiveTabId =
  | 'command'
  | 'business'
  | 'studio'
  | 'audience'
  | 'product'
  | 'launch'
  | 'opportunities'
  | 'risks'
  | 'decisions'
  | 'timeline';

export const EXECUTIVE_TABS: Array<{ id: ExecutiveTabId; label: string }> = [
  { id: 'command', label: 'COMMAND' },
  { id: 'business', label: 'BUSINESS' },
  { id: 'studio', label: 'STUDIO' },
  { id: 'audience', label: 'AUDIENCE' },
  { id: 'product', label: 'PRODUCT' },
  { id: 'launch', label: 'LAUNCH' },
  { id: 'opportunities', label: 'OPPORTUNITIES' },
  { id: 'risks', label: 'RISKS' },
  { id: 'decisions', label: 'DECISIONS' },
  { id: 'timeline', label: 'TIMELINE' },
];

export const EXECUTIVE_REPORTING_CHAIN = [
  'CONTENT BRAIN',
  'CREATIVE DIRECTOR',
  'INTELLIGENCE ENGINE',
  'SHOW BIBLE',
  'STUDIO LOT',
  'TALENT AGENCY',
  'CASTING',
  'PRODUCTION',
  'AI PRODUCTION ENGINE',
  'DISTRIBUTION',
  'AUDIENCE BRAIN',
  'EXECUTIVE COMMAND CENTER',
] as const;

export type ExecutiveCreativeBriefing = {
  greeting: string;
  recommendedTopic: string;
  recommendedShow: string;
  confidenceScore: number;
  recommendedProducts: string;
  trendingOpportunities: string;
  upcomingDeadlines: string;
};

export const EXECUTIVE_CREATIVE_BRIEFING: ExecutiveCreativeBriefing = {
  greeting: 'GOOD MORNING, KATEENA',
  recommendedTopic: 'CHERRY RED FORECAST — SUMMER SLAY MOMENTUM',
  recommendedShow: 'THE SLAY REPORT',
  confidenceScore: 87,
  recommendedProducts: 'NOIR · CHERRY RED SWATCH · BEACH WAVE',
  trendingOpportunities: 'CHERRY RED +41% · BEACH WAVE TUTORIALS · SHORT-FORM PREFERENCE',
  upcomingDeadlines: 'FRI 7PM EP 13 · TUE JOURNAL · THU EMAIL DRAFT',
};

export type ExecutiveHealthMetric = { label: string; value: string; sub?: string };

export const EXECUTIVE_BUSINESS_HEALTH: ExecutiveHealthMetric[] = [
  { label: 'REVENUE', value: '$42,840', sub: '30D · +12%' },
  { label: 'ORDERS', value: '186', sub: '+8% VS PRIOR' },
  { label: 'MEMBERSHIPS', value: '842 NEW', sub: '+14% NET' },
  { label: 'AFFILIATES', value: '42 ACTIVE', sub: '3 PENDING' },
  { label: 'REWARDS', value: '64%', sub: 'SLAY CHALLENGE' },
  { label: 'REFERRALS', value: '+16%', sub: '30D GROWTH' },
  { label: 'AOV', value: '$230', sub: '+$18' },
  { label: 'CONVERSION', value: '3.8%', sub: 'SITE WIDE' },
  { label: 'RETURNING', value: '42%', sub: 'CUSTOMERS' },
];

export const EXECUTIVE_STUDIO_HEALTH: ExecutiveHealthMetric[] = [
  { label: 'IN PROGRESS', value: '7', sub: 'CONTENT PACKS' },
  { label: 'PENDING REVIEWS', value: '4', sub: 'EDITORIAL' },
  { label: 'COMPLETED', value: '18', sub: '30D SHIPPED' },
  { label: 'UPCOMING EPISODES', value: '3', sub: 'THIS WEEK' },
  { label: 'PUBLISHING QUEUE', value: '6', sub: 'READY' },
  { label: 'AVG PROD TIME', value: '4.2 DAYS', sub: 'PIPELINE' },
  { label: 'QUALITY SCORE', value: '88%', sub: 'QA AVG' },
];

export const EXECUTIVE_AUDIENCE_HEALTH: ExecutiveHealthMetric[] = [
  { label: 'MEMBER GROWTH', value: '+14%', sub: '30D' },
  { label: 'ENGAGEMENT', value: '+18%', sub: 'VS PRIOR' },
  { label: 'COMPLETION', value: '68%', sub: 'EPISODES' },
  { label: 'JOURNAL READS', value: '4,210', sub: '30D' },
  { label: 'LOUNGE TV', value: '4:32', sub: 'AVG WATCH' },
  { label: 'PSA USAGE', value: '31%', sub: 'PREMIUM' },
  { label: 'COMMUNITY', value: '+9%', sub: 'GROWTH' },
];

export const EXECUTIVE_PRODUCT_HEALTH: ExecutiveHealthMetric[] = [
  { label: 'TRENDING', value: 'NOIR', sub: 'CHERRY RED' },
  { label: 'LOW INVENTORY', value: '—', sub: 'FUTURE CONNECTOR' },
  { label: 'MOST SAVED', value: 'BEACH WAVE', sub: '+22%' },
  { label: 'MOST PURCHASED', value: 'NOIR', sub: '128 UNITS' },
  { label: 'MOST VIEWED', value: 'NOIR', sub: '4,820' },
  { label: 'TOP CONVERSION', value: 'HAIR ANALYSIS', sub: '3.2× LIFT' },
  { label: 'BAW ACTIVITY', value: '412', sub: 'CONFIGS' },
  { label: 'WISHLIST', value: '+22%', sub: 'BEACH WAVE' },
];

export type ExecutiveLaunchCampaign = {
  id: string;
  title: string;
  countdown: string;
  progress: number;
  assetsReady: string;
  contentRemaining: string;
  emailStatus: string;
  socialStatus: string;
  websiteStatus: string;
  productionStatus: string;
  accentHex: string;
};

export const EXECUTIVE_LAUNCH_CAMPAIGNS: ExecutiveLaunchCampaign[] = [
  {
    id: 'launch-slay-13',
    title: 'SLAY REPORT EP 13 — CHERRY RED',
    countdown: '2D 18H',
    progress: 82,
    assetsReady: '7/9',
    contentRemaining: 'THUMBNAIL FINAL · EMAIL PROOF',
    emailStatus: 'DRAFT READY',
    socialStatus: 'CAROUSEL QUEUED',
    websiteStatus: 'HERO LOCKED',
    productionStatus: 'POST REVIEW',
    accentHex: '#EB1C24',
  },
  {
    id: 'launch-summer',
    title: 'SUMMER SLAY CAMPAIGN',
    countdown: '12D',
    progress: 64,
    assetsReady: '12/18',
    contentRemaining: 'TIKTOK · PINTEREST PINS',
    emailStatus: 'SCHEDULED',
    socialStatus: 'IN PRODUCTION',
    websiteStatus: 'PREVIEW',
    productionStatus: 'AI ENGINE RUNNING',
    accentHex: '#CA8A04',
  },
];

export type ExecutiveOpportunity = {
  id: string;
  title: string;
  category: string;
  confidence: number;
  evidence: string;
  expectedImpact: string;
  accentHex: string;
};

export const EXECUTIVE_OPPORTUNITIES: ExecutiveOpportunity[] = [
  { id: 'opp-noir', title: 'FEATURE NOIR IN FRIDAY SLAY REPORT', category: 'PRODUCTS', confidence: 91, evidence: 'CHERRY RED +41% · CO-PURCHASE 2.1×', expectedImpact: 'HIGH REVENUE', accentHex: '#EB1C24' },
  { id: 'opp-beach', title: 'CREATE BEACH WAVE TUTORIAL SERIES', category: 'TOPICS', confidence: 87, evidence: 'VIEWS +34% POST SLAY LAB EP 6', expectedImpact: 'ENGAGEMENT + WISHLIST', accentHex: '#CA8A04' },
  { id: 'opp-email', title: 'SEND RESTOCK ALERT EMAIL', category: 'EMAILS', confidence: 79, evidence: 'BEACH WAVE WISHLIST +22%', expectedImpact: 'CONVERSION LIFT', accentHex: '#2563EB' },
  { id: 'opp-campaign', title: 'LAUNCH SUMMER SLAY WEEK 2', category: 'CAMPAIGNS', confidence: 74, evidence: 'SEASONAL INTEREST PEAK AUG 1–15', expectedImpact: 'BRAND MOMENTUM', accentHex: '#16A34A' },
  { id: 'opp-slay-lab', title: 'PRODUCE SLAY LAB LACE SPECIAL', category: 'SHOWS', confidence: 82, evidence: 'PSA TOP QUESTION: LACE TENSION', expectedImpact: 'EDUCATION + TRUST', accentHex: '#8B0000' },
  { id: 'opp-member', title: 'HIGHLIGHT BLACK TIER MEMBERS', category: 'MEMBERS', confidence: 68, evidence: '94% RETENTION · HIGH LOUNGE ENGAGEMENT', expectedImpact: 'COMMUNITY PRIDE', accentHex: '#6B7280' },
  { id: 'opp-community', title: 'SLAY CAM WINNER SPOTLIGHT', category: 'COMMUNITY', confidence: 71, evidence: '340 SUBMISSIONS 30D', expectedImpact: 'UGC + REFERRALS', accentHex: '#C41E3A' },
  { id: 'opp-partner', title: 'FUTURE SALON PARTNERSHIP PILOT', category: 'PARTNERSHIPS', confidence: 55, evidence: 'ARCHITECTURE READY · NO CONNECTOR', expectedImpact: 'LONG-TERM GROWTH', accentHex: '#9CA3AF' },
];

export type ExecutiveRisk = {
  id: string;
  title: string;
  urgency: 'critical' | 'high' | 'medium';
  description: string;
  module: string;
};

export const EXECUTIVE_RISKS: ExecutiveRisk[] = [
  { id: 'risk-psa-review', title: 'PSA EP 22 NEEDS REVIEW', urgency: 'high', description: 'DISTRIBUTION VALIDATION INCOMPLETE', module: 'DISTRIBUTION' },
  { id: 'risk-thumbnail', title: 'EP 13 THUMBNAIL PENDING', urgency: 'high', description: 'FRIDAY 7PM LAUNCH AT RISK', module: 'PRODUCTION' },
  { id: 'risk-inventory', title: 'NOIR INVENTORY WATCH', urgency: 'medium', description: 'CONNECTOR NOT LIVE — DEMO ONLY', module: 'PRODUCT' },
  { id: 'risk-email-conflict', title: 'EMAIL + PUSH SAME DAY', urgency: 'medium', description: 'PUBLISHING CALENDAR OVERLAP THU', module: 'DISTRIBUTION' },
  { id: 'risk-campaign-stale', title: 'INACTIVE CAMPAIGN ASSET', urgency: 'medium', description: 'SUMMER HERO NEEDS REFRESH', module: 'LAUNCH' },
];

export type ExecutiveDecision = {
  id: string;
  title: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  due: string;
};

export const EXECUTIVE_DECISIONS_DEFAULT: ExecutiveDecision[] = [
  { id: 'dec-campaign-summer', title: 'APPROVE SUMMER SLAY CAMPAIGN', type: 'CAMPAIGN', status: 'pending', due: 'TODAY' },
  { id: 'dec-ep13', title: 'APPROVE SLAY REPORT EP 13', type: 'EPISODE', status: 'pending', due: 'FRI' },
  { id: 'dec-email-friday', title: 'APPROVE FRIDAY EMAIL', type: 'EMAIL', status: 'pending', due: 'THU' },
  { id: 'dec-publish-ep13', title: 'APPROVE EP 13 PUBLISHING', type: 'PUBLISHING', status: 'pending', due: 'FRI' },
  { id: 'dec-guest-cast', title: 'APPROVE GUEST CASTING SLOT', type: 'TALENT', status: 'pending', due: 'NEXT WEEK' },
  { id: 'dec-rewards', title: 'APPROVE SLAY CHALLENGE REWARD', type: 'REWARDS', status: 'pending', due: 'MON' },
];

export type ExecutiveTimelineItem = {
  id: string;
  label: string;
  date: string;
  category: 'today' | 'week' | 'month' | 'launch' | 'premiere' | 'drop';
};

export const EXECUTIVE_TIMELINE: ExecutiveTimelineItem[] = [
  { id: 'tl-1', label: 'REVIEW PSA EP 22 DISTRIBUTION', date: 'TODAY', category: 'today' },
  { id: 'tl-2', label: 'APPROVE FRIDAY EMAIL DRAFT', date: 'TODAY', category: 'today' },
  { id: 'tl-3', label: 'FINALIZE EP 13 THUMBNAIL', date: 'TODAY', category: 'today' },
  { id: 'tl-4', label: 'SLAY REPORT EP 13 PREMIERE', date: 'FRI 7PM', category: 'launch' },
  { id: 'tl-5', label: 'SUMMER JOURNAL PUBLISH', date: 'TUE', category: 'week' },
  { id: 'tl-6', label: 'CASTING BOARD REVIEW', date: 'WED', category: 'week' },
  { id: 'tl-7', label: 'SUMMER CAMPAIGN LAUNCH WINDOW', date: 'AUG 1–15', category: 'month' },
  { id: 'tl-8', label: 'SLAY LAB SEASON PREMIERE', date: 'AUG 22', category: 'premiere' },
  { id: 'tl-9', label: 'BEACH WAVE RESTOCK', date: 'TBD', category: 'drop' },
];

export type ExecutiveQuickAction = {
  id: string;
  label: string;
  route: string;
};

export const EXECUTIVE_QUICK_ACTIONS: ExecutiveQuickAction[] = [
  { id: 'new-pack', label: 'NEW CONTENT PACK', route: '/admin/studio/production' },
  { id: 'campaign', label: 'GENERATE CAMPAIGN', route: '/admin/studio/creative-director' },
  { id: 'episode', label: 'LAUNCH EPISODE', route: '/admin/studio/distribution-network' },
  { id: 'production', label: 'OPEN PRODUCTION', route: '/admin/studio/production' },
  { id: 'studio-lot', label: 'STUDIO LOT', route: '/admin/studio/studio-lot' },
  { id: 'talent', label: 'TALENT AGENCY', route: '/admin/studio/talent-agency' },
  { id: 'casting', label: 'CASTING', route: '/admin/studio/casting' },
  { id: 'show-bible', label: 'SHOW BIBLE', route: '/admin/studio/show-bible' },
  { id: 'ai-prod', label: 'AI PRODUCTION', route: '/admin/studio/ai-production-engine' },
  { id: 'distribution', label: 'DISTRIBUTION', route: '/admin/studio/distribution-network' },
  { id: 'audience', label: 'AUDIENCE BRAIN', route: '/admin/studio/audience-brain' },
];

export type ExecutiveSearchEntry = {
  id: string;
  label: string;
  category: string;
  route: string;
  keywords: string[];
};

export const EXECUTIVE_SEARCH_INDEX: ExecutiveSearchEntry[] = [
  { id: 's-pack-13', label: 'SLAY REPORT EP 13', category: 'CONTENT PACK', route: '/admin/studio/production/pack-slay-report-13', keywords: ['slay', 'report', 'ep', '13', 'cherry', 'pack'] },
  { id: 's-show-slay', label: 'THE SLAY REPORT', category: 'SHOW', route: '/admin/studio/show-bible', keywords: ['show', 'slay', 'report'] },
  { id: 's-studio-weather', label: 'THE WEATHER STUDIO', category: 'STUDIO', route: '/admin/studio/studio-lot', keywords: ['studio', 'weather', 'lot'] },
  { id: 's-talent-reporter', label: 'BEAUTY REPORTER', category: 'TALENT', route: '/admin/studio/talent-agency', keywords: ['talent', 'reporter', 'beauty'] },
  { id: 's-noir', label: 'NOIR UNIT', category: 'PRODUCT', route: '/straight/noir', keywords: ['noir', 'product', 'wig', 'unit'] },
  { id: 's-order', label: 'RECENT ORDERS', category: 'ORDERS', route: '/admin/revenue', keywords: ['order', 'revenue', 'sales'] },
  { id: 's-email-friday', label: 'FRIDAY SLAY EMAIL', category: 'EMAIL', route: '/admin/studio/distribution-network/dist-slay-report-13', keywords: ['email', 'friday', 'slay'] },
  { id: 's-campaign-summer', label: 'SUMMER SLAY CAMPAIGN', category: 'CAMPAIGN', route: '/admin/studio/distribution-network/dist-campaign-summer', keywords: ['campaign', 'summer', 'slay'] },
  { id: 's-prompt', label: 'PROMPT LIBRARY', category: 'PROMPTS', route: '/admin/studio/prompt-library', keywords: ['prompt', 'library', 'ai'] },
  { id: 's-asset', label: 'ASSET LIBRARY', category: 'ASSETS', route: '/admin/studio/asset-library', keywords: ['asset', 'thumbnail', 'b-roll'] },
  { id: 's-cd', label: 'CREATIVE DIRECTOR', category: 'MODULE', route: '/admin/studio/creative-director', keywords: ['creative', 'director', 'cd'] },
  { id: 's-customer', label: 'CLIENT INSIGHTS', category: 'CUSTOMERS', route: '/admin/clients', keywords: ['customer', 'client', 'member'] },
];

export const EXECUTIVE_RECENT_WINS = [
  'SLAY REPORT EP 11 — 82% COMPLETION',
  'HAIR ANALYSIS — 3.2× CONVERSION LIFT',
  'MEMBERSHIP +14% NET NEW',
  'SUMMER MANIFESTO — DRAFT COMPLETE',
];

export const EXECUTIVE_TODAY_PRIORITIES = [
  'FINALIZE EP 13 THUMBNAIL',
  'APPROVE FRIDAY EMAIL',
  'REVIEW PSA EP 22 DISTRIBUTION',
  'GREENLIGHT BEACH WAVE TUTORIAL',
  'CHECK SUMMER CAMPAIGN ASSETS',
];

export function searchExecutiveIndex(query: string): ExecutiveSearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return EXECUTIVE_SEARCH_INDEX.filter(
    (e) =>
      e.label.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.keywords.some((k) => k.includes(q) || q.includes(k))
  );
}

export function urgencyColor(urgency: ExecutiveRisk['urgency']): string {
  if (urgency === 'critical') return '#EB1C24';
  if (urgency === 'high') return '#CA8A04';
  return '#6B7280';
}
