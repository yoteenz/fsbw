/** SHOW BIBLE — master production handbook per recurring series (CMS-ready). */

export const ADMIN_STUDIO_SHOW_BIBLE_SUBTITLE =
  'THE DNA OF EVERY FRONTAL SLAYER SHOW — NETFLIX HANDBOOK × LUXURY NETWORK STYLE GUIDE.';

export type ShowBibleTabId =
  | 'profile'
  | 'personality'
  | 'visual'
  | 'audio'
  | 'structure'
  | 'segments'
  | 'rules'
  | 'prompts'
  | 'thumbnail'
  | 'ctas'
  | 'seasons'
  | 'checklist'
  | 'analytics';

export const SHOW_BIBLE_TABS: Array<{ id: ShowBibleTabId; label: string }> = [
  { id: 'profile', label: 'PROFILE' },
  { id: 'personality', label: 'PERSONALITY' },
  { id: 'visual', label: 'VISUAL' },
  { id: 'audio', label: 'AUDIO' },
  { id: 'structure', label: 'STRUCTURE' },
  { id: 'segments', label: 'SEGMENTS' },
  { id: 'rules', label: 'RULES' },
  { id: 'prompts', label: 'PROMPTS' },
  { id: 'thumbnail', label: 'THUMBNAIL' },
  { id: 'ctas', label: 'CTAS' },
  { id: 'seasons', label: 'SEASONS' },
  { id: 'checklist', label: 'CHECKLIST' },
  { id: 'analytics', label: 'ANALYTICS' },
];

export type ShowBibleSeasonStatus = 'draft' | 'in-production' | 'scheduled' | 'released' | 'archived';

export type ShowBibleSeason = {
  id: string;
  seasonNumber: string;
  episodeNumber: string;
  episodeOrder: string;
  premiereDate: string;
  finaleDate: string;
  status: ShowBibleSeasonStatus;
  title: string;
};

export type ShowBibleEntry = {
  id: string;
  accentHex: string;
  thumbnailSrc: string;
  /** PROFILE */
  showName: string;
  description: string;
  purpose: string;
  audience: string;
  membershipTier: string;
  host: string;
  supportingCharacters: string;
  publishingFrequency: string;
  seasonNumber: string;
  episodeCount: string;
  episodeLength: string;
  readingTime: string;
  difficulty: string;
  primaryCta: string;
  secondaryCta: string;
  rewardOpportunity: string;
  distributionTargets: string;
  /** PERSONALITY */
  overallTone: string;
  humorStyle: string;
  luxuryLevel: string;
  energyLevel: string;
  educationalStyle: string;
  storytellingStyle: string;
  conversationStyle: string;
  vocabulary: string;
  catchphrases: string;
  recurringExpressions: string;
  greeting: string;
  closing: string;
  dos: string;
  donts: string;
  /** VISUAL */
  studioEnvironment: string;
  background: string;
  lighting: string;
  cameraAngle: string;
  lensStyle: string;
  cameraMovement: string;
  composition: string;
  transitions: string;
  graphics: string;
  lowerThirdStyle: string;
  colorPalette: string;
  typography: string;
  motionGraphics: string;
  thumbnailStyle: string;
  animationStyle: string;
  aspectRatios: string;
  /** AUDIO */
  themeMusic: string;
  introMusic: string;
  outroMusic: string;
  ambientAudio: string;
  voiceStyle: string;
  narrationStyle: string;
  speakingSpeed: string;
  audioEnergy: string;
  pauses: string;
  soundEffects: string;
  /** STRUCTURE */
  episodeStructureSteps: string;
  /** SEGMENTS */
  recurringSegmentsList: string;
  /** CONTENT RULES */
  minEpisodeLength: string;
  maxEpisodeLength: string;
  rulesReadingTime: string;
  imageCount: string;
  videoCount: string;
  requiredAssets: string;
  requiredCtas: string;
  requiredProductMentions: string;
  requiredMembershipMentions: string;
  requiredRewards: string;
  /** PROMPT TEMPLATES */
  promptVideo: string;
  promptImage: string;
  promptThumbnail: string;
  promptJournal: string;
  promptEmail: string;
  promptCarousel: string;
  promptReel: string;
  promptTiktok: string;
  promptPinterest: string;
  promptPush: string;
  promptVoiceover: string;
  promptTranscript: string;
  /** THUMBNAIL SYSTEM */
  thumbnailComposition: string;
  thumbnailTypography: string;
  thumbnailBrandElements: string;
  thumbnailLighting: string;
  thumbnailFraming: string;
  thumbnailImageStyle: string;
  thumbnailBadges: string;
  thumbnailPremiumLabels: string;
  /** CTA SYSTEM */
  ctaWatchEpisode: string;
  ctaReadJournal: string;
  ctaBuildAWig: string;
  ctaHairAnalysis: string;
  ctaMembership: string;
  ctaRewards: string;
  ctaLoungeTv: string;
  ctaShopLook: string;
  /** ANALYTICS (demo) */
  analyticsViews: string;
  analyticsCompletion: string;
  analyticsWatchTime: string;
  analyticsCtr: string;
  analyticsJournalReads: string;
  analyticsEmailOpens: string;
  analyticsMembershipConv: string;
  analyticsRevenue: string;
  analyticsProducts: string;
  analyticsTopEpisode: string;
  analyticsBestCta: string;
  /** SEASONS */
  seasons: ShowBibleSeason[];
  /** CHECKLIST */
  checklistApproved: string;
};

