/** THE LEGACY SYSTEM — permanent memory & living museum of Frontal Slayer Studios. */

export const ADMIN_STUDIO_LEGACY_SYSTEM_SUBTITLE =
  'EVERY STORY DESERVES TO BE REMEMBERED — THE LIVING MUSEUM OF FRONTAL SLAYER STUDIOS.';

export type LegacyLandingCardId =
  | 'archives'
  | 'hall-of-fame'
  | 'studio-awards'
  | 'talent-careers'
  | 'show-history'
  | 'studio-history'
  | 'campaign-history'
  | 'community-legacy'
  | 'vault-of-firsts'
  | 'time-capsules'
  | 'legacy-timeline'
  | 'anniversary-collections'
  | 'founder-journal'
  | 'founder-predictions'
  | 'legacy-letters'
  | 'annual-reviews'
  | 'documentary-mode';

export const LEGACY_LANDING_CARDS: Array<{
  id: LegacyLandingCardId;
  title: string;
  metric: string;
  description: string;
  accentHex: string;
  founderOnly?: boolean;
}> = [
  { id: 'archives', title: 'THE ARCHIVES', metric: '2,847', description: 'MASTER HISTORICAL RECORD · SEARCHABLE', accentHex: '#8B0000' },
  { id: 'hall-of-fame', title: 'HALL OF FAME', metric: '48', description: 'LEGENDARY PLAQUES · PERMANENT HONOR', accentHex: '#CA8A04' },
  { id: 'studio-awards', title: 'STUDIO AWARDS', metric: '2026', description: 'YEARLY CEREMONY · NOMINEES & WINNERS', accentHex: '#EB1C24' },
  { id: 'talent-careers', title: 'TALENT CAREERS', metric: '12', description: 'RECURRING PERSONALITIES · AUTO-UPDATED', accentHex: '#2563EB' },
  { id: 'show-history', title: 'SHOW HISTORY', metric: '8', description: 'SEASONS · EPISODES · EVOLUTION', accentHex: '#6B7280' },
  { id: 'studio-history', title: 'STUDIO HISTORY', metric: '6', description: 'SETS · VERSIONS · PRODUCTIONS FILMED', accentHex: '#16A34A' },
  { id: 'campaign-history', title: 'CAMPAIGN HISTORY', metric: '24', description: 'LAUNCHES · LESSONS · TIMELINES', accentHex: '#C41E3A' },
  { id: 'community-legacy', title: 'COMMUNITY LEGACY', metric: '156', description: 'GUESTS · CHAMPIONS · MEMBER STORIES', accentHex: '#9333EA' },
  { id: 'vault-of-firsts', title: 'VAULT OF FIRSTS', metric: '22', description: 'LOCKED FOREVER · NEVER REPLACEABLE', accentHex: '#1F2937' },
  { id: 'time-capsules', title: 'TIME CAPSULES', metric: '9', description: 'SEALED MOMENTS · ANNIVERSARY REOPEN', accentHex: '#0D9488' },
  { id: 'legacy-timeline', title: 'LEGACY TIMELINE', metric: '38', description: 'MASTER COMPANY MILESTONES', accentHex: '#EB1C24' },
  { id: 'anniversary-collections', title: 'ANNIVERSARY COLLECTIONS', metric: '3', description: 'YEARLY LUXURY DIGITAL COLLECTIONS', accentHex: '#D97706' },
  { id: 'founder-journal', title: 'FOUNDER JOURNAL', metric: 'PRIVATE', description: 'REFLECTIONS ON MAJOR MILESTONES', accentHex: '#8B0000', founderOnly: true },
  { id: 'founder-predictions', title: 'FOUNDER PREDICTIONS', metric: '7', description: 'PLANNED · IN PROGRESS · ACHIEVED', accentHex: '#2563EB', founderOnly: true },
  { id: 'legacy-letters', title: 'LEGACY LETTERS', metric: '4', description: 'SEALED LETTERS TO FUTURE SELF', accentHex: '#6B7280', founderOnly: true },
  { id: 'annual-reviews', title: 'ANNUAL REVIEWS', metric: '2', description: 'YEAR IN REVIEW · AUTO-GENERATED', accentHex: '#16A34A' },
  { id: 'documentary-mode', title: 'DOCUMENTARY MODE', metric: '5', description: 'CHRONOLOGICAL STORY EXPERIENCES', accentHex: '#1F2937' },
];

