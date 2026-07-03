/** Demo show catalog — recurring Frontal Slayer programs (CMS-ready). */

export type AdminStudioShow = {
  id: string;
  name: string;
  description: string;
  host: string;
  openingLine: string;
  closingLine: string;
  environment: string;
  membershipTier: string;
  publishingFrequency: string;
  thumbnailStyle: string;
  music: string;
  transitions: string;
  voiceStyle: string;
  promptTemplate: string;
  cta: string;
  rewardIntegration: string;
  brandColors: string;
  thumbnailSrc: string;
  /** Visual accent for streaming cards */
  accentHex: string;
};

export const ADMIN_STUDIO_SHOW_FIELD_GROUPS: Array<{
  title: string;
  keys: Array<keyof Omit<AdminStudioShow, 'id' | 'thumbnailSrc' | 'accentHex'>>;
}> = [
  {
    title: 'IDENTITY',
    keys: ['name', 'description', 'host', 'openingLine', 'closingLine'],
  },
  {
    title: 'PRODUCTION',
    keys: [
      'environment',
      'membershipTier',
      'publishingFrequency',
      'thumbnailStyle',
      'music',
      'transitions',
      'voiceStyle',
    ],
  },
  {
    title: 'BRAND & GROWTH',
    keys: ['promptTemplate', 'cta', 'rewardIntegration', 'brandColors'],
  },
];

export const ADMIN_STUDIO_SHOW_FIELD_LABELS: Record<
  keyof Omit<AdminStudioShow, 'id' | 'thumbnailSrc' | 'accentHex'>,
  string
> = {
  name: 'NAME',
  description: 'DESCRIPTION',
  host: 'HOST',
  openingLine: 'OPENING LINE',
  closingLine: 'CLOSING LINE',
  environment: 'ENVIRONMENT',
  membershipTier: 'MEMBERSHIP TIER',
  publishingFrequency: 'PUBLISHING FREQUENCY',
  thumbnailStyle: 'THUMBNAIL STYLE',
  music: 'MUSIC',
  transitions: 'TRANSITIONS',
  voiceStyle: 'VOICE STYLE',
  promptTemplate: 'PROMPT TEMPLATE',
  cta: 'CTA',
  rewardIntegration: 'REWARD INTEGRATION',
  brandColors: 'BRAND COLORS',
};

const THUMBS = [
  '/assets/NOIR/wave-thumb.png',
  '/assets/NOIR/curl-thumb.png',
  '/assets/NOIR/noir-thumb.png',
  '/assets/NOIR/blanco-thumb.png',
];