export type ShowBibleFieldKey = keyof Omit<ShowBibleEntry, 'id' | 'accentHex' | 'thumbnailSrc' | 'seasons'>;

export type ShowBibleFieldDef = { key: ShowBibleFieldKey; label: string; multiline?: boolean };

export type ShowBibleFieldGroup = { title: string; fields: ShowBibleFieldDef[] };

export const SHOW_BIBLE_PROFILE_GROUPS: ShowBibleFieldGroup[] = [
  {
    title: 'IDENTITY',
    fields: [
      { key: 'showName', label: 'SHOW NAME' },
      { key: 'description', label: 'DESCRIPTION', multiline: true },
      { key: 'purpose', label: 'PURPOSE', multiline: true },
      { key: 'audience', label: 'AUDIENCE', multiline: true },
    ],
  },
  {
    title: 'PRODUCTION',
    fields: [
      { key: 'host', label: 'HOST' },
      { key: 'supportingCharacters', label: 'SUPPORTING CHARACTERS', multiline: true },
      { key: 'membershipTier', label: 'MEMBERSHIP TIER' },
      { key: 'publishingFrequency', label: 'PUBLISHING FREQUENCY' },
      { key: 'seasonNumber', label: 'SEASON NUMBER' },
      { key: 'episodeCount', label: 'EPISODE COUNT' },
      { key: 'episodeLength', label: 'EPISODE LENGTH' },
      { key: 'readingTime', label: 'READING TIME' },
      { key: 'difficulty', label: 'DIFFICULTY' },
    ],
  },
  {
    title: 'GROWTH',
    fields: [
      { key: 'primaryCta', label: 'PRIMARY CTA' },
      { key: 'secondaryCta', label: 'SECONDARY CTA' },
      { key: 'rewardOpportunity', label: 'REWARD OPPORTUNITY', multiline: true },
      { key: 'distributionTargets', label: 'DISTRIBUTION TARGETS', multiline: true },
    ],
  },
];

export const SHOW_BIBLE_PERSONALITY_GROUPS: ShowBibleFieldGroup[] = [
  {
    title: 'VOICE',
    fields: [
      { key: 'overallTone', label: 'OVERALL TONE', multiline: true },
      { key: 'humorStyle', label: 'HUMOR STYLE', multiline: true },
      { key: 'luxuryLevel', label: 'LUXURY LEVEL' },
      { key: 'energyLevel', label: 'ENERGY LEVEL' },
      { key: 'educationalStyle', label: 'EDUCATIONAL STYLE', multiline: true },
      { key: 'storytellingStyle', label: 'STORYTELLING STYLE', multiline: true },
      { key: 'conversationStyle', label: 'CONVERSATION STYLE', multiline: true },
      { key: 'vocabulary', label: 'VOCABULARY', multiline: true },
    ],
  },
  {
    title: 'SIGNATURE',
    fields: [
      { key: 'catchphrases', label: 'CATCHPHRASES', multiline: true },
      { key: 'recurringExpressions', label: 'RECURRING EXPRESSIONS', multiline: true },
      { key: 'greeting', label: 'GREETING', multiline: true },
      { key: 'closing', label: 'CLOSING', multiline: true },
    ],
  },
  {
    title: 'GUARDRAILS',
    fields: [
      { key: 'dos', label: "DO'S", multiline: true },
      { key: 'donts', label: "DON'TS", multiline: true },
    ],
  },
];