export type LegacyMuseumTabId =
  | 'archives'
  | 'hall-of-fame'
  | 'awards'
  | 'talent'
  | 'shows'
  | 'studios'
  | 'campaigns'
  | 'community'
  | 'vault'
  | 'capsules'
  | 'timeline'
  | 'anniversaries'
  | 'founder-journal'
  | 'predictions'
  | 'letters'
  | 'annual-reviews'
  | 'documentary'
  | 'behind-scenes'
  | 'keys';

export const LEGACY_MUSEUM_TABS: Array<{ id: LegacyMuseumTabId; label: string; founderOnly?: boolean }> = [
  { id: 'archives', label: 'ARCHIVES' },
  { id: 'hall-of-fame', label: 'HALL OF FAME' },
  { id: 'awards', label: 'AWARDS' },
  { id: 'talent', label: 'TALENT' },
  { id: 'shows', label: 'SHOWS' },
  { id: 'studios', label: 'STUDIOS' },
  { id: 'campaigns', label: 'CAMPAIGNS' },
  { id: 'community', label: 'COMMUNITY' },
  { id: 'vault', label: 'VAULT' },
  { id: 'capsules', label: 'CAPSULES' },
  { id: 'timeline', label: 'TIMELINE' },
  { id: 'anniversaries', label: 'YEARS' },
  { id: 'founder-journal', label: 'JOURNAL', founderOnly: true },
  { id: 'predictions', label: 'PREDICT', founderOnly: true },
  { id: 'letters', label: 'LETTERS', founderOnly: true },
  { id: 'annual-reviews', label: 'REVIEWS' },
  { id: 'documentary', label: 'DOCS' },
  { id: 'behind-scenes', label: 'BTS' },
  { id: 'keys', label: 'KEYS' },
];

export const LEGACY_CARD_TAB_MAP: Partial<Record<LegacyLandingCardId, LegacyMuseumTabId>> = {
  archives: 'archives',
  'hall-of-fame': 'hall-of-fame',
  'studio-awards': 'awards',
  'talent-careers': 'talent',
  'show-history': 'shows',
  'studio-history': 'studios',
  'campaign-history': 'campaigns',
  'community-legacy': 'community',
  'vault-of-firsts': 'vault',
  'time-capsules': 'capsules',
  'legacy-timeline': 'timeline',
  'anniversary-collections': 'anniversaries',
  'founder-journal': 'founder-journal',
  'founder-predictions': 'predictions',
  'legacy-letters': 'letters',
  'annual-reviews': 'annual-reviews',
  'documentary-mode': 'documentary',
};

export const LEGACY_CONTRIBUTION_CHAIN = [
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
  'LEGACY SYSTEM',
] as const;

export type LegacyArchiveRecord = {
  id: string;
  category: string;
  title: string;
  date: string;
  sourceRef: string;
  searchable: string;
};

export const LEGACY_ARCHIVE_RECORDS: LegacyArchiveRecord[] = [
  { id: 'ar-1', category: 'PRODUCTION', title: 'SLAY REPORT EP 12 — CHERRY RED FORECAST', date: '2026-06-28', sourceRef: 'production/pack-sr-ep12', searchable: 'episode slay report cherry red' },
  { id: 'ar-2', category: 'CONTENT PACK', title: 'LACE MASTERY WEEK 24', date: '2026-06-21', sourceRef: 'content-packs/lm-w24', searchable: 'lace mastery lounge tv' },
  { id: 'ar-3', category: 'SCRIPT', title: 'PSA FOUNDER HOLOGRAM v3.2', date: '2026-05-14', sourceRef: 'prompt-library/psa-v32', searchable: 'psa script founder' },
  { id: 'ar-4', category: 'CAMPAIGN', title: 'SUMMER SLAY LAUNCH WEEK', date: '2026-06-01', sourceRef: 'content-brain/campaign-summer-slay', searchable: 'summer slay campaign launch' },
  { id: 'ar-5', category: 'THUMBNAIL', title: 'NOIR CHERRY RED HERO', date: '2026-06-15', sourceRef: 'asset-library/thumb-noir-cr', searchable: 'noir thumbnail cherry red' },
  { id: 'ar-6', category: 'EMAIL', title: 'MEMBER WELCOME SEQUENCE #1', date: '2026-03-10', sourceRef: 'distribution/email-welcome-1', searchable: 'email welcome member' },
  { id: 'ar-7', category: 'JOURNAL', title: 'THE ART OF THE PERFECT PART', date: '2026-06-18', sourceRef: 'publishing/journal-part-art', searchable: 'journal parting article' },
  { id: 'ar-8', category: 'PROMPT', title: 'GPT IMAGE 2 NOIR COLOR v4', date: '2026-04-22', sourceRef: 'prompt-library/gpt2-noir-v4', searchable: 'prompt gpt image noir' },
];

