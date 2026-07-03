/** TALENT AGENCY — master recurring personality library (CMS-ready). */

export const ADMIN_STUDIO_TALENT_SUBTITLE =
  'THE FACES BEHIND EVERY FRONTAL SLAYER STORY — LUXURY CASTING DEPARTMENT.';

export type TalentAgencyTabId =
  | 'profile'
  | 'visual'
  | 'voice'
  | 'personality'
  | 'wardrobe'
  | 'expressions'
  | 'poses'
  | 'assignments'
  | 'prompts'
  | 'rules'
  | 'continuity'
  | 'mansion';

export const TALENT_AGENCY_TABS: Array<{ id: TalentAgencyTabId; label: string }> = [
  { id: 'profile', label: 'PROFILE' },
  { id: 'visual', label: 'VISUAL' },
  { id: 'voice', label: 'VOICE' },
  { id: 'personality', label: 'PERSONALITY' },
  { id: 'wardrobe', label: 'WARDROBE' },
  { id: 'expressions', label: 'EXPRESSIONS' },
  { id: 'poses', label: 'POSES' },
  { id: 'assignments', label: 'ASSIGNMENTS' },
  { id: 'prompts', label: 'PROMPTS' },
  { id: 'rules', label: 'RULES' },
  { id: 'continuity', label: 'CONTINUITY' },
  { id: 'mansion', label: 'MANSION' },
];

export type TalentStatus = 'active' | 'in-development' | 'archived' | 'future';

export type TalentPromptVersion = {
  id: string;
  label: string;
  body: string;
  createdAt: string;
};

export type TalentWardrobeEntry = {
  id: string;
  name: string;
  outfit: string;
  shoes: string;
  accessories: string;
  jewelry: string;
  hairStyle: string;
  colorPalette: string;
};

export type TalentAgencyEntry = {
  id: string;
  accentHex: string;
  portraitSrc: string;
  /** CARD + PROFILE */
  name: string;
  role: string;
  biography: string;
  purpose: string;
  primaryShows: string;
  supportingShows: string;
  status: TalentStatus;
  lastUpdated: string;
  voiceProfileSummary: string;
  wardrobeCount: string;
  environmentCount: string;
  membershipAccess: string;
  defaultCta: string;
  availability: string;
  /** VISUAL IDENTITY */
  masterAppearance: string;
  hair: string;
  makeup: string;
  wardrobe: string;
  accessories: string;
  jewelry: string;
  colorPalette: string;
  luxuryStyle: string;
  facialExpressions: string;
  signaturePoses: string;
  handGestures: string;
  silhouettes: string;
  visualVersion: string;
  /** VOICE */
  voice: string;
  accent: string;
  speakingSpeed: string;
  energy: string;
  confidence: string;
  warmth: string;
  humor: string;
  luxuryTone: string;
  educationStyle: string;
  storytellingStyle: string;
  vocabulary: string;
  catchphrases: string;
  greetings: string;
  closings: string;
  pauses: string;
  /** PERSONALITY */
  mission: string;
  strengths: string;
  teachingStyle: string;
  leadershipStyle: string;
  luxuryLanguage: string;
  topicsOfExpertise: string;
  topicsToAvoid: string;
  favoriteAnalogies: string;
  recurringExpressions: string;
  brandValues: string;
  /** WARDROBE LIBRARY */
  wardrobeLibrary: string;
  wardrobeCatalog: TalentWardrobeEntry[];
  /** EXPRESSIONS */
  expressionLibrary: string;
  /** POSES */
  poseLibrary: string;
  /** SHOW ASSIGNMENTS */
  showAssignments: string;
  /** AI PROMPTS */
  promptImage: string;
  promptVideo: string;
  promptVoice: string;
  promptPortrait: string;
  promptMarketing: string;
  promptThumbnail: string;
  promptHero: string;
  promptVersions: TalentPromptVersion[];
  /** PRODUCTION RULES */
  ruleAppearance: string;
  ruleVoice: string;
  ruleWardrobe: string;
  ruleExpressions: string;
  ruleCameraPresence: string;
  ruleLuxuryStyling: string;
  rulePersonality: string;
  ruleShowRole: string;
  /** CONTINUITY */
  continuityFace: string;
  continuityHair: string;
  continuityWardrobeLogic: string;
  continuityVoice: string;
  continuityBehavior: string;
  continuityLuxury: string;
  continuityVersion: string;
  /** FUTURE MANSION */
  mansionRoom: string;
  mansionFloor: string;
  mansionMappingNotes: string;
  mansionStatus: string;
};