export const SHOW_BIBLE_VISUAL_GROUPS: ShowBibleFieldGroup[] = [
  {
    title: 'ENVIRONMENT',
    fields: [
      { key: 'studioEnvironment', label: 'STUDIO ENVIRONMENT', multiline: true },
      { key: 'background', label: 'BACKGROUND', multiline: true },
      { key: 'lighting', label: 'LIGHTING', multiline: true },
    ],
  },
  {
    title: 'CAMERA',
    fields: [
      { key: 'cameraAngle', label: 'CAMERA ANGLE' },
      { key: 'lensStyle', label: 'LENS STYLE' },
      { key: 'cameraMovement', label: 'CAMERA MOVEMENT' },
      { key: 'composition', label: 'COMPOSITION', multiline: true },
    ],
  },
  {
    title: 'GRAPHICS',
    fields: [
      { key: 'transitions', label: 'TRANSITIONS', multiline: true },
      { key: 'graphics', label: 'GRAPHICS', multiline: true },
      { key: 'lowerThirdStyle', label: 'LOWER THIRD STYLE' },
      { key: 'colorPalette', label: 'COLOR PALETTE' },
      { key: 'typography', label: 'TYPOGRAPHY' },
      { key: 'motionGraphics', label: 'MOTION GRAPHICS', multiline: true },
      { key: 'thumbnailStyle', label: 'THUMBNAIL STYLE' },
      { key: 'animationStyle', label: 'ANIMATION STYLE' },
      { key: 'aspectRatios', label: 'ASPECT RATIOS' },
    ],
  },
];

export const SHOW_BIBLE_AUDIO_GROUPS: ShowBibleFieldGroup[] = [
  {
    title: 'MUSIC',
    fields: [
      { key: 'themeMusic', label: 'THEME MUSIC', multiline: true },
      { key: 'introMusic', label: 'INTRO MUSIC', multiline: true },
      { key: 'outroMusic', label: 'OUTRO MUSIC', multiline: true },
      { key: 'ambientAudio', label: 'AMBIENT AUDIO', multiline: true },
    ],
  },
  {
    title: 'VOICE',
    fields: [
      { key: 'voiceStyle', label: 'VOICE STYLE', multiline: true },
      { key: 'narrationStyle', label: 'NARRATION STYLE', multiline: true },
      { key: 'speakingSpeed', label: 'SPEAKING SPEED' },
      { key: 'audioEnergy', label: 'ENERGY' },
      { key: 'pauses', label: 'PAUSES', multiline: true },
      { key: 'soundEffects', label: 'SOUND EFFECTS', multiline: true },
    ],
  },
];

export const SHOW_BIBLE_RULES_GROUPS: ShowBibleFieldGroup[] = [
  {
    title: 'LENGTH & ASSETS',
    fields: [
      { key: 'minEpisodeLength', label: 'MIN EPISODE LENGTH' },
      { key: 'maxEpisodeLength', label: 'MAX EPISODE LENGTH' },
      { key: 'rulesReadingTime', label: 'READING TIME' },
      { key: 'imageCount', label: 'IMAGE COUNT' },
      { key: 'videoCount', label: 'VIDEO COUNT' },
      { key: 'requiredAssets', label: 'REQUIRED ASSETS', multiline: true },
    ],
  },
  {
    title: 'REQUIREMENTS',
    fields: [
      { key: 'requiredCtas', label: 'REQUIRED CTAS', multiline: true },
      { key: 'requiredProductMentions', label: 'REQUIRED PRODUCT MENTIONS', multiline: true },
      { key: 'requiredMembershipMentions', label: 'REQUIRED MEMBERSHIP MENTIONS', multiline: true },
      { key: 'requiredRewards', label: 'REQUIRED REWARDS', multiline: true },
    ],
  },
];