export type LegacyHallOfFameEntry = {
  id: string;
  category: string;
  honoree: string;
  year: string;
  citation: string;
  accentHex: string;
};

export const LEGACY_HALL_OF_FAME: LegacyHallOfFameEntry[] = [
  { id: 'hof-1', category: 'LEGENDARY EPISODE', honoree: 'CUTTING YOUR LACE — EP 01', year: '2026', citation: 'FIRST LOUNGE TV MASTERCLASS · 94% COMPLETION', accentHex: '#EB1C24' },
  { id: 'hof-2', category: 'LEGENDARY TALENT', honoree: 'FOUNDER KATEENA', year: '2026', citation: 'SIGNATURE VOICE OF FRONTAL SLAYER', accentHex: '#CA8A04' },
  { id: 'hof-3', category: 'LEGENDARY CAMPAIGN', honoree: 'BRAND LAUNCH WEEK', year: '2026', citation: 'DEFINED THE LUXURY EDITORIAL IDENTITY', accentHex: '#8B0000' },
  { id: 'hof-4', category: 'LEGENDARY SHOW', honoree: 'THE SLAY REPORT', year: '2026', citation: 'FLAGSHIP WEEKLY SERIES · 12 EPISODES', accentHex: '#2563EB' },
  { id: 'hof-5', category: 'FOUNDER\'S PICK', honoree: 'BUILD-A-WIG NOIR', year: '2026', citation: 'THE PRODUCT THAT STARTED EVERYTHING', accentHex: '#16A34A' },
  { id: 'hof-6', category: 'CREATIVE DIRECTOR\'S PICK', honoree: 'CHERRY RED FORECAST', year: '2026', citation: 'BOLD COLOR MOMENT · AUDIENCE +41%', accentHex: '#C41E3A' },
  { id: 'hof-7', category: 'INNOVATION MOMENT', honoree: 'PSA FOUNDER HOLOGRAM', year: '2026', citation: 'PREMIUM CONCIERGE WITHOUT GATEKEEPING', accentHex: '#9333EA' },
  { id: 'hof-8', category: 'COMMUNITY LEGEND', honoree: 'SLAY CHALLENGE CYCLE 1', year: '2026', citation: '64% COMPLETION · REWARDS REDEEMED', accentHex: '#D97706' },
];

export type LegacyAwardCategory = {
  id: string;
  title: string;
  winner: string;
  nominees: string[];
  year: number;
};

export const LEGACY_AWARD_CATEGORIES: LegacyAwardCategory[] = [
  { id: 'aw-1', title: 'BEST EPISODE', winner: 'CUTTING YOUR LACE EP 01', nominees: ['SLAY REPORT EP 12', 'BEACH WAVE TUTORIAL', 'LACE MASTERY W24'], year: 2026 },
  { id: 'aw-2', title: 'BEST CAMPAIGN', winner: 'SUMMER SLAY LAUNCH', nominees: ['BRAND LAUNCH WEEK', 'CHERRY RED DROP', 'MEMBER REFERRAL PUSH'], year: 2026 },
  { id: 'aw-3', title: 'BEST PRODUCT LAUNCH', winner: 'NOIR CHERRY RED', nominees: ['BEACH WAVE RESTOCK', 'BLANCO PEARL'], year: 2026 },
  { id: 'aw-4', title: 'BEST THUMBNAIL', winner: 'SLAY REPORT EP 12', nominees: ['LACE MASTERY', 'PSA HERO'], year: 2026 },
  { id: 'aw-5', title: 'BEST TALENT', winner: 'FOUNDER KATEENA', nominees: ['GUEST STYLIST A', 'COMMUNITY SPOTLIGHT B'], year: 2026 },
  { id: 'aw-6', title: 'CREATIVE DIRECTOR\'S CHOICE', winner: 'CHERRY RED FORECAST', nominees: ['SUMMER SLAY', 'LACE MASTERY'], year: 2026 },
  { id: 'aw-7', title: 'FOUNDER\'S CHOICE', winner: 'BUILD-A-WIG JOURNEY', nominees: ['LOUNGE TV ORIGIN', 'PSA MOMENT'], year: 2026 },
  { id: 'aw-8', title: 'STUDIO EXCELLENCE', winner: 'MARBLE STUDIO A', nominees: ['NEON LOUNGE SET', 'EDITORIAL DESK'], year: 2026 },
];