export type TalentFieldKey = keyof Omit<
  TalentAgencyEntry,
  'id' | 'accentHex' | 'portraitSrc' | 'status' | 'promptVersions' | 'wardrobeCatalog'
>;

export type TalentFieldDef = { key: TalentFieldKey; label: string; multiline?: boolean };
export type TalentFieldGroup = { title: string; fields: TalentFieldDef[] };

export const TALENT_PROFILE_GROUPS: TalentFieldGroup[] = [
  {
    title: 'IDENTITY',
    fields: [
      { key: 'name', label: 'NAME' },
      { key: 'role', label: 'ROLE' },
      { key: 'biography', label: 'BIOGRAPHY', multiline: true },
      { key: 'purpose', label: 'PURPOSE', multiline: true },
    ],
  },
  {
    title: 'PROGRAMMING',
    fields: [
      { key: 'primaryShows', label: 'PRIMARY SHOWS', multiline: true },
      { key: 'supportingShows', label: 'SUPPORTING SHOWS', multiline: true },
      { key: 'membershipAccess', label: 'MEMBERSHIP ACCESS' },
      { key: 'defaultCta', label: 'DEFAULT CTA' },
      { key: 'availability', label: 'AVAILABILITY' },
    ],
  },
];

export const TALENT_VISUAL_GROUPS: TalentFieldGroup[] = [
  {
    title: 'MASTER APPEARANCE',
    fields: [
      { key: 'masterAppearance', label: 'MASTER APPEARANCE', multiline: true },
      { key: 'hair', label: 'HAIR', multiline: true },
      { key: 'makeup', label: 'MAKEUP', multiline: true },
      { key: 'wardrobe', label: 'WARDROBE', multiline: true },
      { key: 'accessories', label: 'ACCESSORIES', multiline: true },
      { key: 'jewelry', label: 'JEWELRY', multiline: true },
      { key: 'colorPalette', label: 'COLOR PALETTE' },
      { key: 'luxuryStyle', label: 'LUXURY STYLE', multiline: true },
    ],
  },
  {
    title: 'SIGNATURE',
    fields: [
      { key: 'facialExpressions', label: 'FACIAL EXPRESSIONS', multiline: true },
      { key: 'signaturePoses', label: 'SIGNATURE POSES', multiline: true },
      { key: 'handGestures', label: 'HAND GESTURES', multiline: true },
      { key: 'silhouettes', label: 'SILHOUETTES', multiline: true },
      { key: 'visualVersion', label: 'VISUAL VERSION LOCK' },
    ],
  },
];

export const TALENT_VOICE_GROUPS: TalentFieldGroup[] = [
  {
    title: 'VOICE PROFILE',
    fields: [
      { key: 'voice', label: 'VOICE', multiline: true },
      { key: 'accent', label: 'ACCENT' },
      { key: 'speakingSpeed', label: 'SPEAKING SPEED' },
      { key: 'energy', label: 'ENERGY' },
      { key: 'confidence', label: 'CONFIDENCE' },
      { key: 'warmth', label: 'WARMTH' },
      { key: 'humor', label: 'HUMOR' },
      { key: 'luxuryTone', label: 'LUXURY TONE', multiline: true },
    ],
  },
  {
    title: 'DELIVERY',
    fields: [
      { key: 'educationStyle', label: 'EDUCATION STYLE', multiline: true },
      { key: 'storytellingStyle', label: 'STORYTELLING STYLE', multiline: true },
      { key: 'vocabulary', label: 'VOCABULARY', multiline: true },
      { key: 'catchphrases', label: 'CATCHPHRASES', multiline: true },
      { key: 'greetings', label: 'GREETINGS', multiline: true },
      { key: 'closings', label: 'CLOSINGS', multiline: true },
      { key: 'pauses', label: 'PAUSES', multiline: true },
    ],
  },
];