export const SHOW_BIBLE_PROMPT_GROUPS: ShowBibleFieldGroup[] = [
  {
    title: 'VIDEO & IMAGE',
    fields: [
      { key: 'promptVideo', label: 'VIDEO', multiline: true },
      { key: 'promptImage', label: 'IMAGE', multiline: true },
      { key: 'promptThumbnail', label: 'THUMBNAIL', multiline: true },
      { key: 'promptVoiceover', label: 'VOICEOVER', multiline: true },
      { key: 'promptTranscript', label: 'TRANSCRIPT', multiline: true },
    ],
  },
  {
    title: 'WRITTEN & SOCIAL',
    fields: [
      { key: 'promptJournal', label: 'JOURNAL', multiline: true },
      { key: 'promptEmail', label: 'EMAIL', multiline: true },
      { key: 'promptCarousel', label: 'CAROUSEL', multiline: true },
      { key: 'promptReel', label: 'REEL', multiline: true },
      { key: 'promptTiktok', label: 'TIKTOK', multiline: true },
      { key: 'promptPinterest', label: 'PINTEREST', multiline: true },
      { key: 'promptPush', label: 'PUSH NOTIFICATION', multiline: true },
    ],
  },
];

export const SHOW_BIBLE_THUMBNAIL_GROUPS: ShowBibleFieldGroup[] = [
  {
    title: 'THUMBNAIL SYSTEM',
    fields: [
      { key: 'thumbnailComposition', label: 'COMPOSITION', multiline: true },
      { key: 'thumbnailTypography', label: 'TYPOGRAPHY PLACEMENT', multiline: true },
      { key: 'thumbnailBrandElements', label: 'BRAND ELEMENTS', multiline: true },
      { key: 'thumbnailLighting', label: 'LIGHTING' },
      { key: 'thumbnailFraming', label: 'FRAMING' },
      { key: 'thumbnailImageStyle', label: 'IMAGE STYLE', multiline: true },
      { key: 'thumbnailBadges', label: 'RECURRING BADGES', multiline: true },
      { key: 'thumbnailPremiumLabels', label: 'PREMIUM LABELS', multiline: true },
    ],
  },
];

export const SHOW_BIBLE_CTA_GROUPS: ShowBibleFieldGroup[] = [
  {
    title: 'SHOW CTAS',
    fields: [
      { key: 'ctaWatchEpisode', label: 'WATCH FULL EPISODE', multiline: true },
      { key: 'ctaReadJournal', label: 'READ JOURNAL', multiline: true },
      { key: 'ctaBuildAWig', label: 'OPEN BUILD-A-WIG', multiline: true },
      { key: 'ctaHairAnalysis', label: 'START HAIR ANALYSIS', multiline: true },
      { key: 'ctaMembership', label: 'UNLOCK MEMBERSHIP', multiline: true },
      { key: 'ctaRewards', label: 'VIEW REWARDS', multiline: true },
      { key: 'ctaLoungeTv', label: 'JOIN LOUNGE TV', multiline: true },
      { key: 'ctaShopLook', label: 'SHOP THIS LOOK', multiline: true },
    ],
  },
];

export const SHOW_BIBLE_STRUCTURE_STEPS_DEFAULT = `COLD OPEN
↓
INTRO
↓
MAIN SEGMENT
↓
SUPPORTING SEGMENT
↓
PSA TIP
↓
CTA
↓
REWARD
↓
OUTRO`;

export const SHOW_BIBLE_INHERITANCE_CHAIN = [
  'BRAND BRAIN',
  'CREATIVE DIRECTOR',
  'SHOW BIBLE',
  'CONTENT PACK',
  'AI ORCHESTRATOR',
  'AI PROVIDERS',
  'DRAFT',
  'PUBLISHING',
] as const;

