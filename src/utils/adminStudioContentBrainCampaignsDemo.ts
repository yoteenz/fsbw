/** Campaign Frameworks — reusable campaign blueprints. */

export type CampaignFrameworkEntry = {
  id: string;
  title: string;
  type: string;
  description: string;
  objective: string;
  audience: string;
  channels: string;
  timeline: string;
  keyMessages: string;
  contentAssets: string;
  ctas: string;
  rewards: string;
  kpis: string;
  notes: string;
};

export type CampaignFrameworkFieldKey = keyof Omit<CampaignFrameworkEntry, 'id'>;

export const CAMPAIGN_FRAMEWORK_FIELD_GROUPS: Array<{
  title: string;
  keys: CampaignFrameworkFieldKey[];
}> = [
  {
    title: 'OVERVIEW',
    keys: ['title', 'type', 'description', 'objective', 'audience'],
  },
  {
    title: 'EXECUTION',
    keys: ['channels', 'timeline', 'keyMessages', 'contentAssets'],
  },
  {
    title: 'GROWTH',
    keys: ['ctas', 'rewards', 'kpis', 'notes'],
  },
];

export const CAMPAIGN_FRAMEWORK_FIELD_LABELS: Record<CampaignFrameworkFieldKey, string> = {
  title: 'CAMPAIGN TITLE',
  type: 'CAMPAIGN TYPE',
  description: 'DESCRIPTION',
  objective: 'OBJECTIVE',
  audience: 'TARGET AUDIENCE',
  channels: 'CHANNELS',
  timeline: 'TIMELINE',
  keyMessages: 'KEY MESSAGES',
  contentAssets: 'CONTENT ASSETS',
  ctas: 'CTAS',
  rewards: 'REWARDS / OFFERS',
  kpis: 'KPIS',
  notes: 'NOTES',
};

