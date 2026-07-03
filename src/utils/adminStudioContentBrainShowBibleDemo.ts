/** Show Bible — per-show production profiles for Content Brain. */

export type ContentBrainShowBibleEntry = {
  id: string;
  name: string;
  purpose: string;
  host: string;
  openingLine: string;
  closingLine: string;
  studioEnvironment: string;
  visualStyle: string;
  cameraStyle: string;
  lighting: string;
  transitions: string;
  graphics: string;
  music: string;
  episodeStructure: string;
  recurringSegments: string;
  ctaStyle: string;
  rewardStyle: string;
  publishingSchedule: string;
  membershipTier: string;
  thumbnailRules: string;
  journalRules: string;
  socialRules: string;
  accentHex: string;
};

export type ContentBrainShowBibleFieldKey = keyof Omit<ContentBrainShowBibleEntry, 'id' | 'accentHex'>;

export const CONTENT_BRAIN_SHOW_BIBLE_FIELD_GROUPS: Array<{
  title: string;
  keys: ContentBrainShowBibleFieldKey[];
}> = [
  {
    title: 'IDENTITY',
    keys: ['name', 'purpose', 'host', 'openingLine', 'closingLine'],
  },
  {
    title: 'PRODUCTION',
    keys: [
      'studioEnvironment',
      'visualStyle',
      'cameraStyle',
      'lighting',
      'transitions',
      'graphics',
      'music',
    ],
  },
  {
    title: 'STRUCTURE',
    keys: ['episodeStructure', 'recurringSegments', 'publishingSchedule', 'membershipTier'],
  },
  {
    title: 'GROWTH & CHANNELS',
    keys: ['ctaStyle', 'rewardStyle', 'thumbnailRules', 'journalRules', 'socialRules'],
  },
];

export const CONTENT_BRAIN_SHOW_BIBLE_FIELD_LABELS: Record<ContentBrainShowBibleFieldKey, string> = {
  name: 'NAME',
  purpose: 'PURPOSE',
  host: 'HOST',
  openingLine: 'OPENING LINE',
  closingLine: 'CLOSING LINE',
  studioEnvironment: 'STUDIO ENVIRONMENT',
  visualStyle: 'VISUAL STYLE',
  cameraStyle: 'CAMERA STYLE',
  lighting: 'LIGHTING',
  transitions: 'TRANSITIONS',
  graphics: 'GRAPHICS',
  music: 'MUSIC',
  episodeStructure: 'EPISODE STRUCTURE',
  recurringSegments: 'RECURRING SEGMENTS',
  ctaStyle: 'CTA STYLE',
  rewardStyle: 'REWARD STYLE',
  publishingSchedule: 'PUBLISHING SCHEDULE',
  membershipTier: 'MEMBERSHIP TIER',
  thumbnailRules: 'THUMBNAIL RULES',
  journalRules: 'JOURNAL RULES',
  socialRules: 'SOCIAL RULES',
};