export const TALENT_PERSONALITY_GROUPS: TalentFieldGroup[] = [
  {
    title: 'CHARACTER',
    fields: [
      { key: 'mission', label: 'MISSION', multiline: true },
      { key: 'strengths', label: 'STRENGTHS', multiline: true },
      { key: 'teachingStyle', label: 'TEACHING STYLE', multiline: true },
      { key: 'leadershipStyle', label: 'LEADERSHIP STYLE', multiline: true },
      { key: 'luxuryLanguage', label: 'LUXURY LANGUAGE', multiline: true },
    ],
  },
  {
    title: 'EXPERTISE',
    fields: [
      { key: 'topicsOfExpertise', label: 'TOPICS OF EXPERTISE', multiline: true },
      { key: 'topicsToAvoid', label: 'TOPICS TO AVOID', multiline: true },
      { key: 'favoriteAnalogies', label: 'FAVORITE ANALOGIES', multiline: true },
      { key: 'recurringExpressions', label: 'RECURRING EXPRESSIONS', multiline: true },
      { key: 'brandValues', label: 'BRAND VALUES', multiline: true },
    ],
  },
];

export const TALENT_PROMPT_GROUPS: TalentFieldGroup[] = [
  {
    title: 'AI PROMPTS',
    fields: [
      { key: 'promptImage', label: 'IMAGE PROMPT', multiline: true },
      { key: 'promptVideo', label: 'VIDEO PROMPT', multiline: true },
      { key: 'promptVoice', label: 'VOICE PROMPT', multiline: true },
      { key: 'promptPortrait', label: 'PORTRAIT PROMPT', multiline: true },
      { key: 'promptMarketing', label: 'MARKETING PROMPT', multiline: true },
      { key: 'promptThumbnail', label: 'THUMBNAIL PROMPT', multiline: true },
      { key: 'promptHero', label: 'HERO PROMPT', multiline: true },
    ],
  },
];

export const TALENT_RULES_GROUPS: TalentFieldGroup[] = [
  {
    title: 'PRODUCTION RULES',
    fields: [
      { key: 'ruleAppearance', label: 'APPEARANCE', multiline: true },
      { key: 'ruleVoice', label: 'VOICE', multiline: true },
      { key: 'ruleWardrobe', label: 'WARDROBE', multiline: true },
      { key: 'ruleExpressions', label: 'EXPRESSIONS', multiline: true },
      { key: 'ruleCameraPresence', label: 'CAMERA PRESENCE', multiline: true },
      { key: 'ruleLuxuryStyling', label: 'LUXURY STYLING', multiline: true },
      { key: 'rulePersonality', label: 'PERSONALITY', multiline: true },
      { key: 'ruleShowRole', label: 'SHOW ROLE', multiline: true },
    ],
  },
];

export const TALENT_CONTINUITY_GROUPS: TalentFieldGroup[] = [
  {
    title: 'CONTINUITY LOCK',
    fields: [
      { key: 'continuityFace', label: 'FACE', multiline: true },
      { key: 'continuityHair', label: 'HAIR', multiline: true },
      { key: 'continuityWardrobeLogic', label: 'WARDROBE LOGIC', multiline: true },
      { key: 'continuityVoice', label: 'VOICE', multiline: true },
      { key: 'continuityBehavior', label: 'BEHAVIOR', multiline: true },
      { key: 'continuityLuxury', label: 'LUXURY STYLING', multiline: true },
      { key: 'continuityVersion', label: 'VERSION LOCK', multiline: true },
    ],
  },
];