export const ADMIN_STUDIO_CAMPAIGN_FRAMEWORKS_DEFAULTS: CampaignFrameworkEntry[] = [
  {
    id: 'cf-launch',
    title: 'UNIT LAUNCH — NEW COLLECTION',
    type: 'LAUNCH CAMPAIGN',
    description: 'FULL-FUNNEL LAUNCH FOR A NEW WIG UNIT OR COLORWAY.',
    objective: 'AWARENESS → CONSIDERATION → FIRST PURCHASE',
    audience: 'EXISTING MEMBERS + LOOKALIKE SHOPPERS',
    channels: 'LOUNGE PREMIERE · EMAIL · IG · TIKTOK · PINTEREST · PSA',
    timeline: 'TEASE (7D) → LAUNCH (D0) → SUSTAIN (14D)',
    keyMessages: 'MUSEUM-QUALITY · BUILT FOR YOUR SLAY · TRUST OVER SALES',
    contentAssets: 'BRAND FILM · EPISODE · JOURNAL · CAROUSEL · THUMBNAILS',
    ctas: 'SHOP COLLECTION · OPEN BUILD-A-WIG · WATCH IN LOUNGE',
    rewards: 'EARLY ACCESS FOR BLACK · BUNDLE OFFER',
    kpis: 'VIEWS · CTR · UNITS SOLD · MEMBERSHIP CONVERSIONS',
    notes: 'REFERENCE PRODUCT KNOWLEDGE + BRAND BRAIN FOR ALL COPY.',
  },
  {
    id: 'cf-product-drop',
    title: 'PRODUCT DROP — LIMITED COLOR',
    type: 'PRODUCT DROP',
    description: 'SCARCITY-DRIVEN DROP FOR LIMITED COLORWAY OR LENGTH.',
    objective: 'URGENCY WITHOUT PRESSURE — SELL THROUGH INVENTORY',
    audience: 'PREMIUM + BLACK MEMBERS FIRST',
    channels: 'PUSH · EMAIL · IG STORIES · LOUNGE FEATURED',
    timeline: 'ANNOUNCE (48H) → DROP (D0) → LAST CALL (24H)',
    keyMessages: 'LIMITED RUN · YOUR SIGNATURE SHADE · WHEN ITS GONE ITS GONE',
    contentAssets: 'HERO IMAGE · 15 SEC REEL · EMAIL · PIN',
    ctas: 'SHOP NOW · ADD TO BAG · NOTIFY ME',
    rewards: 'SLAY TICKET EARLY ACCESS',
    kpis: 'SELL-THROUGH · EMAIL OPENS · PUSH CTR',
    notes: 'NO FAKE SCARCITY — REAL INVENTORY ONLY.',
  },
  {
    id: 'cf-holiday',
    title: 'HOLIDAY — SEASONAL SLAY',
    type: 'HOLIDAY',
    description: 'SEASONAL STORYTELLING WITH GIFTING AND SELF-CARE ANGLES.',
    objective: 'GIFT REVENUE + MEMBER ENGAGEMENT',
    audience: 'ALL MEMBERS + GIFT BUYERS',
    channels: 'CAMPAIGN FILM · EMAIL · SOCIAL · LOUNGE',
    timeline: '4 WEEKS BEFORE PEAK HOLIDAY',
    keyMessages: 'GIFT THE SLAY · TREAT YOURSELF · LUXURY WITHOUT COMPROMISE',
    contentAssets: 'BRAND FILM · GIFT GUIDE JOURNAL · CAROUSEL · EMAIL SERIES',
    ctas: 'SHOP GIFT CARDS · BROWSE COLORS · JOIN MEMBERSHIP',
    rewards: 'HOLIDAY BUNDLE · FREE GIFT THRESHOLD',
    kpis: 'GIFT CARD SALES · AOV · NEW MEMBERS',
    notes: 'ALIGN WITH EDITORIAL RULES HOLIDAY TONE — WARM NOT TACKY.',
  },
  {
    id: 'cf-membership',
    title: 'MEMBERSHIP DRIVE — PREMIUM UPGRADE',
    type: 'MEMBERSHIP DRIVE',
    description: 'CONVERT STANDARD MEMBERS TO PREMIUM SUBSCRIPTION.',
    objective: 'PREMIUM SUBSCRIPTION CONVERSIONS',
    audience: 'STANDARD MEMBERS WITH 2+ ORDERS',
    channels: 'EMAIL · LOUNGE · PSA · ACCOUNT REWARDS',
    timeline: '2 WEEK PUSH · ONGOING NURTURE',
    keyMessages: 'UNLOCK LOUNGE · PSA PRIORITY · PREMIUM BUILD OPTIONS',
    contentAssets: 'COMPARISON CHART · TESTIMONIAL · PSA EXPLAINERS',
    ctas: 'JOIN MEMBERSHIP · CONFIRM SUBSCRIPTION · VIEW REWARDS',
    rewards: 'TRIAL OFFER · BONUS SLAY POINTS',
    kpis: 'UPGRADE RATE · CHURN · LOUNGE ACTIVATION',
    notes: 'TRUST OVER SALES — EDUCATE VALUE FIRST.',
  },
  {
    id: 'cf-reward',
    title: 'REWARD CAMPAIGN — SLAY CHALLENGE',
    type: 'REWARD CAMPAIGN',
    description: '6-MONTH SLAY CHALLENGE CYCLE ACTIVATION.',
    objective: 'ENGAGEMENT + REPEAT PURCHASE',
    audience: 'ACTIVE MEMBERS IN CURRENT CYCLE',
    channels: 'ACCOUNT ALERTS · EMAIL · LOUNGE · CONCIERGE',
    timeline: 'CYCLE START → MIDPOINT → REWARD SELECTION',
    keyMessages: 'YOUR SLAY JOURNEY · EARN YOUR REWARD · COMMUNITY WINS',
    contentAssets: 'CHALLENGE GUIDE · PROGRESS EMAILS · LOUNGE EPISODES',
    ctas: 'VIEW SLAY CHALLENGE · SELECT REWARD · CHECK PROGRESS',
    rewards: 'CYCLE REWARD SELECTION · BONUS VOUCHERS',
    kpis: 'COMPLETION RATE · REWARD REDEMPTION · REPEAT ORDERS',
    notes: 'SYNC WITH ACCOUNT CONCIERGE SLAY CHALLENGE STAGE.',
  },
  {
    id: 'cf-affiliate',
    title: 'AFFILIATE — CREATOR PARTNERSHIP',
    type: 'AFFILIATE CAMPAIGN',
    description: 'CREATOR-LICENSED CONTENT WITH AFFILIATE TRACKING.',
    objective: 'REACH EXPANSION + ATTRIBUTED SALES',
    audience: 'CREATOR AUDIENCE + LOOKALIKES',
    channels: 'CREATOR SOCIAL · EMAIL CO-SEND · LANDING PAGE',
    timeline: 'ONBOARD (1W) → LIVE (2W) → REPORT (1W)',
    keyMessages: 'AUTHENTIC SLAY · REAL RESULTS · FRONTAL SLAYER QUALITY',
    contentAssets: 'CREATOR BRIEF · APPROVED ASSETS · AFFILIATE LINK KIT',
    ctas: 'SHOP WITH CODE · OPEN BUILD-A-WIG',
    rewards: 'AFFILIATE COMMISSION · EXCLUSIVE CODE',
    kpis: 'ATTRIBUTED REVENUE · CLICKS · NEW CUSTOMERS',
    notes: 'ALL CREATOR CONTENT THROUGH APPROVAL RULES.',
  },
  {
    id: 'cf-educational',
    title: 'EDUCATIONAL — LACE MASTERY SERIES',
    type: 'EDUCATIONAL CAMPAIGN',
    description: 'MULTI-EPISODE EDUCATION SERIES WITH LOUNGE SYNC.',
    objective: 'WATCH TIME + SKILL BUILDING + PRODUCT AFFINITY',
    audience: 'ALL MEMBERS · NEW INSTALL LEARNERS',
    channels: 'SLAY ACADEMY · LOUNGE LEARN · EMAIL DRIP · PINTEREST',
    timeline: '4-WEEK SERIES · ONE LESSON PER WEEK',
    keyMessages: 'MASTER YOUR LACE · STEP BY STEP · NO GATEKEEPING',
    contentAssets: '4 EPISODES · 4 JOURNALS · CHECKLISTS · PINS',
    ctas: 'WATCH EPISODE · READ GUIDE · TRY IN BUILD-A-WIG',
    rewards: 'COURSE COMPLETION BADGE · SLAY CREDIT',
    kpis: 'COMPLETION RATE · LESSON VIEWS · PRODUCT CLICKS',
    notes: 'REFERENCE SHOW BIBLE SLAY ACADEMY + EDITORIAL RULES.',
  },
  {
    id: 'cf-seasonal',
    title: 'SEASONAL — FALL COLOR FORECAST',
    type: 'SEASONAL CAMPAIGN',
    description: 'SEASONAL TREND REPORT TIED TO SLAY REPORT.',
    objective: 'TREND AUTHORITY + COLOR SALES',
    audience: 'FASHION-FORWARD MEMBERS + NEWSLETTER LIST',
    channels: 'SLAY REPORT · EMAIL · IG · TIKTOK · PINTEREST',
    timeline: 'SEASON KICKOFF → MID-SEASON → CLOSEOUT',
    keyMessages: 'CHERRY RED FORECAST · WEAR THE TREND · BUILD YOUR SHADE',
    contentAssets: 'FORECAST EPISODE · SWATCH CAROUSEL · JOURNAL · PINS',
    ctas: 'BROWSE COLORS · OPEN BUILD-A-WIG · WATCH SLAY REPORT',
    rewards: 'SEASONAL BUNDLE · COLOR CONSULT VIA PSA',
    kpis: 'COLOR SKU SALES · SOCIAL SAVES · EPISODE VIEWS',
    notes: 'MASTER TOPIC FEEDS CONTENT ENGINE WORKFLOW.',
  },
];