export type LegacyTalentCareer = {
  id: string;
  name: string;
  role: string;
  joinedDate: string;
  status: string;
  currentSeason: string;
  shows: string;
  episodeCount: number;
  campaignCount: number;
  guestAppearances: number;
  studiosUsed: string;
  catchphrase: string;
  communityRating: number;
  awards: string;
  firstAppearance: string;
  latestAppearance: string;
  upcoming: string;
  highlights: string[];
};

export const LEGACY_TALENT_CAREERS: LegacyTalentCareer[] = [
  {
    id: 'tc-1', name: 'FOUNDER KATEENA', role: 'HOST · EDUCATOR · CREATIVE VOICE', joinedDate: '2026-01-15', status: 'ACTIVE LEGEND',
    currentSeason: 'SLAY REPORT S2', shows: 'SLAY REPORT · LOUNGE TV · PSA', episodeCount: 28, campaignCount: 12, guestAppearances: 0,
    studiosUsed: 'MARBLE A · EDITORIAL DESK', catchphrase: 'SLAY WITH CONFIDENCE', communityRating: 98, awards: 'HALL OF FAME 2026',
    firstAppearance: 'BRAND LAUNCH', latestAppearance: 'SLAY REPORT EP 12', upcoming: 'EP 13 · FRI 7PM',
    highlights: ['FIRST LOUNGE TV EPISODE', 'PSA FOUNDER VOICE', 'SUMMER SLAY CAMPAIGN FACE'],
  },
  {
    id: 'tc-2', name: 'GUEST STYLIST MIKA', role: 'RECURRING GUEST · LACE SPECIALIST', joinedDate: '2026-03-22', status: 'ACTIVE',
    currentSeason: 'LACE MASTERY', shows: 'LOUNGE TV · SLAY REPORT GUEST', episodeCount: 6, campaignCount: 2, guestAppearances: 6,
    studiosUsed: 'MARBLE A', catchphrase: 'LACE IS ART', communityRating: 92, awards: 'COMMUNITY FAVORITE NOMINEE',
    firstAppearance: 'LACE MASTERY EP 03', latestAppearance: 'CUTTING YOUR LACE', upcoming: 'LACE MASTERY W25',
    highlights: ['94% EPISODE COMPLETION CO-HOST', 'COMMUNITY Q&A FEATURE'],
  },
];

export type LegacyShowHistory = {
  id: string;
  title: string;
  premiereDate: string;
  seasons: number;
  episodes: number;
  avgCompletion: number;
  audienceRating: number;
  mostWatched: string;
  mostShared: string;
  bestCta: string;
  introEvolution: string;
  visualEvolution: string;
  thumbnailEvolution: string;
};

export const LEGACY_SHOW_HISTORIES: LegacyShowHistory[] = [
  {
    id: 'sh-1', title: 'THE SLAY REPORT', premiereDate: '2026-02-07', seasons: 2, episodes: 12, avgCompletion: 72,
    audienceRating: 4.8, mostWatched: 'EP 12 CHERRY RED', mostShared: 'EP 08 BEACH WAVE', bestCta: 'SHOP NOIR — EP 12',
    introEvolution: 'V1 STATIC → V2 MARBLE WIPE → V3 CINEMATIC', visualEvolution: 'EDITORIAL DESK → FULL STUDIO LOT',
    thumbnailEvolution: 'HANDWRITTEN → LUXURY GLASS FRAME',
  },
  {
    id: 'sh-2', title: 'LOUNGE TV — LACE MASTERY', premiereDate: '2026-04-01', seasons: 1, episodes: 24, avgCompletion: 68,
    audienceRating: 4.7, mostWatched: 'CUTTING YOUR LACE', mostShared: 'PLUCKING 101', bestCta: 'BUILD-A-WIG CUSTOMIZE',
    introEvolution: 'CRT STATIC → CURTAIN REVEAL', visualEvolution: 'LOBBY SALON CHROME UNCHANGED',
    thumbnailEvolution: 'WEEKLY ROTATION · GLASS BADGE',
  },
];