export const ADMIN_STUDIO_SHOW_BIBLE_DEFAULTS: ContentBrainShowBibleEntry[] = [
  {
    id: 'the-slay-report',
    name: 'THE SLAY REPORT',
    purpose: 'WEEKLY NEWSROOM — TRENDS, DROPS, MEMBER WINS, FRIDAY PREMIERE TEASE.',
    host: 'KATEENA ARMSTRONG',
    openingLine: 'WELCOME BACK TO THE SLAY REPORT — YOUR WEEKLY FRONTAL SLAYER BRIEFING.',
    closingLine: 'STAY SLAYED. WE WILL SEE YOU FRIDAY AT 7PM.',
    studioEnvironment: 'NEWSROOM DESK · MARBLE BACKDROP · RED ACCENT LIGHTING',
    visualStyle: 'BOLD RED LOWER THIRDS · HANDWRITTEN EPISODE TITLES · NEWSROOM ENERGY',
    cameraStyle: 'HOST MEDIUM · B-ROLL CUTAWAYS · TREND GRAPHICS INSERTS',
    lighting: 'SOFT KEY · RED RIM · MARBLE REFLECT',
    transitions: 'QUICK CUT · RED WIPE · RECAP LOWER THIRD',
    graphics: 'TREND RADAR CARD · MEMBER SPOTLIGHT FRAME · FRIDAY COUNTDOWN',
    music: 'SLAY REPORT INTRO STING · 8 BAR BED · FADE UNDER VO',
    episodeStructure: 'COLD OPEN → TREND RADAR → MEMBER SPOTLIGHT → WHAT TO WATCH → CLOSE + CTA',
    recurringSegments: 'TREND RADAR · MEMBER WIN · FRIDAY PREVIEW',
    ctaStyle: 'WATCH IN THE LOUNGE · SAVE TO SLAY BOARD',
    rewardStyle: 'SLAY CHALLENGE CHECK-IN · MEMBER SHOUTOUT',
    publishingSchedule: 'WEEKLY · FRIDAYS · 7PM ET',
    membershipTier: 'ALL MEMBERS',
    thumbnailRules: 'RED LOWER THIRD · HANDWRITTEN TITLE · EPISODE BADGE',
    journalRules: 'EXPAND TREND SEGMENTS · LINK TO PRODUCTS · SEO KEYWORDS',
    socialRules: '15 SEC HOOK CLIPS · TREND CAROUSEL · FRIDAY COUNTDOWN STORIES',
    accentHex: '#EB1C24',
  },
  {
    id: 'slay-lab',
    name: 'SLAY LAB',
    purpose: 'HANDS-ON EXPERIMENTS — LACE, COLOR, INSTALL TECHNIQUE, TOOL TESTS.',
    host: 'FRONTAL SLAYER EDUCATION TEAM',
    openingLine: 'SLAY LAB IS LIVE — TODAY WE TEST, MEASURE, AND PERFECT YOUR TECHNIQUE.',
    closingLine: 'LAB NOTES DROP IN YOUR LOUNGE LIBRARY. KEEP EXPERIMENTING.',
    studioEnvironment: 'STUDIO WORKBENCH · MACRO CAM · MANNEQUIN HERO',
    visualStyle: 'SPLIT BEFORE/AFTER · LAB COAT BADGE · MACRO DETAIL',
    cameraStyle: 'MACRO HERO · OVERHEAD PROCEDURE · RESULT REVEAL',
    lighting: 'BRIGHT KEY FOR MACRO · NEUTRAL FILL',
    transitions: 'MATCH CUT · MACRO PUSH · RESULT REVEAL',
    graphics: 'HYPOTHESIS CARD · TOOL LIST · STEP COUNTER',
    music: 'MINIMAL TECH PULSE · LOW DRONE',
    episodeStructure: 'HYPOTHESIS → TOOLS → PROCEDURE → RESULT → LAB NOTES CTA',
    recurringSegments: 'TOOL ON DECK · STEP-BY-STEP · HONEST RESULT',
    ctaStyle: 'TRY IN BUILD-A-WIG · SHOP LAB TOOLS',
    rewardStyle: 'BONUS POINTS FOR COMPLETED LAB EPISODES',
    publishingSchedule: 'BI-WEEKLY · TUESDAYS',
    membershipTier: 'PREMIUM + BLACK',
    thumbnailRules: 'SPLIT SCREEN BEFORE/AFTER · LAB BADGE',
    journalRules: 'NUMBERED PROCEDURE · PRODUCT LINKS · SAFETY NOTES',
    socialRules: 'MACRO CLIPS · BEFORE/AFTER REELS · TOOL TAGS',
    accentHex: '#C41E3A',
  },
  {
    id: 'psa-analyzes',
    name: 'PSA ANALYZES',
    purpose: 'FOUNDER PSA BREAKS DOWN LOOKS, UNITS, AND MEMBER QUESTIONS.',
    host: 'PSA · FOUNDER HOLOGRAM',
    openingLine: 'PSA HERE — LET US ANALYZE YOUR BEST LOOK AND BUILD YOUR NEXT MOVE.',
    closingLine: 'TRUST OVER SALES. YOU ARE ALWAYS IN CONTROL.',
    studioEnvironment: 'HOLOGRAM STAGE · CONCIERGE SUITE · SOFT MARBLE GLOW',
    visualStyle: 'HOLOGRAM FRAME · PSA AVATAR · QUESTION CAPTION',
    cameraStyle: 'HOLOGRAM LOCK · REPLY CARD INSERTS',
    lighting: 'SOFT MARBLE GLOW · HOLOGRAM RIM',
    transitions: 'HOLOGRAM FADE · PSA REPLY CARD',
    graphics: 'UNIT RECOMMENDATION CARD · COMPARISON GRID',
    music: 'AMBIENT CONCIERGE PAD · SUBTLE SPARKLE',
    episodeStructure: 'GREETING → QUESTION → ANALYSIS → UNIT REC → CLOSE',
    recurringSegments: 'ASK PSA · UNIT BREAKDOWN · BEST LOOK RANKING',
    ctaStyle: 'ASK PSA · BOOK CONSULT',
    rewardStyle: 'PRIORITY PSA QUEUE FOR BLACK TIER',
    publishingSchedule: 'WEEKLY · ON DEMAND BATCH',
    membershipTier: 'PREMIUM MEMBERS',
    thumbnailRules: 'HOLOGRAM FRAME · QUESTION CAPTION',
    journalRules: 'EXPAND UNIT SPECS · CARE TIPS · FAQ FORMAT',
    socialRules: 'Q&A CLIPS · UNIT SPOTLIGHT CAROUSELS',
    accentHex: '#EB1C24',
  },
  {
    id: 'build-studio',
    name: 'BUILD STUDIO',
    purpose: 'BUILD-A-WIG DEEP DIVES — CUSTOMIZE UNITS, PREVIEW LOOKS, CONFIRM BUILD.',
    host: 'BUILD-A-WIG ACADEMY',
    openingLine: 'WELCOME TO BUILD STUDIO — LET US WALK YOUR CUSTOM UNIT FROM SWATCH TO SLAY.',
    closingLine: 'SAVE YOUR BUILD. WE WILL SEE IT IN THE LOUNGE.',
    studioEnvironment: 'NOIR BRICK STAGE · 3-ANGLE MANNEQUIN · LIVE PREVIEW',
    visualStyle: 'TRIPLE THUMB ROW · SWATCH MORPH · UNIT NAME LOCKUP',
    cameraStyle: '3-ANGLE MANNEQUIN · SWATCH MACRO · CONFIRM FLASH',
    lighting: 'BRICK STAGE KEY · EVEN MANNEQUIN FILL',
    transitions: 'SWATCH MORPH · ANGLE CUT · CONFIRM FLASH',
    graphics: 'OPTION PANEL · PRICE BREAKDOWN · BUILD SUMMARY',
    music: 'BUILD STUDIO THEME · CONFIDENT STRIDE',
    episodeStructure: 'INTRO UNIT → OPTIONS WALKTHROUGH → LIVE PREVIEW → CONFIRM CTA',
    recurringSegments: 'SWATCH SELECT · OPTION GATE · LIVE PREVIEW',
    ctaStyle: 'OPEN BUILD-A-WIG · ADD TO BAG',
    rewardStyle: 'COMPLETED BUILD BADGE · SLAY BOARD SAVE',
    publishingSchedule: 'WEEKLY · THURSDAYS',
    membershipTier: 'ALL MEMBERS · PREMIUM OPTIONS GATED',
    thumbnailRules: 'TRIPLE THUMB · COLOR SWATCH · UNIT NAME',
    journalRules: 'OPTION EXPLAINERS · PREMIUM GATE NOTES · CARE',
    socialRules: 'SWATCH REELS · BUILD TIMELAPSE · BEFORE/AFTER',
    accentHex: '#8B0000',
  },
  {
    id: 'the-vault',
    name: 'THE VAULT',
    purpose: 'ARCHIVED MASTERCLASSES, FOUNDER SESSIONS, RARE INSTALL FOOTAGE.',
    host: 'FRONTAL SLAYER ARCHIVE',
    openingLine: 'THE VAULT IS OPEN — RARE EDUCATION YOU WILL NOT FIND ANYWHERE ELSE.',
    closingLine: 'LOCK IT IN YOUR LIBRARY BEFORE IT ROTATES.',
    studioEnvironment: 'THEATER SET · VAULT DOOR MOTIF · FILM GRAIN',
    visualStyle: 'VAULT SEAL · LIMITED BADGE · CINEMATIC FRAME',
    cameraStyle: 'CINEMATIC WIDE · CHAPTER MARKERS',
    lighting: 'LOW KEY · SPOT HERO · FILM GRAIN',
    transitions: 'FILM BURN · CHAPTER MARKERS',
    graphics: 'VAULT SEAL · LIMITED TIME BADGE · CHAPTER SLATE',
    music: 'CINEMATIC OPEN · VAULT DOOR CREAK',
    episodeStructure: 'VAULT OPEN → CHAPTER 1–N → EXCLUSIVE CTA',
    recurringSegments: 'FOUNDER SESSION · RARE FOOTAGE · ROTATION NOTICE',
    ctaStyle: 'UNLOCK WITH SLAY TICKETS',
    rewardStyle: 'VAULT COMPLETION REWARDS · ANNIVERSARY ACCESS',
    publishingSchedule: 'MONTHLY CURATED DROP',
    membershipTier: 'BLACK + PREMIUM',
    thumbnailRules: 'VAULT SEAL · LIMITED TIME BADGE',
    journalRules: 'CHAPTER SUMMARIES · TIMESTAMP LINKS · EXCLUSIVE NOTES',
    socialRules: 'TEASER CLIPS ONLY · NO FULL SPOILERS · VAULT BADGE',
    accentHex: '#1A1A1A',
  },
  {
    id: 'slay-academy',
    name: 'SLAY ACADEMY',
    purpose: 'STRUCTURED LESSON SERIES — LACE, INSTALL, CARE, STYLING, COLOR.',
    host: 'SLAY ACADEMY FACULTY',
    openingLine: 'CLASS IS IN SESSION — YOUR NEXT SKILL STARTS NOW.',
    closingLine: 'COMPLETE THE LESSON. EARN YOUR SLAY CREDIT.',
    studioEnvironment: 'CLASSROOM SET · CHALKBOARD LOWER THIRD · PROGRESS BAR',
    visualStyle: 'LESSON NUMBER · DIFFICULTY BADGE · WATCH + READ',
    cameraStyle: 'INSTRUCTOR MEDIUM · DEMO HANDS · QUIZ CARD',
    lighting: 'BRIGHT CLASSROOM · SOFT FILL',
    transitions: 'CHAPTER SLATE · QUIZ CARD',
    graphics: 'LESSON PROGRESS · QUIZ OVERLAY · CREDIT BADGE',
    music: 'ACADEMY THEME · SOFT PIANO HIT',
    episodeStructure: 'OBJECTIVE → LESSON → DEMO → QUIZ → CREDIT',
    recurringSegments: 'LEARNING OBJECTIVE · STEP DEMO · KNOWLEDGE CHECK',
    ctaStyle: 'WATCH EPISODE · READ GUIDE',
    rewardStyle: 'SLAY CHALLENGE · COURSE COMPLETION GIFT',
    publishingSchedule: 'WEEKLY LESSON DROP',
    membershipTier: 'ALL MEMBERS',
    thumbnailRules: 'LESSON NUMBER · DIFFICULTY BADGE',
    journalRules: 'FULL TRANSCRIPT STYLE · CHECKLIST · PRODUCT LINKS',
    socialRules: 'TIP CLIPS · QUIZ STORIES · LESSON CAROUSEL',
    accentHex: '#EB1C24',
  },
  {
    id: 'campaigns',
    name: 'CAMPAIGNS',
    purpose: 'BRAND FILMS, SEASONAL STORIES, AND PRODUCT LAUNCH CINEMATICS.',
    host: 'FRONTAL SLAYER BRAND STUDIO',
    openingLine: 'THIS IS FRONTAL SLAYER — BUILT FOR WOMEN WHO SLAY WITHOUT COMPROMISE.',
    closingLine: 'SHOP THE CAMPAIGN. WEAR THE STORY.',
    studioEnvironment: 'ON-LOCATION · STUDIO CYC · RUNWAY ENERGY',
    visualStyle: 'CINEMATIC WIDE · CAMPAIGN LOGO LOCKUP',
    cameraStyle: 'HERO WIDE · RUNWAY TRACK · PRODUCT BEAUTY',
    lighting: 'DRAMATIC KEY · BRAND RED ACCENT',
    transitions: 'HERO REVEAL · LOGO END CARD',
    graphics: 'CAMPAIGN LOGO · SHOP THE LOOK TAGS',
    music: 'CAMPAIGN SCORE · BRAND ANTHEM',
    episodeStructure: 'MANIFESTO → HERO LOOK → STORY BEATS → SHOP CTA',
    recurringSegments: 'BRAND MANIFESTO · HERO REVEAL · SHOP THE LOOK',
    ctaStyle: 'SHOP THE LOOK · JOIN THE LOUNGE',
    rewardStyle: 'CAMPAIGN BUNDLE OFFERS · EARLY ACCESS',
    publishingSchedule: 'SEASONAL + LAUNCH EVENTS',
    membershipTier: 'PUBLIC + MEMBERS',
    thumbnailRules: 'CINEMATIC WIDE · LOGO LOCKUP',
    journalRules: 'CAMPAIGN STORY · LOOK BREAKDOWN · SHOP LINKS',
    socialRules: 'HERO REELS · CAROUSEL LOOKBOOK · LAUNCH COUNTDOWN',
    accentHex: '#EB1C24',
  },
  {
    id: 'the-lounge',
    name: 'THE LOUNGE',
    purpose: 'MEMBERS LOUNGE TV — FEATURED, LEARN, EXPLORE, LIVE PROGRAMMING.',
    host: 'LOUNGE TV',
    openingLine: 'YOU ARE IN THE LOUNGE — PRESS PLAY ON YOUR NEXT OBSESSION.',
    closingLine: 'SAVE IT. SHARE IT. SLAY IT.',
    studioEnvironment: 'LOUNGE THEATER · TV PANEL · CURTAINS',
    visualStyle: 'STREAMING ROW · WATCH/READ/BOTH BADGE',
    cameraStyle: 'ROW SCROLL · EPISODE HERO · ARTICLE SPLIT',
    lighting: 'THEATER AMBIENT · TV PANEL GLOW',
    transitions: 'TV POWER ON · ROW SCROLL',
    graphics: 'CONTENT PACK BADGE · TICKET COUNTER · NEW BLUR',
    music: 'LOUNGE TV POWER ON · STATIC BED',
    episodeStructure: 'FEATURED ROW → LEARN HUB → EXPLORE → LIVE PLACEHOLDER',
    recurringSegments: 'WEEKLY PACK · CONTINUE WATCHING · LIBRARY',
    ctaStyle: 'OPEN LOUNGE TV · SAVE TO LIBRARY',
    rewardStyle: 'SLAY TICKETS · FREE PREVIEW EPISODES',
    publishingSchedule: 'WEEKLY CONTENT PACK SYNC',
    membershipTier: 'PREMIUM LOUNGE ACCESS',
    thumbnailRules: 'STREAMING ROW STYLE · WATCH/READ/BOTH',
    journalRules: 'ARTICLE + CHECKLIST + TRANSCRIPT SYNC',
    socialRules: 'PACK TEASER · EPISODE CLIPS · LIBRARY REMINDERS',
    accentHex: '#EB1C24',
  },
];

export function getShowBibleById(id: string): ContentBrainShowBibleEntry | undefined {
  return ADMIN_STUDIO_SHOW_BIBLE_DEFAULTS.find((s) => s.id === id);
}