export const ADMIN_STUDIO_DEFAULT_SHOWS: AdminStudioShow[] = [
  {
    id: 'the-slay-report',
    name: 'THE SLAY REPORT',
    description:
      'WEEKLY FRONTAL SLAYER NEWSROOM — TRENDS, DROPS, MEMBER WINS, AND WHAT TO WATCH IN THE LOUNGE.',
    host: 'KATEENA ARMSTRONG',
    openingLine: 'WELCOME BACK TO THE SLAY REPORT — YOUR WEEKLY FRONTAL SLAYER BRIEFING.',
    closingLine: 'STAY SLAYED. WE WILL SEE YOU FRIDAY AT 7PM.',
    environment: 'NEWSROOM DESK · MARBLE BACKDROP · RED ACCENT LIGHTING',
    membershipTier: 'ALL MEMBERS',
    publishingFrequency: 'WEEKLY · FRIDAYS · 7PM ET',
    thumbnailStyle: 'BOLD RED LOWER THIRD · HANDWRITTEN TITLE · EPISODE BADGE',
    music: 'SLAY REPORT INTRO STING · 8 BAR BED · FADE UNDER VO',
    transitions: 'QUICK CUT · RED WIPE · EPISODE RECAP LOWER THIRD',
    voiceStyle: 'CONFIDENT · WARM · EDUCATOR — NO GATEKEEPING',
    promptTemplate: 'slay-report-weekly-v2',
    cta: 'WATCH IN THE LOUNGE · SAVE TO SLAY BOARD',
    rewardIntegration: 'SLAY CHALLENGE CHECK-IN · MEMBER SPOTLIGHT SHOUTOUT',
    brandColors: '#EB1C24 · #000000 · #FFFFFF',
    thumbnailSrc: THUMBS[0],
    accentHex: '#EB1C24',
  },
  {
    id: 'slay-lab',
    name: 'SLAY LAB',
    description: 'HANDS-ON EXPERIMENTS — LACE, COLOR, INSTALL TECHNIQUE, AND TOOL TESTS.',
    host: 'FRONTAL SLAYER EDUCATION TEAM',
    openingLine: 'SLAY LAB IS LIVE — TODAY WE TEST, MEASURE, AND PERFECT YOUR TECHNIQUE.',
    closingLine: 'LAB NOTES DROP IN YOUR LOUNGE LIBRARY. KEEP EXPERIMENTING.',
    environment: 'STUDIO WORKBENCH · MACRO CAM · MANNEQUIN HERO',
    membershipTier: 'PREMIUM + BLACK',
    publishingFrequency: 'BI-WEEKLY · TUESDAYS',
    thumbnailStyle: 'SPLIT SCREEN BEFORE/AFTER · LAB COAT BADGE',
    music: 'MINIMAL TECH PULSE · LOW DRONE',
    transitions: 'MATCH CUT · MACRO PUSH · RESULT REVEAL',
    voiceStyle: 'PRECISE · STEP-BY-STEP · ENCOURAGING',
    promptTemplate: 'slay-lab-experiment-v1',
    cta: 'TRY IN BUILD-A-WIG · SHOP LAB TOOLS',
    rewardIntegration: 'BONUS POINTS FOR COMPLETED LAB EPISODES',
    brandColors: '#EB1C24 · #1A1A1A · #9A9A9A',
    thumbnailSrc: THUMBS[1],
    accentHex: '#C41E3A',
  },
  {
    id: 'psa-analyzes',
    name: 'PSA ANALYZES',
    description: 'FOUNDER PSA BREAKS DOWN LOOKS, UNITS, AND MEMBER QUESTIONS WITH AI INSIGHT.',
    host: 'PSA · FOUNDER HOLOGRAM',
    openingLine: 'PSA HERE — LET US ANALYZE YOUR BEST LOOK AND BUILD YOUR NEXT MOVE.',
    closingLine: 'TRUST OVER SALES. YOU ARE ALWAYS IN CONTROL.',
    environment: 'HOLOGRAM STAGE · CONCIERGE SUITE · SOFT MARBLE GLOW',
    membershipTier: 'PREMIUM MEMBERS',
    publishingFrequency: 'WEEKLY · ON DEMAND BATCH',
    thumbnailStyle: 'HOLOGRAM FRAME · PSA AVATAR · QUESTION CAPTION',
    music: 'AMBIENT CONCIERGE PAD · SUBTLE SPARKLE',
    transitions: 'HOLOGRAM FADE · PSA REPLY CARD',
    voiceStyle: 'CONCIERGE · HAIR BESTIE · EDUCATOR',
    promptTemplate: 'psa-analyzes-session-v3',
    cta: 'ASK PSA · BOOK CONSULT',
    rewardIntegration: 'PRIORITY PSA QUEUE FOR BLACK TIER',
    brandColors: '#EB1C24 · #FFFFFF · #808080',
    thumbnailSrc: THUMBS[2],
    accentHex: '#EB1C24',
  },
  {
    id: 'build-studio',
    name: 'BUILD STUDIO',
    description: 'BUILD-A-WIG DEEP DIVES — CUSTOMIZE UNITS, PREVIEW LOOKS, CONFIRM YOUR BUILD.',
    host: 'BUILD-A-WIG ACADEMY',
    openingLine: 'WELCOME TO BUILD STUDIO — LET US WALK YOUR CUSTOM UNIT FROM SWATCH TO SLAY.',
    closingLine: 'SAVE YOUR BUILD. WE WILL SEE IT IN THE LOUNGE.',
    environment: 'NOIR BRICK STAGE · 3-ANGLE MANNEQUIN · LIVE PREVIEW',
    membershipTier: 'ALL MEMBERS · PREMIUM OPTIONS GATED',
    publishingFrequency: 'WEEKLY · THURSDAYS',
    thumbnailStyle: 'TRIPLE THUMB ROW · UNIT NAME · COLOR SWATCH',
    music: 'BUILD STUDIO THEME · CONFIDENT STRIDE',
    transitions: 'SWATCH MORPH · ANGLE CUT · CONFIRM FLASH',
    voiceStyle: 'PRODUCT EDUCATOR · CLEAR OPTIONS',
    promptTemplate: 'build-studio-unit-walkthrough',
    cta: 'OPEN BUILD-A-WIG · ADD TO BAG',
    rewardIntegration: 'COMPLETED BUILD BADGE · SLAY BOARD SAVE',
    brandColors: '#EB1C24 · #4A4A4A · #FFFFFF',
    thumbnailSrc: THUMBS[3],
    accentHex: '#8B0000',
  },
  {
    id: 'the-vault',
    name: 'THE VAULT',
    description: 'ARCHIVED MASTERCLASSES, FOUNDER SESSIONS, AND RARE INSTALL FOOTAGE.',
    host: 'FRONTAL SLAYER ARCHIVE',
    openingLine: 'THE VAULT IS OPEN — RARE EDUCATION YOU WILL NOT FIND ANYWHERE ELSE.',
    closingLine: 'LOCK IT IN YOUR LIBRARY BEFORE IT ROTATES.',
    environment: 'DARK THEATER · VAULT DOOR MOTIF · FILM GRAIN',
    membershipTier: 'BLACK + PREMIUM',
    publishingFrequency: 'MONTHLY CURATED DROP',
    thumbnailStyle: 'VAULT SEAL · LIMITED TIME BADGE · FILM FRAME',
    music: 'CINEMATIC OPEN · VAULT DOOR CREAK',
    transitions: 'FILM BURN · CHAPTER MARKERS',
    voiceStyle: 'CINEMATIC · PREMIUM · EXCLUSIVE',
    promptTemplate: 'vault-archive-intro',
    cta: 'UNLOCK WITH SLAY TICKETS',
    rewardIntegration: 'VAULT COMPLETION REWARDS · ANNIVERSARY ACCESS',
    brandColors: '#000000 · #EB1C24 · #D4AF37',
    thumbnailSrc: THUMBS[0],
    accentHex: '#1A1A1A',
  },
  {
    id: 'slay-academy',
    name: 'SLAY ACADEMY',
    description: 'STRUCTURED LESSON SERIES — LACE, INSTALL, CARE, STYLING, COLOR.',
    host: 'SLAY ACADEMY FACULTY',
    openingLine: 'CLASS IS IN SESSION — YOUR NEXT SKILL STARTS NOW.',
    closingLine: 'COMPLETE THE LESSON. EARN YOUR SLAY CREDIT.',
    environment: 'CLASSROOM SET · CHALKBOARD LOWER THIRD · LESSON PROGRESS',
    membershipTier: 'ALL MEMBERS',
    publishingFrequency: 'WEEKLY LESSON DROP',
    thumbnailStyle: 'LESSON NUMBER · DIFFICULTY BADGE · WATCH + READ',
    music: 'ACADEMY THEME · SOFT PIANO HIT',
    transitions: 'CHAPTER SLATE · QUIZ CARD',
    voiceStyle: 'TEACHER · PATIENT · CLEAR',
    promptTemplate: 'slay-academy-lesson-pack',
    cta: 'WATCH EPISODE · READ GUIDE',
    rewardIntegration: 'SLAY CHALLENGE · COURSE COMPLETION GIFT',
    brandColors: '#EB1C24 · #FFFFFF · #808080',
    thumbnailSrc: THUMBS[1],
    accentHex: '#EB1C24',
  },
  {
    id: 'campaigns',
    name: 'CAMPAIGNS',
    description: 'BRAND FILMS, SEASONAL STORIES, AND PRODUCT LAUNCH CINEMATICS.',
    host: 'FRONTAL SLAYER BRAND STUDIO',
    openingLine: 'THIS IS FRONTAL SLAYER — BUILT FOR WOMEN WHO SLAY WITHOUT COMPROMISE.',
    closingLine: 'SHOP THE CAMPAIGN. WEAR THE STORY.',
    environment: 'ON-LOCATION · STUDIO CYC · RUNWAY ENERGY',
    membershipTier: 'PUBLIC + MEMBERS',
    publishingFrequency: 'SEASONAL + LAUNCH EVENTS',
    thumbnailStyle: 'CINEMATIC WIDE · CAMPAIGN LOGO LOCKUP',
    music: 'CAMPAIGN SCORE · BRAND ANTHEM',
    transitions: 'HERO REVEAL · LOGO END CARD',
    voiceStyle: 'BRAND VOICE · ASPIRATIONAL · BOLD',
    promptTemplate: 'campaign-brand-film-v2',
    cta: 'SHOP THE LOOK · JOIN THE LOUNGE',
    rewardIntegration: 'CAMPAIGN BUNDLE OFFERS · EARLY ACCESS',
    brandColors: '#EB1C24 · #FFFFFF · #000000',
    thumbnailSrc: THUMBS[2],
    accentHex: '#EB1C24',
  },
  {
    id: 'the-lounge',
    name: 'THE LOUNGE',
    description: 'MEMBERS LOUNGE TV PROGRAMMING — FEATURED, LEARN, EXPLORE, LIVE.',
    host: 'LOUNGE TV',
    openingLine: 'YOU ARE IN THE LOUNGE — PRESS PLAY ON YOUR NEXT OBSESSION.',
    closingLine: 'SAVE IT. SHARE IT. SLAY IT.',
    environment: 'LOUNGE THEATER · BLACK TV PANEL · CURTAINS',
    membershipTier: 'PREMIUM LOUNGE ACCESS',
    publishingFrequency: 'WEEKLY CONTENT PACK SYNC',
    thumbnailStyle: 'STREAMING ROW · WATCH/READ/BOTH BADGE',
    music: 'LOUNGE TV POWER ON · STATIC BED',
    transitions: 'TV POWER ON · ROW SCROLL',
    voiceStyle: 'STREAMING HOST · PREMIUM · EDITORIAL',
    promptTemplate: 'lounge-tv-weekly-pack',
    cta: 'OPEN LOUNGE TV · SAVE TO LIBRARY',
    rewardIntegration: 'SLAY TICKETS · FREE PREVIEW EPISODES',
    brandColors: '#000000 · #EB1C24 · #9A9A9A',
    thumbnailSrc: THUMBS[3],
    accentHex: '#0A0A0A',
  },
];

export function getAdminStudioShowById(id: string): AdminStudioShow | undefined {
  return ADMIN_STUDIO_DEFAULT_SHOWS.find((s) => s.id === id);
}