export type LegacyStudioHistory = {
  id: string;
  name: string;
  createdDate: string;
  version: string;
  lightingUpdates: string;
  cameraUpdates: string;
  redesigns: string;
  productionsFilmed: number;
  topTalent: string;
  popularEpisodes: string;
};

export const LEGACY_STUDIO_HISTORIES: LegacyStudioHistory[] = [
  { id: 'st-1', name: 'MARBLE STUDIO A', createdDate: '2026-01-20', version: 'v3.2', lightingUpdates: 'WARM KEY + RIM v2', cameraUpdates: '4K PRIMARY · B-ROLL MIRROR', redesigns: 'GLASS PANEL BACKDROP 2026-04', productionsFilmed: 42, topTalent: 'FOUNDER KATEENA', popularEpisodes: 'SLAY REPORT · LACE MASTERY' },
  { id: 'st-2', name: 'EDITORIAL DESK', createdDate: '2026-02-01', version: 'v2.0', lightingUpdates: 'SOFT BOX EDITORIAL', cameraUpdates: 'OVERHEAD PRODUCT SHOTS', redesigns: 'MARBLE SURFACE UPGRADE', productionsFilmed: 18, topTalent: 'FOUNDER KATEENA', popularEpisodes: 'JOURNAL READS · EMAIL HEROES' },
];

export type LegacyCampaignHistory = {
  id: string;
  title: string;
  launchDate: string;
  goal: string;
  assetsProduced: number;
  contentCreated: number;
  audienceReach: string;
  membershipGrowth: string;
  revenueInfluence: string;
  lessonsLearned: string;
};

export const LEGACY_CAMPAIGN_HISTORIES: LegacyCampaignHistory[] = [
  { id: 'ch-1', title: 'BRAND LAUNCH WEEK', launchDate: '2026-01-15', goal: 'ESTABLISH LUXURY IDENTITY', assetsProduced: 48, contentCreated: 12, audienceReach: '18K UNIQUE', membershipGrowth: '+240', revenueInfluence: '$12.4K', lessonsLearned: 'EDITORIAL SPACING WINS OVER DENSITY' },
  { id: 'ch-2', title: 'SUMMER SLAY', launchDate: '2026-06-01', goal: 'CHERRY RED MOMENTUM', assetsProduced: 32, contentCreated: 8, audienceReach: '24K UNIQUE', membershipGrowth: '+186', revenueInfluence: '$18.2K', lessonsLearned: 'SHORT-FORM + LONG-FORM SYNERGY' },
];

export type LegacyCommunityEntry = {
  id: string;
  category: string;
  name: string;
  story: string;
  year: string;
};

export const LEGACY_COMMUNITY_ENTRIES: LegacyCommunityEntry[] = [
  { id: 'cm-1', category: 'GUEST STAR', name: 'STYLIST MIKA', story: 'FIRST RECURRING COMMUNITY GUEST ON LOUNGE TV', year: '2026' },
  { id: 'cm-2', category: 'AFFILIATE CHAMPION', name: 'SLAY QUEEN J', story: 'TOP AFFILIATE · 42 REFERRALS', year: '2026' },
  { id: 'cm-3', category: 'FOUNDING MEMBER', name: 'MEMBER #001', story: 'FIRST PREMIUM MEMBER · STILL ACTIVE', year: '2026' },
  { id: 'cm-4', category: 'CONTEST WINNER', name: 'LACE MASTERY CHALLENGE', story: 'COMMUNITY SUBMISSION WINNER · FEATURED IN EP', year: '2026' },
  { id: 'cm-5', category: 'LOYALTY LEGEND', name: 'BLACK TIER ALEX', story: '3-YEAR MEMBERSHIP · 12 ORDERS', year: '2026' },
];

export type LegacyVaultFirst = {
  id: string;
  title: string;
  date: string;
  description: string;
  locked: true;
};