export const SHOW_BIBLE_PRODUCTION_CHECKLIST_ITEMS = [
  { id: 'show', label: 'SHOW SELECTED' },
  { id: 'episode-type', label: 'EPISODE TYPE' },
  { id: 'cta', label: 'CTA SELECTED' },
  { id: 'products', label: 'PRODUCTS SELECTED' },
  { id: 'reward', label: 'REWARD SELECTED' },
  { id: 'thumbnail', label: 'THUMBNAIL READY' },
  { id: 'prompt', label: 'PROMPT READY' },
  { id: 'distribution', label: 'DISTRIBUTION READY' },
  { id: 'approved', label: 'EVERYTHING APPROVED' },
] as const;

const THUMBS = [
  '/assets/NOIR/wave-thumb.png',
  '/assets/NOIR/curl-thumb.png',
  '/assets/NOIR/noir-thumb.png',
  '/assets/NOIR/blanco-thumb.png',
];

function basePrompt(showName: string): string {
  return `INHERIT: BRAND BRAIN + CREATIVE DIRECTOR + EDITORIAL RULES + CAMPAIGN FRAMEWORKS + PRODUCT KNOWLEDGE

SHOW: ${showName}
ROLE: FRONTAL SLAYER PRODUCTION — HANDCRAFTED, NEVER GENERIC AI

OUTPUT: DRAFT ONLY — REQUIRES SHOW BIBLE APPROVAL`;
}