export const TALENT_MANSION_GROUPS: TalentFieldGroup[] = [
  {
    title: 'FUTURE MANSION MAPPING (DESIGN ONLY)',
    fields: [
      { key: 'mansionFloor', label: 'MANSION FLOOR' },
      { key: 'mansionRoom', label: 'MANSION ROOM / SUITE' },
      { key: 'mansionMappingNotes', label: 'MAPPING NOTES', multiline: true },
      { key: 'mansionStatus', label: 'INTEGRATION STATUS' },
    ],
  },
];

export const TALENT_DEFAULT_EXPRESSIONS = `SMILES
THINKING
POINTING
LISTENING
LAUGHING
EXPLAINING
CELEBRATING
WELCOMING
LUXURY NEUTRAL
CAMERA READY`;

export const TALENT_DEFAULT_POSES = `STANDING
WALKING
SITTING
INTERVIEW
PRESENTATION
PRODUCT SHOWCASE
WEATHER REPORT
LABORATORY
LUXURY PORTRAIT
EDITORIAL`;

export const TALENT_DEFAULT_WARDROBE = `LUXURY EDITORIAL
WEATHER HOST
SCIENTIST
FOUNDER
BUILD STUDIO
EVENING
HOLIDAY
LAUNCH
INTERVIEW
MINIMAL`;

export const TALENT_INHERITANCE_CHAIN = [
  'BRAND BRAIN',
  'CREATIVE DIRECTOR',
  'SHOW BIBLE',
  'STUDIO LOT',
  'TALENT AGENCY',
  'CONTENT PACK',
  'AI ORCHESTRATOR',
  'AI PROVIDERS',
  'DRAFT',
  'PUBLISHING',
] as const;

const PORTRAITS = [
  '/assets/NOIR/wave-thumb.png',
  '/assets/NOIR/curl-thumb.png',
  '/assets/NOIR/noir-thumb.png',
  '/assets/NOIR/blanco-thumb.png',
];

function basePrompt(talentName: string): string {
  return `INHERIT: BRAND BRAIN + CREATIVE DIRECTOR + SHOW BIBLE + STUDIO LOT

TALENT: ${talentName}
ROLE: FRONTAL SLAYER PRODUCTION TALENT — ONE MASTER PROFILE, NEVER RECREATE

RULE: AI PROVIDERS MUST REFERENCE TALENT AGENCY — NO INDEPENDENT CHARACTER GENERATION`;
}

function defaultWardrobeCatalog(name: string): TalentWardrobeEntry[] {
  return [
    {
      id: 'w-lux',
      name: 'LUXURY EDITORIAL',
      outfit: 'TAILORED BLAZER · SILK BLOUSE',
      shoes: 'POINTED HEEL',
      accessories: 'STATEMENT EARRINGS',
      jewelry: 'GOLD ACCENT',
      hairStyle: 'SLEEK BLOWOUT',
      colorPalette: '#EB1C24 · #000000 · #FFFFFF',
    },
    {
      id: 'w-int',
      name: 'INTERVIEW',
      outfit: 'MINIMAL BLACK · RED ACCENT',
      shoes: 'CLASSIC PUMP',
      accessories: 'WATCH',
      jewelry: 'SUBTLE STUDS',
      hairStyle: 'NATURAL VOLUME',
      colorPalette: 'NEUTRAL + RED POP',
    },
    {
      id: 'w-launch',
      name: 'LAUNCH',
      outfit: `${name} CAMPAIGN LOOK`,
      shoes: 'DESIGNER HEEL',
      accessories: 'BRAND PIN',
      jewelry: 'STATEMENT NECKLACE',
      hairStyle: 'CAMERA-READY GLAM',
      colorPalette: 'SEASON CAMPAIGN PALETTE',
    },
  ];
}

function defaultPromptVersions(name: string): TalentPromptVersion[] {
  return [
    { id: 'pv-1', label: 'MASTER v1.0', body: basePrompt(name), createdAt: '2026-01-15' },
  ];
}