export const LEGACY_VAULT_OF_FIRSTS: LegacyVaultFirst[] = [
  { id: 'vf-1', title: 'FIRST ORDER', date: '2026-01-16', description: 'ORDER #001 — NOIR 22"', locked: true },
  { id: 'vf-2', title: 'FIRST PRODUCT SOLD', date: '2026-01-16', description: 'NOIR — THE ORIGIN UNIT', locked: true },
  { id: 'vf-3', title: 'FIRST MEMBER', date: '2026-01-18', description: 'MEMBER #001 — PREMIUM', locked: true },
  { id: 'vf-4', title: 'FIRST LOUNGE TV EPISODE', date: '2026-04-01', description: 'CUTTING YOUR LACE', locked: true },
  { id: 'vf-5', title: 'FIRST EMAIL CAMPAIGN', date: '2026-02-14', description: 'VALENTINE SLAY SEND', locked: true },
  { id: 'vf-6', title: 'FIRST STUDIO', date: '2026-01-20', description: 'MARBLE STUDIO A', locked: true },
  { id: 'vf-7', title: 'FIRST SHOW', date: '2026-02-07', description: 'THE SLAY REPORT PREMIERE', locked: true },
  { id: 'vf-8', title: 'FIRST TALENT', date: '2026-01-15', description: 'FOUNDER KATEENA ON CAMERA', locked: true },
  { id: 'vf-9', title: 'FIRST CAMPAIGN', date: '2026-01-15', description: 'BRAND LAUNCH WEEK', locked: true },
  { id: 'vf-10', title: 'FIRST STUDIO AWARD', date: '2026-12-31', description: '2026 CEREMONY — BEST EPISODE', locked: true },
];

export type LegacyTimeCapsule = {
  id: string;
  title: string;
  sealedDate: string;
  reopenDate: string;
  status: 'SEALED' | 'REOPEN ANNIVERSARY';
  contents: string[];
};

export const LEGACY_TIME_CAPSULES: LegacyTimeCapsule[] = [
  { id: 'tcap-1', title: 'BRAND LAUNCH', sealedDate: '2026-01-15', reopenDate: '2027-01-15', status: 'SEALED', contents: ['HOMEPAGE v1', 'BRAND BRAIN SNAPSHOT', 'FIRST CATALOG', 'FOUNDER NOTE'] },
  { id: 'tcap-2', title: 'FIRST 100 ORDERS', sealedDate: '2026-02-28', reopenDate: '2027-02-28', status: 'SEALED', contents: ['ORDER MILESTONE', 'ANALYTICS SNAPSHOT', 'MEMBER ROSTER', 'PRODUCT CATALOG'] },
  { id: 'tcap-3', title: 'FIRST LOUNGE TV SEASON', sealedDate: '2026-06-30', reopenDate: '2027-06-30', status: 'SEALED', contents: ['24 EPISODES', 'SHOW BIBLE', 'TALENT ROSTER', 'THUMBNAIL GALLERY'] },
];

export type LegacyTimelineEvent = {
  id: string;
  label: string;
  date: string;
  category: string;
};

export const LEGACY_TIMELINE_EVENTS: LegacyTimelineEvent[] = [
  { id: 'tl-1', label: 'BRAND LAUNCH', date: '2026-01-15', category: 'milestone' },
  { id: 'tl-2', label: 'FIRST ORDER', date: '2026-01-16', category: 'milestone' },
  { id: 'tl-3', label: '100 ORDERS', date: '2026-02-28', category: 'milestone' },
  { id: 'tl-4', label: 'FIRST STUDIO', date: '2026-01-20', category: 'studio' },
  { id: 'tl-5', label: 'FIRST SHOW PREMIERE', date: '2026-02-07', category: 'show' },
  { id: 'tl-6', label: '1,000 ORDERS', date: '2026-05-15', category: 'milestone' },
  { id: 'tl-7', label: 'FIRST COMMUNITY GUEST', date: '2026-03-22', category: 'community' },
  { id: 'tl-8', label: 'LOUNGE TV SEASON 1', date: '2026-06-30', category: 'show' },
];

export type LegacyAnniversaryCollection = {
  id: string;
  year: number;
  title: string;
  subtitle: string;
  itemCount: number;
  highlight: string;
};

export const LEGACY_ANNIVERSARY_COLLECTIONS: LegacyAnniversaryCollection[] = [
  { id: 'ac-2026', year: 2026, title: '2026', subtitle: 'THE BEGINNING', itemCount: 2847, highlight: 'BRAND LAUNCH · FIRST STUDIO · SLAY REPORT' },
  { id: 'ac-2027', year: 2027, title: '2027', subtitle: 'THE MANSION ERA', itemCount: 0, highlight: 'DESKTOP MANSION · EXPANDED STUDIOS' },
  { id: 'ac-2028', year: 2028, title: '2028', subtitle: 'THE MOBILE ERA', itemCount: 0, highlight: 'MOBILE APP · GLOBAL EXPANSION' },
];

export type FounderJournalEntry = {
  id: string;
  milestone: string;
  date: string;
  note: string;
  association: string;
};