function createShow(partial: Partial<ShowBibleEntry> & Pick<ShowBibleEntry, 'id' | 'showName' | 'accentHex'>): ShowBibleEntry {
  const name = partial.showName;
  return {
    thumbnailSrc: THUMBS[0],
    description: '',
    purpose: '',
    audience: 'ALL MEMBERS',
    membershipTier: 'ALL MEMBERS',
    host: '',
    supportingCharacters: '',
    publishingFrequency: '',
    seasonNumber: '1',
    episodeCount: '0',
    episodeLength: '8–12 MIN',
    readingTime: '5 MIN',
    difficulty: 'INTERMEDIATE',
    primaryCta: 'WATCH FULL EPISODE',
    secondaryCta: 'READ JOURNAL',
    rewardOpportunity: 'SLAY CHALLENGE CHECK-IN',
    distributionTargets: 'LOUNGE TV · EMAIL · SOCIAL',
    overallTone: 'CONFIDENT · WARM · LUXURY',
    humorStyle: 'LIGHT WIT — NEVER AT THE CUSTOMER',
    luxuryLevel: 'ACCESSIBLE LUXURY',
    energyLevel: 'MEDIUM-HIGH',
    educationalStyle: 'TRUST OVER SALES — EDUCATOR FIRST',
    storytellingStyle: 'HOOK → VALUE → PAYOFF → CTA',
    conversationStyle: 'DIRECT · ENCOURAGING',
    vocabulary: 'SLAY · UNIT · LOUNGE · BUILD-A-WIG',
    catchphrases: '',
    recurringExpressions: '',
    greeting: '',
    closing: '',
    dos: 'CELEBRATE THE CUSTOMER · SHOW THE WORK · REAL CATALOG UNITS ONLY',
    donts: 'NO GATEKEEPING · NO ROBOTIC AI PHRASES · NO FAKE URGENCY',
    studioEnvironment: 'MARBLE STUDIO · RED ACCENT',
    background: 'MARBLE TEXTURE · FROSTED GLASS',
    lighting: 'SOFT KEY + RED RIM #EB1C24',
    cameraAngle: 'HOST MEDIUM',
    lensStyle: '35MM CINEMATIC',
    cameraMovement: 'SLOW PUSH ON HERO MOMENTS',
    composition: 'RULE OF THIRDS · BREATHING ROOM',
    transitions: 'QUICK CUT · RED WIPE',
    graphics: 'FUTURA LABELS · HANDWRITTEN ACCENTS',
    lowerThirdStyle: 'RED LOWER THIRD · EPISODE BADGE',
    colorPalette: '#EB1C24 · #000000 · #FFFFFF',
    typography: 'FUTURA PT + COVERED BY YOUR GRACE',
    motionGraphics: 'MINIMAL · EDITORIAL',
    thumbnailStyle: 'BOLD TITLE · RED ACCENT',
    animationStyle: 'SUBTLE FADE · NO BOUNCY MOTION',
    aspectRatios: '16:9 LOUNGE · 9:16 SOCIAL · 2:3 PINTEREST',
    themeMusic: 'SHOW THEME — 8 BAR BED',
    introMusic: 'INTRO STING — 4 BARS',
    outroMusic: 'OUTRO FADE UNDER VO',
    ambientAudio: 'SOFT MARBLE ROOM TONE',
    voiceStyle: 'WARM · CONFIDENT',
    narrationStyle: 'CONVERSATIONAL HOST',
    speakingSpeed: 'MODERATE — 140 WPM',
    audioEnergy: 'BUILD TO CTA',
    pauses: 'BEAT AFTER HOOK · BEFORE CTA',
    soundEffects: 'SUBTLE WHOOSH ON TRANSITIONS',
    episodeStructureSteps: SHOW_BIBLE_STRUCTURE_STEPS_DEFAULT,
    recurringSegmentsList: '',
    minEpisodeLength: '6 MIN',
    maxEpisodeLength: '15 MIN',
    rulesReadingTime: '5–8 MIN READ',
    imageCount: '3–6',
    videoCount: '1',
    requiredAssets: 'EPISODE · JOURNAL · THUMBNAIL · EMAIL',
    requiredCtas: 'PRIMARY CTA IN OUTRO',
    requiredProductMentions: '1 REAL CATALOG UNIT MINIMUM',
    requiredMembershipMentions: 'WHEN PREMIUM GATED',
    requiredRewards: 'WHEN SLAY CHALLENGE ACTIVE',
    promptVideo: basePrompt(name),
    promptImage: basePrompt(name),
    promptThumbnail: basePrompt(name),
    promptJournal: basePrompt(name),
    promptEmail: basePrompt(name),
    promptCarousel: basePrompt(name),
    promptReel: basePrompt(name),
    promptTiktok: basePrompt(name),
    promptPinterest: basePrompt(name),
    promptPush: basePrompt(name),
    promptVoiceover: basePrompt(name),
    promptTranscript: basePrompt(name),
    thumbnailComposition: 'HOST OR HERO UNIT · LOWER THIRD',
    thumbnailTypography: 'HANDWRITTEN TITLE · FUTURA SUBTITLE',
    thumbnailBrandElements: 'RED ACCENT · EPISODE BADGE',
    thumbnailLighting: 'MATCH SHOW LIGHTING SPEC',
    thumbnailFraming: 'TIGHT HERO · NO CLUTTER',
    thumbnailImageStyle: 'EDITORIAL LUXURY — NO PLASTIC DRIFT',
    thumbnailBadges: 'NEW · EPISODE #',
    thumbnailPremiumLabels: 'PREMIUM · LOUNGE EXCLUSIVE',
    ctaWatchEpisode: 'WATCH FULL EPISODE IN THE LOUNGE',
    ctaReadJournal: 'READ THE FULL JOURNAL GUIDE',
    ctaBuildAWig: 'OPEN BUILD-A-WIG · CUSTOMIZE YOUR UNIT',
    ctaHairAnalysis: 'START YOUR HAIR ANALYSIS WITH PSA',
    ctaMembership: 'UNLOCK MEMBERSHIP · LOUNGE ACCESS',
    ctaRewards: 'VIEW YOUR SLAY CHALLENGE REWARDS',
    ctaLoungeTv: 'JOIN LOUNGE TV · PRESS PLAY',
    ctaShopLook: 'SHOP THIS LOOK · REAL CATALOG UNITS',
    analyticsViews: '12.4K',
    analyticsCompletion: '72%',
    analyticsWatchTime: '6:42',
    analyticsCtr: '4.8%',
    analyticsJournalReads: '2.1K',
    analyticsEmailOpens: '41%',
    analyticsMembershipConv: '3.2%',
    analyticsRevenue: '$18.4K',
    analyticsProducts: '47 UNITS',
    analyticsTopEpisode: 'EP 12 — CHERRY RED FORECAST',
    analyticsBestCta: 'START YOUR HAIR ANALYSIS',
    seasons: [
      {
        id: 's1e1',
        seasonNumber: '1',
        episodeNumber: '1',
        episodeOrder: '1',
        premiereDate: '2026-01-10',
        finaleDate: '',
        status: 'released',
        title: 'SERIES PREMIERE',
      },
    ],
    checklistApproved: 'PENDING',
    ...partial,
  };
}