function createTalent(
  partial: Partial<TalentAgencyEntry> & Pick<TalentAgencyEntry, 'id' | 'name' | 'accentHex'>
): TalentAgencyEntry {
  const name = partial.name;
  return {
    portraitSrc: PORTRAITS[0],
    role: '',
    biography: '',
    purpose: '',
    primaryShows: '',
    supportingShows: '',
    status: 'active',
    lastUpdated: '2026-07-01',
    voiceProfileSummary: 'WARM · CONFIDENT',
    wardrobeCount: '10',
    environmentCount: '4',
    membershipAccess: 'ALL MEMBERS',
    defaultCta: 'MEET YOUR HAIR BESTIE',
    availability: 'ALWAYS ON',
    masterAppearance: 'LUXURY EDITORIAL PRESENCE · RED ACCENT STYLING',
    hair: 'CAMERA-READY · VERSATILE LENGTH',
    makeup: 'NATURAL GLAM · WARM TONES',
    wardrobe: 'LUXURY EDITORIAL DEFAULT',
    accessories: 'STATEMENT EARRINGS · WATCH',
    jewelry: 'GOLD ACCENT · SUBTLE STUDS',
    colorPalette: '#EB1C24 · #000000 · #FFFFFF',
    luxuryStyle: 'ACCESSIBLE LUXURY · EDITORIAL',
    facialExpressions: TALENT_DEFAULT_EXPRESSIONS,
    signaturePoses: TALENT_DEFAULT_POSES,
    handGestures: 'OPEN PALM · POINTING · WELCOME',
    silhouettes: 'RECOGNIZABLE PROFILE · CONFIDENT STANCE',
    visualVersion: 'v1.0',
    voice: 'WARM FEMALE · CONFIDENT',
    accent: 'NEUTRAL AMERICAN',
    speakingSpeed: 'MODERATE — 140 WPM',
    energy: 'MEDIUM-HIGH',
    confidence: 'HIGH — NEVER CONDESCENDING',
    warmth: 'HAIR BESTIE ENERGY',
    humor: 'LIGHT WIT',
    luxuryTone: 'EDITORIAL LUXURY — NEVER STIFF',
    educationStyle: 'TRUST OVER SALES',
    storytellingStyle: 'HOOK → VALUE → PAYOFF',
    vocabulary: 'SLAY · UNIT · LOUNGE · BUILD-A-WIG',
    catchphrases: '',
    greetings: '',
    closings: '',
    pauses: 'BEAT AFTER HOOK · BEFORE CTA',
    mission: 'EDUCATE · INSPIRE · CELEBRATE THE CUSTOMER',
    strengths: 'HAIR KNOWLEDGE · WARM DELIVERY · LUXURY PRESENCE',
    teachingStyle: 'STEP-BY-STEP · VISUAL DEMONSTRATION',
    leadershipStyle: 'ENCOURAGING · DIRECT',
    luxuryLanguage: 'PREMIUM WITHOUT GATEKEEPING',
    topicsOfExpertise: 'LACE · INSTALL · CARE · STYLING',
    topicsToAvoid: 'GATEKEEPING · FAKE URGENCY · ROBOTIC AI PHRASES',
    favoriteAnalogies: 'YOUR HAIR JOURNEY IS A BUILD PROJECT',
    recurringExpressions: 'STAY SLAYED · LET US BUILD THIS',
    brandValues: 'TRUST · LUXURY · COMMUNITY',
    wardrobeLibrary: TALENT_DEFAULT_WARDROBE,
    wardrobeCatalog: defaultWardrobeCatalog(name),
    expressionLibrary: TALENT_DEFAULT_EXPRESSIONS,
    poseLibrary: TALENT_DEFAULT_POSES,
    showAssignments: '',
    promptImage: basePrompt(name),
    promptVideo: basePrompt(name),
    promptVoice: basePrompt(name),
    promptPortrait: basePrompt(name),
    promptMarketing: basePrompt(name),
    promptThumbnail: basePrompt(name),
    promptHero: basePrompt(name),
    promptVersions: defaultPromptVersions(name),
    ruleAppearance: 'ALWAYS MATCH MASTER APPEARANCE v1.0',
    ruleVoice: 'ALWAYS MATCH VOICE PROFILE',
    ruleWardrobe: 'WARDROBE BY SHOW + MODE — NEVER RANDOM',
    ruleExpressions: 'USE EXPRESSION LIBRARY ONLY',
    ruleCameraPresence: 'CONFIDENT · WARM · DIRECT EYE CONTACT',
    ruleLuxuryStyling: 'ACCESSIBLE LUXURY — NEVER PLASTIC AI DRIFT',
    rulePersonality: 'HAIR BESTIE + EDUCATOR — NEVER ROBOTIC',
    ruleShowRole: 'MATCH PRIMARY SHOW ASSIGNMENT',
    continuityFace: 'LOCKED — MASTER FACE v1.0',
    continuityHair: 'LOCKED — SIGNATURE HAIR LOGIC',
    continuityWardrobeLogic: 'SHOW + MODE DETERMINES WARDROBE KIT',
    continuityVoice: 'LOCKED — VOICE PROFILE v1.0',
    continuityBehavior: 'LOCKED — PERSONALITY PROFILE',
    continuityLuxury: 'LOCKED — LUXURY STYLING TIER',
    continuityVersion: 'v1.0 — DO NOT DRIFT WITHOUT VERSION BUMP',
    mansionRoom: '',
    mansionFloor: '',
    mansionMappingNotes: 'DESIGN ONLY — NOT ACTIVE',
    mansionStatus: 'PLANNED',
    ...partial,
  };
}