export const LEGACY_FOUNDER_JOURNAL_DEFAULT: FounderJournalEntry[] = [
  { id: 'fj-1', milestone: 'BRAND LAUNCH', date: '2026-01-15', note: 'WE BUILT SOMETHING THE INDUSTRY HAS NEVER SEEN — LUXURY MEETS ACCESSIBILITY.', association: 'time-capsule/brand-launch' },
  { id: 'fj-2', milestone: 'FIRST LOUNGE TV EPISODE', date: '2026-04-01', note: 'THE LOBBY CAME ALIVE. THE TV IS NO LONGER DECORATION — IT IS A DESTINATION.', association: 'show/lace-mastery' },
];

export type FounderPredictionStatus = 'planned' | 'in-progress' | 'achieved' | 'archived';

export type FounderPrediction = {
  id: string;
  prediction: string;
  recordedDate: string;
  status: FounderPredictionStatus;
  targetYear?: string;
};

export const LEGACY_FOUNDER_PREDICTIONS_DEFAULT: FounderPrediction[] = [
  { id: 'fp-1', prediction: 'DESKTOP MANSION LAUNCHES NEXT YEAR', recordedDate: '2026-03-01', status: 'planned', targetYear: '2027' },
  { id: 'fp-2', prediction: 'REACH 100,000 MEMBERS', recordedDate: '2026-01-20', status: 'in-progress', targetYear: '2028' },
  { id: 'fp-3', prediction: 'EXPAND INTERNATIONALLY', recordedDate: '2026-02-10', status: 'planned', targetYear: '2028' },
  { id: 'fp-4', prediction: 'FIRST 1,000 ORDERS', recordedDate: '2026-01-16', status: 'achieved', targetYear: '2026' },
];

export type LegacyLetter = {
  id: string;
  title: string;
  sealedUntil: string;
  openIn: string;
  preview: string;
  status: 'sealed' | 'ready';
};

export const LEGACY_LETTERS_DEFAULT: LegacyLetter[] = [
  { id: 'll-1', title: 'TO FUTURE KATEENA — 1 YEAR', sealedUntil: '2027-01-15', openIn: '1 YEAR', preview: 'REMEMBER WHY WE STARTED…', status: 'sealed' },
  { id: 'll-2', title: 'TO FUTURE KATEENA — 5 YEARS', sealedUntil: '2031-01-15', openIn: '5 YEARS', preview: 'DID THE MANSION DREAM COME TRUE?', status: 'sealed' },
];

export type LegacyAnnualReview = {
  id: string;
  year: number;
  title: string;
  productsReleased: number;
  campaigns: number;
  revenueGrowth: string;
  membershipGrowth: string;
  awards: number;
  communityGrowth: string;
  mostWatched: string;
  bestProduct: string;
  biggestLesson: string;
  founderReflection: string;
  creativeDirectorReflection: string;
};

export const LEGACY_ANNUAL_REVIEWS: LegacyAnnualReview[] = [
  {
    id: 'ar-2026', year: 2026, title: '2026 IN REVIEW', productsReleased: 6, campaigns: 24, revenueGrowth: '+142%',
    membershipGrowth: '+840', awards: 8, communityGrowth: '+2.4K', mostWatched: 'CUTTING YOUR LACE',
    bestProduct: 'NOIR', biggestLesson: 'EDITORIAL PATIENCE BEATS VOLUME', founderReflection: 'WE PROVED LUXURY CAN BE ACCESSIBLE.',
    creativeDirectorReflection: 'CHERRY RED WAS THE COLOR OF THE YEAR.',
  },
];

export type LegacyDocumentary = {
  id: string;
  title: string;
  chapters: number;
  duration: string;
  description: string;
};

export const LEGACY_DOCUMENTARIES: LegacyDocumentary[] = [
  { id: 'doc-1', title: 'THE STORY OF LAUNCH', chapters: 8, duration: '24 MIN', description: 'BRAND BIRTH · FIRST ORDER · FIRST STUDIO' },
  { id: 'doc-2', title: 'THE MAKING OF LOUNGE TV', chapters: 12, duration: '36 MIN', description: 'LOBBY TO DESTINATION · SEASON 1' },
  { id: 'doc-3', title: 'THE EVOLUTION OF PSA', chapters: 6, duration: '18 MIN', description: 'CONCIERGE WITHOUT GATEKEEPING' },
  { id: 'doc-4', title: 'THE BUILD-A-WIG JOURNEY', chapters: 10, duration: '30 MIN', description: 'CUSTOMIZATION AS LUXURY EXPERIENCE' },
  { id: 'doc-5', title: 'THE DESKTOP MANSION STORY', chapters: 4, duration: '12 MIN', description: 'COMING 2027 · PLACEHOLDER TIMELINE' },
];