export const ADMIN_STUDIO_SHOW_BIBLE_DEFAULTS: ShowBibleEntry[] = [
  createShow({
    id: 'the-slay-report',
    showName: 'THE SLAY REPORT',
    accentHex: '#EB1C24',
    thumbnailSrc: THUMBS[0],
    description: 'WEEKLY FRONTAL SLAYER NEWSROOM — TRENDS, FORECASTS, MEMBER WINS.',
    purpose: 'WEEKLY BRIEFING — TREND AUTHORITY + FRIDAY PREMIERE',
    host: 'KATEENA ARMSTRONG',
    publishingFrequency: 'WEEKLY · FRIDAYS · 7PM ET',
    greeting: 'WELCOME BACK TO THE SLAY REPORT — YOUR WEEKLY FRONTAL SLAYER BRIEFING.',
    closing: 'STAY SLAYED. WE WILL SEE YOU FRIDAY AT 7PM.',
    recurringSegmentsList: `TREND FORECAST
COLOR FORECAST
STYLE FORECAST
HUMIDITY ALERT
PSA PICK OF THE WEEK
MEMBER SPOTLIGHT
QUESTION OF THE WEEK
REWARD UNLOCK
OUTRO`,
    analyticsViews: '24.8K',
    analyticsCompletion: '78%',
  }),
  createShow({
    id: 'slay-lab',
    showName: 'SLAY LAB',
    accentHex: '#C41E3A',
    thumbnailSrc: THUMBS[1],
    description: 'HANDS-ON EXPERIMENTS — LACE, COLOR, INSTALL TECHNIQUE.',
    purpose: 'TEST · MEASURE · PERFECT TECHNIQUE',
    host: 'FRONTAL SLAYER EDUCATION TEAM',
    publishingFrequency: 'BI-WEEKLY · TUESDAYS',
    difficulty: 'ADVANCED',
    recurringSegmentsList: `HYPOTHESIS
EXPERIMENT
RESULTS
PSA CONCLUSION
RECOMMENDATION`,
    studioEnvironment: 'STUDIO WORKBENCH · MACRO CAM',
  }),
  createShow({
    id: 'psa-analyzes',
    showName: 'PSA ANALYZES',
    accentHex: '#EB1C24',
    thumbnailSrc: THUMBS[2],
    host: 'PSA · FOUNDER HOLOGRAM',
    description: 'FOUNDER PSA BREAKS DOWN LOOKS, UNITS, AND MEMBER QUESTIONS.',
    purpose: 'CONCIERGE ANALYSIS — TRUST OVER SALES',
    membershipTier: 'PREMIUM MEMBERS',
    conversationStyle: 'NEVER ROBOTIC — HAIR BESTIE + EDUCATOR',
  }),
  createShow({
    id: 'build-studio',
    showName: 'BUILD STUDIO',
    accentHex: '#8B0000',
    thumbnailSrc: THUMBS[3],
    description: 'BUILD-A-WIG DEEP DIVES — CUSTOMIZE UNITS, LIVE PREVIEW.',
    host: 'BUILD-A-WIG ACADEMY',
    studioEnvironment: 'NOIR BRICK STAGE · 3-ANGLE MANNEQUIN',
    primaryCta: 'OPEN BUILD-A-WIG',
  }),
  createShow({
    id: 'the-vault',
    showName: 'THE VAULT',
    accentHex: '#1A1A1A',
    thumbnailSrc: THUMBS[0],
    description: 'ARCHIVED MASTERCLASSES AND RARE INSTALL FOOTAGE.',
    membershipTier: 'BLACK + PREMIUM',
    luxuryLevel: 'ULTRA-PREMIUM EXCLUSIVE',
    lighting: 'LOW KEY · SPOT HERO',
  }),
  createShow({
    id: 'slay-academy',
    showName: 'SLAY ACADEMY',
    accentHex: '#EB1C24',
    thumbnailSrc: THUMBS[1],
    description: 'STRUCTURED LESSON SERIES — LACE, INSTALL, CARE, STYLING.',
    difficulty: 'BEGINNER TO ADVANCED',
    educationalStyle: 'NUMBERED STEPS · QUIZ CHECKPOINTS',
  }),
  createShow({
    id: 'the-lounge',
    showName: 'THE LOUNGE',
    accentHex: '#EB1C24',
    thumbnailSrc: THUMBS[3],
    description: 'LOUNGE TV PROGRAMMING — FEATURED, LEARN, EXPLORE, LIVE.',
    host: 'LOUNGE TV',
    distributionTargets: 'LOUNGE TV · MOBILE WEBSITE · EMAIL',
  }),
  createShow({
    id: 'campaign-films',
    showName: 'CAMPAIGN FILMS',
    accentHex: '#EB1C24',
    thumbnailSrc: THUMBS[2],
    description: 'BRAND FILMS, SEASONAL STORIES, PRODUCT LAUNCH CINEMATICS.',
    host: 'FRONTAL SLAYER BRAND STUDIO',
    episodeLength: '60–90 SEC MANIFESTO + 3 MIN HERO',
    energyLevel: 'HIGH · CINEMATIC',
    aspectRatios: '16:9 CINEMATIC · 1:1 SOCIAL TEASE',
  }),
  createShow({
    id: 'product-stories',
    showName: 'PRODUCT STORIES',
    accentHex: '#EB1C24',
    thumbnailSrc: THUMBS[0],
    description: 'UNIT SPOTLIGHTS — NOIR, BLANCO, WAVES, CURLS IN CONTEXT.',
    purpose: 'PRODUCT EDUCATION WITHOUT HARD SELL',
    requiredProductMentions: 'FEATURED UNIT — FULL SPECS',
    analyticsBestCta: 'SHOP THIS LOOK',
  }),
  createShow({
    id: 'founder-notes',
    showName: 'FOUNDER NOTES',
    accentHex: '#EB1C24',
    thumbnailSrc: THUMBS[1],
    host: 'KATEENA ARMSTRONG',
    description: 'DIRECT-TO-CAMERA FOUNDER MESSAGES — VISION, COMMUNITY, MILESTONES.',
    overallTone: 'INTIMATE · AUTHENTIC · VISIONARY',
    episodeLength: '3–5 MIN',
    membershipTier: 'ALL MEMBERS',
  }),
  createShow({
    id: 'member-briefings',
    showName: 'MEMBER BRIEFINGS',
    accentHex: '#EB1C24',
    thumbnailSrc: THUMBS[2],
    description: 'MEMBER-ONLY UPDATES — REWARDS, LOUNGE, SLAY CHALLENGE.',
    audience: 'PREMIUM + BLACK MEMBERS',
    rewardOpportunity: 'SLAY CHALLENGE · MEMBER SPOTLIGHT',
    distributionTargets: 'EMAIL · LOUNGE TV · PUSH',
  }),
];

export function getShowBibleById(id: string): ShowBibleEntry | undefined {
  return ADMIN_STUDIO_SHOW_BIBLE_DEFAULTS.find((s) => s.id === id);
}

export function createBlankShowBible(id: string, name: string): ShowBibleEntry {
  return createShow({
    id,
    showName: name.toUpperCase(),
    accentHex: '#EB1C24',
    description: 'NEW RECURRING SERIES — DEFINE SHOW DNA.',
    purpose: 'DEFINE PURPOSE',
    host: 'TBD',
    publishingFrequency: 'TBD',
    recurringSegmentsList: 'SEGMENT ONE\nSEGMENT TWO',
  });
}