export const ADMIN_STUDIO_TALENT_DEFAULTS: TalentAgencyEntry[] = [
  createTalent({
    id: 'psa',
    name: 'PSA',
    accentHex: '#EB1C24',
    portraitSrc: PORTRAITS[2],
    role: 'FOUNDER HOLOGRAM · HAIR CONCIERGE',
    biography: 'PSA IS THE DIGITAL FOUNDER PRESENCE — TRUST OVER SALES, NEVER ROBOTIC.',
    purpose: 'CONCIERGE ANALYSIS · MEMBER GUIDANCE · HAIR BESTIE',
    primaryShows: 'PSA ANALYZES · MEMBER BRIEFINGS',
    voiceProfileSummary: 'WARM · CONFIDENT · NEVER ROBOTIC',
    wardrobeCount: '12',
    environmentCount: '6',
    membershipAccess: 'PREMIUM MEMBERS',
    voice: 'WARM FEMALE HOLOGRAM · CONFIDENT CONCIERGE',
    catchphrases: 'LET ME BREAK THIS DOWN FOR YOU',
    greetings: 'HEY BESTIE — PSA HERE.',
    closings: 'STAY SLAYED. I GOT YOU.',
    showAssignments: `THE SLAY REPORT
SLAY LAB
BUILD STUDIO
CAMPAIGN FILMS
THE LOUNGE
MEMBER BRIEFINGS
PSA CHAT
WEBSITE
FUTURE MOBILE APP
FUTURE MANSION`,
    mansionRoom: 'PSA SUITE',
    mansionFloor: 'PSA WING',
    mansionMappingNotes: 'PSA → PSA Suite in Desktop Mansion.',
    topicsOfExpertise: 'UNITS · INSTALL · MEMBER QUESTIONS · HAIR ANALYSIS',
  }),
  createTalent({
    id: 'founder-avatar',
    name: 'FOUNDER AVATAR',
    accentHex: '#EB1C24',
    portraitSrc: PORTRAITS[1],
    role: 'FOUNDER DIGITAL PRESENCE (FUTURE)',
    status: 'future',
    biography: 'FUTURE FOUNDER AVATAR FOR DIRECT-TO-CAMERA MESSAGES.',
    purpose: 'VISION · COMMUNITY · MILESTONES',
    primaryShows: 'FOUNDER NOTES',
    availability: 'FUTURE RELEASE',
    mansionRoom: 'FOUNDER SUITE',
    mansionFloor: 'FOUNDER SUITE',
    mansionMappingNotes: 'Founder Avatar → Founder Suite.',
    showAssignments: 'FOUNDER NOTES\nMEMBER BRIEFINGS\nFUTURE MANSION',
  }),
  createTalent({
    id: 'luxury-stylist',
    name: 'LUXURY STYLIST',
    accentHex: '#C41E3A',
    portraitSrc: PORTRAITS[0],
    role: 'EDITORIAL STYLIST · LOOK CURATION',
    purpose: 'STYLE AUTHORITY · TREND FORECASTS',
    primaryShows: 'THE SLAY REPORT · CAMPAIGN FILMS',
    luxuryStyle: 'HIGH FASHION EDITORIAL',
    showAssignments: 'THE SLAY REPORT\nCAMPAIGN FILMS\nPRODUCT STORIES\nSOCIAL REELS',
    mansionRoom: 'BUILD STUDIO',
    mansionFloor: 'BUILD WING',
    mansionMappingNotes: 'Luxury Stylist → Build Studio environment.',
  }),
  createTalent({
    id: 'hair-scientist',
    name: 'HAIR SCIENTIST',
    accentHex: '#4A90D9',
    portraitSrc: PORTRAITS[1],
    role: 'LAB EXPERT · TECHNIQUE SPECIALIST',
    purpose: 'EXPERIMENTS · MEASUREMENT · RESULTS',
    primaryShows: 'SLAY LAB',
    wardrobeLibrary: 'SCIENTIST\nLABORATORY\nMINIMAL',
    showAssignments: 'SLAY LAB\nPSA ANALYZES\nPRODUCT STORIES',
    mansionRoom: 'LABORATORY',
    mansionFloor: 'LAB WING',
    mansionMappingNotes: 'Hair Scientist → Laboratory in Desktop Mansion.',
  }),
  createTalent({
    id: 'beauty-reporter',
    name: 'BEAUTY REPORTER',
    accentHex: '#EB1C24',
    portraitSrc: PORTRAITS[0],
    role: 'NEWSROOM HOST · TREND REPORTER',
    purpose: 'WEEKLY BRIEFING · MEMBER WINS',
    primaryShows: 'THE SLAY REPORT',
    wardrobeLibrary: 'WEATHER HOST\nLUXURY EDITORIAL\nINTERVIEW',
    voiceProfileSummary: 'BROADCAST · ENERGETIC',
    showAssignments: 'THE SLAY REPORT\nMEMBER BRIEFINGS\nWEEKLY NEWSLETTER',
    mansionRoom: 'NEWS STUDIO',
    mansionFloor: 'NEWSROOM',
    mansionMappingNotes: 'Beauty Reporter → News Studio.',
  }),
  createTalent({
    id: 'build-specialist',
    name: 'BUILD SPECIALIST',
    accentHex: '#8B0000',
    portraitSrc: PORTRAITS[3],
    role: 'BUILD-A-WIG ACADEMY HOST',
    purpose: 'CUSTOMIZE UNITS · LIVE PREVIEW · EDUCATION',
    primaryShows: 'BUILD STUDIO',
    wardrobeLibrary: 'BUILD STUDIO\nMINIMAL\nLUXURY EDITORIAL',
    showAssignments: 'BUILD STUDIO\nBUILD-A-WIG\nPRODUCT STORIES',
    mansionRoom: 'BUILD-A-WIG ROOM',
    mansionFloor: 'BUILD WING',
  }),
  createTalent({
    id: 'guest-expert',
    name: 'GUEST EXPERT',
    accentHex: '#1A1A1A',
    portraitSrc: PORTRAITS[2],
    role: 'ROTATING INDUSTRY EXPERT',
    purpose: 'GUEST SPOTS · SPECIAL EPISODES',
    primaryShows: 'SLAY ACADEMY · THE LOUNGE',
    availability: 'BY BOOKING',
    status: 'in-development',
    showAssignments: 'SLAY ACADEMY\nTHE LOUNGE\nCAMPAIGN FILMS',
  }),
  createTalent({
    id: 'luxury-mannequin',
    name: 'LUXURY MANNEQUIN COLLECTION',
    accentHex: '#EB1C24',
    portraitSrc: PORTRAITS[3],
    role: '3-ANGLE MANNEQUIN · UNIT DISPLAY',
    purpose: 'PRODUCT SHOWCASE · BUILD PREVIEW',
    primaryShows: 'BUILD STUDIO · PRODUCT STORIES',
    biography: 'REUSABLE MANNEQUIN SYSTEM — NOT A PERSON, PRODUCTION ASSET.',
    wardrobeCount: '24',
    masterAppearance: '3-ANGLE NOIR MANNEQUIN · RED ACCENT STAGE',
    voiceProfileSummary: 'N/A — VISUAL ONLY',
    showAssignments: 'BUILD STUDIO\nPRODUCT STORIES\nSHOP PAGES',
  }),
  createTalent({
    id: 'seasonal-guest-host',
    name: 'SEASONAL GUEST HOST',
    accentHex: '#EB1C24',
    portraitSrc: PORTRAITS[0],
    role: 'SEASONAL ROTATING HOST',
    purpose: 'HOLIDAY · LAUNCH · SPECIAL EVENTS',
    primaryShows: 'CAMPAIGN FILMS · THE LOUNGE',
    availability: 'SEASONAL',
    wardrobeLibrary: 'HOLIDAY\nLAUNCH\nEVENING',
    showAssignments: 'CAMPAIGN FILMS\nTHE LOUNGE\nLAUNCH WEEK',
  }),
  createTalent({
    id: 'campaign-talent',
    name: 'CAMPAIGN TALENT',
    accentHex: '#EB1C24',
    portraitSrc: PORTRAITS[1],
    role: 'BRAND FILM PRESENTER',
    purpose: 'CINEMATIC CAMPAIGNS · PRODUCT LAUNCHES',
    primaryShows: 'CAMPAIGN FILMS',
    luxuryStyle: 'CINEMATIC LUXURY',
    energy: 'HIGH · CINEMATIC',
    showAssignments: 'CAMPAIGN FILMS\nADVERTISING\nHERO CONTENT',
  }),
  createTalent({
    id: 'community-spotlight',
    name: 'FUTURE COMMUNITY SPOTLIGHT',
    accentHex: '#EB1C24',
    portraitSrc: PORTRAITS[2],
    role: 'MEMBER SPOTLIGHT HOST (FUTURE)',
    status: 'future',
    purpose: 'MEMBER WINS · COMMUNITY STORIES',
    primaryShows: 'MEMBER BRIEFINGS · THE LOUNGE',
    availability: 'FUTURE RELEASE',
    showAssignments: 'MEMBER BRIEFINGS\nTHE LOUNGE\nFUTURE MOBILE APP',
    mansionStatus: 'DESIGN ONLY — NOT ACTIVE',
  }),
];

// Fix PSA entry - I accidentally used conversationStyle which doesn't exist. Let me check the file - I used `as never` hack. I should remove that from the createTalent call.

export function getTalentById(id: string): TalentAgencyEntry | undefined {
  return ADMIN_STUDIO_TALENT_DEFAULTS.find((t) => t.id === id);
}

export function createBlankTalent(id: string, name: string): TalentAgencyEntry {
  return createTalent({
    id,
    name: name.toUpperCase(),
    accentHex: '#EB1C24',
    role: 'NEW TALENT — DEFINE ROLE',
    biography: 'NEW RECURRING PERSONALITY — DEFINE CASTING PROFILE.',
    purpose: 'DEFINE PURPOSE',
    primaryShows: 'TBD',
    status: 'in-development',
    wardrobeCount: '0',
    showAssignments: 'TBD',
  });
}