export type LegacyBehindScenesItem = {
  id: string;
  category: string;
  title: string;
  status: string;
  date: string;
};

export const LEGACY_BEHIND_SCENES: LegacyBehindScenesItem[] = [
  { id: 'bts-1', category: 'CONCEPT ART', title: 'MARBLE STUDIO A — INITIAL SKETCH', status: 'ARCHIVED', date: '2026-01-10' },
  { id: 'bts-2', category: 'REJECTED IDEA', title: 'NEON PINK CAMPAIGN DIRECTION', status: 'REJECTED', date: '2026-03-05' },
  { id: 'bts-3', category: 'PROMPT EVOLUTION', title: 'GPT IMAGE 2 NOIR v1 → v4', status: 'EVOLVED', date: '2026-04-22' },
  { id: 'bts-4', category: 'ALTERNATIVE THUMBNAIL', title: 'SLAY REPORT EP 12 — 3 VARIANTS', status: 'ARCHIVED', date: '2026-06-25' },
  { id: 'bts-5', category: 'DELETED SCENE', title: 'LACE MASTERY B-ROLL CUT', status: 'ARCHIVED', date: '2026-05-18' },
];

export type LegacyKey = {
  id: string;
  title: string;
  unlockedDate: string;
  milestone: string;
  description: string;
};

export const LEGACY_KEYS: LegacyKey[] = [
  { id: 'lk-1', title: 'FOUNDER\'S KEY', unlockedDate: '2026-01-15', milestone: 'BRAND LAUNCH', description: 'UNLOCKED ONCE · COMMEMORATES ORIGIN' },
  { id: 'lk-2', title: 'COMMUNITY KEY', unlockedDate: '2026-03-22', milestone: 'FIRST COMMUNITY GUEST', description: 'UNLOCKED ONCE · CELEBRATES THE PEOPLE' },
  { id: 'lk-3', title: 'INNOVATION KEY', unlockedDate: '2026-04-01', milestone: 'FIRST LOUNGE TV EPISODE', description: 'UNLOCKED ONCE · CONTENT INNOVATION' },
  { id: 'lk-4', title: 'LEGACY KEY', unlockedDate: '2026-07-04', milestone: 'LEGACY SYSTEM LAUNCH', description: 'UNLOCKED ONCE · PERMANENT MEMORY BEGINS' },
];

export type LegacySearchResult = {
  id: string;
  label: string;
  category: string;
  route: string;
};

const LEGACY_SEARCH_INDEX: LegacySearchResult[] = [
  { id: 's-1', label: 'SLAY REPORT EP 12', category: 'EPISODE', route: '/admin/studio/shows' },
  { id: 's-2', label: 'FOUNDER KATEENA', category: 'TALENT', route: '/admin/studio/talent-agency' },
  { id: 's-3', label: 'MARBLE STUDIO A', category: 'STUDIO', route: '/admin/studio/studio-lot' },
  { id: 's-4', label: 'SUMMER SLAY CAMPAIGN', category: 'CAMPAIGN', route: '/admin/studio/content-brain' },
  { id: 's-5', label: 'NOIR', category: 'PRODUCT', route: '/admin/studio/content-brain' },
  { id: 's-6', label: 'CUTTING YOUR LACE', category: 'EPISODE', route: '/admin/studio/shows' },
  { id: 's-7', label: 'BRAND LAUNCH TIME CAPSULE', category: 'TIME CAPSULE', route: '/admin/studio/legacy-system/museum?tab=capsules' },
  { id: 's-8', label: 'FIRST ORDER', category: 'VAULT OF FIRSTS', route: '/admin/studio/legacy-system/museum?tab=vault' },
  { id: 's-9', label: '2026 STUDIO AWARDS', category: 'AWARDS', route: '/admin/studio/legacy-system/museum?tab=awards' },
  { id: 's-10', label: 'GPT IMAGE 2 NOIR v4', category: 'PROMPT', route: '/admin/studio/prompt-library' },
];

export function searchLegacyIndex(query: string): LegacySearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return LEGACY_SEARCH_INDEX.filter(
    (r) => r.label.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)
  );
}
