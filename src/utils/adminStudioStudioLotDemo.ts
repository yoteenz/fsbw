/** STUDIO LOT — master virtual production environment library (CMS-ready). */

export const ADMIN_STUDIO_LOT_SUBTITLE =
  'EVERY STORY STARTS ON SET — THE PRODUCTION CAMPUS OF FRONTAL SLAYER.';

export type StudioLotTabId =
  | 'profile'
  | 'visual'
  | 'camera'
  | 'lighting'
  | 'motion'
  | 'graphics'
  | 'audio'
  | 'prompts'
  | 'assets'
  | 'usage'
  | 'modes'
  | 'continuity'
  | 'mansion';

export const STUDIO_LOT_TABS: Array<{ id: StudioLotTabId; label: string }> = [
  { id: 'profile', label: 'PROFILE' },
  { id: 'visual', label: 'VISUAL DNA' },
  { id: 'camera', label: 'CAMERA' },
  { id: 'lighting', label: 'LIGHTING' },
  { id: 'motion', label: 'MOTION' },
  { id: 'graphics', label: 'GRAPHICS' },
  { id: 'audio', label: 'AUDIO' },
  { id: 'prompts', label: 'PROMPTS' },
  { id: 'assets', label: 'ASSETS' },
  { id: 'usage', label: 'USAGE' },
  { id: 'modes', label: 'MODES' },
  { id: 'continuity', label: 'CONTINUITY' },
  { id: 'mansion', label: 'MANSION' },
];

export type StudioLotStatus = 'active' | 'in-development' | 'archived' | 'future';

export type StudioLotPromptVersion = {
  id: string;
  label: string;
  body: string;
  createdAt: string;
};

export type StudioLotAssetEntry = {
  id: string;
  name: string;
  type: string;
  version: string;
};

export type StudioLotEntry = {
  id: string;
  accentHex: string;
  artworkSrc: string;
  /** CARD + PROFILE */
  studioName: string;
  description: string;
  purpose: string;
  primaryShows: string;
  supportingShows: string;
  status: StudioLotStatus;
  lastUpdated: string;
  assetCount: string;
  lightingProfileSummary: string;
  cameraPresetsSummary: string;
  membershipAccess: string;
  relatedCampaigns: string;
  defaultCta: string;
  environmentTags: string;
  /** VISUAL DNA */
  masterEnvironment: string;
  alternateVariations: string;
  dayVersion: string;
  nightVersion: string;
  holidayVersion: string;
  seasonalVersions: string;
  lightingProfiles: string;
  colorGrading: string;
  mood: string;
  atmosphere: string;
  luxuryLevel: string;
  materialLibrary: string;
  /** CAMERA */
  cameraPresets: string;
  cameraLens: string;
  depthOfField: string;
  cameraHeight: string;
  cameraMovement: string;
  framing: string;
  safeAreas: string;
  aspectRatios: string;
  /** LIGHTING */
  lightingPresets: string;
  /** MOTION */
  introAnimation: string;
  outroAnimation: string;
  idleAnimation: string;
  cameraAnimation: string;
  transitionAnimations: string;
  loopAnimations: string;
  doorAnimations: string;
  screenAnimations: string;
  glassReflections: string;
  ambientMotion: string;
  /** GRAPHICS */
  lowerThirds: string;
  forecastGraphics: string;
  laboratoryHud: string;
  newsGraphics: string;
  charts: string;
  luxuryLabels: string;
  transitionGraphics: string;
  badges: string;
  premiumIcons: string;
  memberIcons: string;
  /** AUDIO */
  themeMusic: string;
  ambientMusic: string;
  roomTone: string;
  audioIntro: string;
  audioOutro: string;
  audioTransitions: string;
  notificationSounds: string;
  luxurySoundEffects: string;
  /** AI PROMPTS */
  promptFal: string;
  promptOpenArt: string;
  promptImageGen: string;
  promptVideoGen: string;
  promptHeroImages: string;
  promptMarketingGraphics: string;
  promptEnvExpansion: string;
  promptSceneExtension: string;
  promptBackgroundPlates: string;
  promptVersions: StudioLotPromptVersion[];
  /** PRODUCTION ASSETS */
  assetImages: string;
  assetVideos: string;
  asset3d: string;
  assetAnimated: string;
  assetTextures: string;
  assetMaterials: string;
  assetIcons: string;
  assetTransitions: string;
  assetAudio: string;
  assetCatalog: StudioLotAssetEntry[];
  /** USAGE MAP */
  usageMap: string;
  /** PRODUCTION MODES */
  modeEpisode: string;
  modeMarketing: string;
  modeSocial: string;
  modeEmail: string;
  modeJournal: string;
  modeHero: string;
  modeProductLaunch: string;
  modeAdvertising: string;
  modeCampaigns: string;
  modeFutureDesktop: string;
  modeFutureMobile: string;
  /** CONTENT CONTINUITY */
  continuityLighting: string;
  continuityCamera: string;
  continuityColor: string;
  continuityGraphics: string;
  continuityEnvironment: string;
  continuityAnimation: string;
  continuityTypography: string;
  continuityLuxury: string;
  continuityVersion: string;
  /** FUTURE MANSION (design only) */
  mansionFloor: string;
  mansionRoom: string;
  mansionMappingNotes: string;
  mansionStatus: string;
};

export type StudioLotFieldKey = keyof Omit<
  StudioLotEntry,
  'id' | 'accentHex' | 'artworkSrc' | 'status' | 'promptVersions' | 'assetCatalog'
>;

export type StudioLotFieldDef = { key: StudioLotFieldKey; label: string; multiline?: boolean };
export type StudioLotFieldGroup = { title: string; fields: StudioLotFieldDef[] };

export const STUDIO_LOT_PROFILE_GROUPS: StudioLotFieldGroup[] = [
  {
    title: 'IDENTITY',
    fields: [
      { key: 'studioName', label: 'STUDIO NAME' },
      { key: 'description', label: 'DESCRIPTION', multiline: true },
      { key: 'purpose', label: 'PURPOSE', multiline: true },
      { key: 'environmentTags', label: 'ENVIRONMENT TAGS', multiline: true },
    ],
  },
  {
    title: 'PROGRAMMING',
    fields: [
      { key: 'primaryShows', label: 'PRIMARY SHOWS', multiline: true },
      { key: 'supportingShows', label: 'SUPPORTING SHOWS', multiline: true },
      { key: 'membershipAccess', label: 'MEMBERSHIP ACCESS' },
      { key: 'relatedCampaigns', label: 'RELATED CAMPAIGNS', multiline: true },
      { key: 'defaultCta', label: 'DEFAULT CTA' },
    ],
  },
];

export const STUDIO_LOT_VISUAL_GROUPS: StudioLotFieldGroup[] = [
  {
    title: 'MASTER ENVIRONMENT',
    fields: [
      { key: 'masterEnvironment', label: 'MASTER ENVIRONMENT', multiline: true },
      { key: 'alternateVariations', label: 'ALTERNATE VARIATIONS', multiline: true },
      { key: 'dayVersion', label: 'DAY VERSION', multiline: true },
      { key: 'nightVersion', label: 'NIGHT VERSION', multiline: true },
      { key: 'holidayVersion', label: 'HOLIDAY VERSION', multiline: true },
      { key: 'seasonalVersions', label: 'SEASONAL VERSIONS', multiline: true },
    ],
  },
  {
    title: 'LOOK & FEEL',
    fields: [
      { key: 'lightingProfiles', label: 'LIGHTING PROFILES', multiline: true },
      { key: 'colorGrading', label: 'COLOR GRADING', multiline: true },
      { key: 'mood', label: 'MOOD' },
      { key: 'atmosphere', label: 'ATMOSPHERE', multiline: true },
      { key: 'luxuryLevel', label: 'LUXURY LEVEL' },
      { key: 'materialLibrary', label: 'MATERIAL LIBRARY', multiline: true },
    ],
  },
];

export const STUDIO_LOT_CAMERA_GROUPS: StudioLotFieldGroup[] = [
  {
    title: 'CAMERA PRESETS',
    fields: [{ key: 'cameraPresets', label: 'REUSABLE PRESETS', multiline: true }],
  },
  {
    title: 'CAMERA SPECS',
    fields: [
      { key: 'cameraLens', label: 'LENS' },
      { key: 'depthOfField', label: 'DEPTH OF FIELD' },
      { key: 'cameraHeight', label: 'CAMERA HEIGHT' },
      { key: 'cameraMovement', label: 'MOVEMENT', multiline: true },
      { key: 'framing', label: 'FRAMING', multiline: true },
      { key: 'safeAreas', label: 'SAFE AREAS', multiline: true },
      { key: 'aspectRatios', label: 'ASPECT RATIOS' },
    ],
  },
];

export const STUDIO_LOT_LIGHTING_GROUPS: StudioLotFieldGroup[] = [
  {
    title: 'LIGHTING PRESETS',
    fields: [{ key: 'lightingPresets', label: 'REUSABLE PRESETS', multiline: true }],
  },
];

export const STUDIO_LOT_MOTION_GROUPS: StudioLotFieldGroup[] = [
  {
    title: 'ANIMATIONS',
    fields: [
      { key: 'introAnimation', label: 'INTRO ANIMATION', multiline: true },
      { key: 'outroAnimation', label: 'OUTRO ANIMATION', multiline: true },
      { key: 'idleAnimation', label: 'IDLE ANIMATION', multiline: true },
      { key: 'cameraAnimation', label: 'CAMERA ANIMATION', multiline: true },
      { key: 'transitionAnimations', label: 'TRANSITION ANIMATIONS', multiline: true },
      { key: 'loopAnimations', label: 'LOOP ANIMATIONS', multiline: true },
      { key: 'doorAnimations', label: 'DOOR ANIMATIONS', multiline: true },
      { key: 'screenAnimations', label: 'SCREEN ANIMATIONS', multiline: true },
      { key: 'glassReflections', label: 'GLASS REFLECTIONS', multiline: true },
      { key: 'ambientMotion', label: 'AMBIENT MOTION', multiline: true },
    ],
  },
];

export const STUDIO_LOT_GRAPHICS_GROUPS: StudioLotFieldGroup[] = [
  {
    title: 'GRAPHICS SYSTEM',
    fields: [
      { key: 'lowerThirds', label: 'LOWER THIRDS', multiline: true },
      { key: 'forecastGraphics', label: 'FORECAST GRAPHICS', multiline: true },
      { key: 'laboratoryHud', label: 'LABORATORY HUD', multiline: true },
      { key: 'newsGraphics', label: 'NEWS GRAPHICS', multiline: true },
      { key: 'charts', label: 'CHARTS', multiline: true },
      { key: 'luxuryLabels', label: 'LUXURY LABELS', multiline: true },
      { key: 'transitionGraphics', label: 'TRANSITIONS', multiline: true },
      { key: 'badges', label: 'BADGES', multiline: true },
      { key: 'premiumIcons', label: 'PREMIUM ICONS', multiline: true },
      { key: 'memberIcons', label: 'MEMBER ICONS', multiline: true },
    ],
  },
];

export const STUDIO_LOT_AUDIO_GROUPS: StudioLotFieldGroup[] = [
  {
    title: 'AUDIO SYSTEM',
    fields: [
      { key: 'themeMusic', label: 'THEME MUSIC', multiline: true },
      { key: 'ambientMusic', label: 'AMBIENT MUSIC', multiline: true },
      { key: 'roomTone', label: 'ROOM TONE', multiline: true },
      { key: 'audioIntro', label: 'INTRO', multiline: true },
      { key: 'audioOutro', label: 'OUTRO', multiline: true },
      { key: 'audioTransitions', label: 'TRANSITIONS', multiline: true },
      { key: 'notificationSounds', label: 'NOTIFICATION SOUNDS', multiline: true },
      { key: 'luxurySoundEffects', label: 'LUXURY SOUND EFFECTS', multiline: true },
    ],
  },
];

export const STUDIO_LOT_PROMPT_GROUPS: StudioLotFieldGroup[] = [
  {
    title: 'AI PROVIDERS',
    fields: [
      { key: 'promptFal', label: 'FAL', multiline: true },
      { key: 'promptOpenArt', label: 'OPENART', multiline: true },
    ],
  },
  {
    title: 'GENERATION',
    fields: [
      { key: 'promptImageGen', label: 'IMAGE GENERATION', multiline: true },
      { key: 'promptVideoGen', label: 'VIDEO GENERATION', multiline: true },
      { key: 'promptHeroImages', label: 'HERO IMAGES', multiline: true },
      { key: 'promptMarketingGraphics', label: 'MARKETING GRAPHICS', multiline: true },
      { key: 'promptEnvExpansion', label: 'ENVIRONMENT EXPANSION', multiline: true },
      { key: 'promptSceneExtension', label: 'SCENE EXTENSION', multiline: true },
      { key: 'promptBackgroundPlates', label: 'BACKGROUND PLATES', multiline: true },
    ],
  },
];

export const STUDIO_LOT_ASSET_GROUPS: StudioLotFieldGroup[] = [
  {
    title: 'ASSET INVENTORY',
    fields: [
      { key: 'assetImages', label: 'IMAGES' },
      { key: 'assetVideos', label: 'VIDEOS' },
      { key: 'asset3d', label: '3D ASSETS' },
      { key: 'assetAnimated', label: 'ANIMATED ELEMENTS' },
      { key: 'assetTextures', label: 'TEXTURES' },
      { key: 'assetMaterials', label: 'MATERIALS' },
      { key: 'assetIcons', label: 'ICONS' },
      { key: 'assetTransitions', label: 'TRANSITIONS' },
      { key: 'assetAudio', label: 'AUDIO' },
    ],
  },
];

export const STUDIO_LOT_MODES_GROUPS: StudioLotFieldGroup[] = [
  {
    title: 'PRODUCTION MODES',
    fields: [
      { key: 'modeEpisode', label: 'EPISODE PRODUCTION' },
      { key: 'modeMarketing', label: 'MARKETING' },
      { key: 'modeSocial', label: 'SOCIAL MEDIA' },
      { key: 'modeEmail', label: 'EMAIL' },
      { key: 'modeJournal', label: 'JOURNAL' },
      { key: 'modeHero', label: 'HERO CONTENT' },
      { key: 'modeProductLaunch', label: 'PRODUCT LAUNCH' },
      { key: 'modeAdvertising', label: 'ADVERTISING' },
      { key: 'modeCampaigns', label: 'CAMPAIGNS' },
      { key: 'modeFutureDesktop', label: 'FUTURE DESKTOP' },
      { key: 'modeFutureMobile', label: 'FUTURE MOBILE APP' },
    ],
  },
];

export const STUDIO_LOT_CONTINUITY_GROUPS: StudioLotFieldGroup[] = [
  {
    title: 'VISUAL CONTINUITY',
    fields: [
      { key: 'continuityLighting', label: 'LIGHTING', multiline: true },
      { key: 'continuityCamera', label: 'CAMERA', multiline: true },
      { key: 'continuityColor', label: 'COLOR', multiline: true },
      { key: 'continuityGraphics', label: 'GRAPHICS', multiline: true },
      { key: 'continuityEnvironment', label: 'ENVIRONMENT', multiline: true },
      { key: 'continuityAnimation', label: 'ANIMATION', multiline: true },
      { key: 'continuityTypography', label: 'TYPOGRAPHY', multiline: true },
      { key: 'continuityLuxury', label: 'LUXURY STYLING', multiline: true },
      { key: 'continuityVersion', label: 'VERSION LOCK', multiline: true },
    ],
  },
];

export const STUDIO_LOT_MANSION_GROUPS: StudioLotFieldGroup[] = [
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

export const STUDIO_LOT_INHERITANCE_CHAIN = [
  'BRAND BRAIN',
  'CREATIVE DIRECTOR',
  'SHOW BIBLE',
  'STUDIO LOT',
  'CONTENT PACK',
  'AI ORCHESTRATOR',
  'AI PROVIDERS',
  'DRAFT',
  'PUBLISHING',
] as const;

export const STUDIO_LOT_DEFAULT_CAMERA_PRESETS = `WIDE MASTER
MEDIUM
CLOSE UP
PORTRAIT
HERO
PRODUCT
OVERHEAD
TRACKING
POV
MACRO`;

export const STUDIO_LOT_DEFAULT_LIGHTING_PRESETS = `LUXURY EDITORIAL
SOFT DAYLIGHT
GOLDEN HOUR
STUDIO WHITE
PRODUCT LIGHTING
INTERVIEW
NEWS BROADCAST
RUNWAY
NIGHT LUXURY`;

const ARTWORK = [
  '/assets/NOIR/wave-thumb.png',
  '/assets/NOIR/curl-thumb.png',
  '/assets/NOIR/noir-thumb.png',
  '/assets/NOIR/blanco-thumb.png',
];

function basePrompt(studioName: string): string {
  return `INHERIT: BRAND BRAIN + CREATIVE DIRECTOR + SHOW BIBLE + EDITORIAL RULES

STUDIO LOT: ${studioName}
ROLE: FRONTAL SLAYER VIRTUAL PRODUCTION — ONE REUSABLE ENVIRONMENT, NEVER DUPLICATE

RULE: AI PROVIDERS MUST REFERENCE THIS STUDIO — NO INDEPENDENT ENVIRONMENT GENERATION`;
}

function defaultAssets(studioName: string): StudioLotAssetEntry[] {
  return [
    { id: 'img-hero', name: `${studioName} HERO PLATE`, type: 'IMAGE', version: 'v1.0' },
    { id: 'vid-loop', name: `${studioName} AMBIENT LOOP`, type: 'VIDEO', version: 'v1.0' },
    { id: 'tex-marble', name: 'MARBLE TEXTURE KIT', type: 'TEXTURE', version: 'v1.0' },
  ];
}

function defaultPromptVersions(studioName: string): StudioLotPromptVersion[] {
  return [
    {
      id: 'pv-1',
      label: 'MASTER v1.0',
      body: basePrompt(studioName),
      createdAt: '2026-01-15',
    },
  ];
}

function createStudio(
  partial: Partial<StudioLotEntry> & Pick<StudioLotEntry, 'id' | 'studioName' | 'accentHex'>
): StudioLotEntry {
  const name = partial.studioName;
  return {
    artworkSrc: ARTWORK[0],
    description: '',
    purpose: '',
    primaryShows: '',
    supportingShows: '',
    status: 'active',
    lastUpdated: '2026-07-01',
    assetCount: '24',
    lightingProfileSummary: 'LUXURY EDITORIAL',
    cameraPresetsSummary: 'WIDE · MEDIUM · HERO',
    membershipAccess: 'ALL MEMBERS',
    relatedCampaigns: '',
    defaultCta: 'EXPLORE THE LOUNGE',
    environmentTags: 'MARBLE · RED ACCENT · FROSTED GLASS',
    masterEnvironment: 'WHITE MARBLE STUDIO · RED #EB1C24 ACCENT · FUTURA LABELS',
    alternateVariations: '',
    dayVersion: 'SOFT DAYLIGHT · WARM MARBLE',
    nightVersion: 'LOW KEY · RED RIM · SPOT HERO',
    holidayVersion: 'SEASONAL ACCENTS — OPTIONAL OVERLAY',
    seasonalVersions: 'SPRING · SUMMER · FALL · WINTER KITS',
    lightingProfiles: STUDIO_LOT_DEFAULT_LIGHTING_PRESETS,
    colorGrading: 'WARM SKIN · COOL MARBLE · RED POP',
    mood: 'CONFIDENT LUXURY',
    atmosphere: 'EDITORIAL CALM · BREATHING ROOM',
    luxuryLevel: 'ACCESSIBLE LUXURY',
    materialLibrary: 'MARBLE · BRASS · FROSTED GLASS · VELVET',
    cameraPresets: STUDIO_LOT_DEFAULT_CAMERA_PRESETS,
    cameraLens: '35MM CINEMATIC',
    depthOfField: 'SHALLOW ON HERO · DEEP ON WIDE',
    cameraHeight: 'EYE LEVEL · SLIGHT LOW FOR HERO',
    cameraMovement: 'SLOW PUSH · GENTLE TRACK',
    framing: 'RULE OF THIRDS · SAFE TITLE AREAS',
    safeAreas: 'LOWER THIRD · SOCIAL CROP ZONES',
    aspectRatios: '16:9 · 9:16 · 2:3 · 1:1',
    lightingPresets: STUDIO_LOT_DEFAULT_LIGHTING_PRESETS,
    introAnimation: 'RED WIPE · FADE FROM MARBLE',
    outroAnimation: 'FADE TO WHITE · LOGO HOLD',
    idleAnimation: 'SUBTLE AMBIENT LOOP',
    cameraAnimation: 'SLOW PUSH ON SEGMENT ENTRY',
    transitionAnimations: 'QUICK CUT · RED WIPE',
    loopAnimations: 'AMBIENT SCREEN GLOW',
    doorAnimations: 'SLIDE REVEAL — FUTURE MANSION',
    screenAnimations: 'CONTENT FADE IN',
    glassReflections: 'SOFT SPECULAR · FROSTED DIFFUSION',
    ambientMotion: 'PARTICLE DUST · LIGHT SHAFTS',
    lowerThirds: 'RED LOWER THIRD · FUTURA LABEL',
    forecastGraphics: '',
    laboratoryHud: '',
    newsGraphics: '',
    charts: 'MINIMAL LINE CHARTS · RED ACCENT',
    luxuryLabels: 'PREMIUM · EXCLUSIVE · NEW',
    transitionGraphics: 'RED WIPE · MARBLE DISSOLVE',
    badges: 'EPISODE # · NEW · MEMBER',
    premiumIcons: 'CROWN · STAR · SLAY',
    memberIcons: 'TIER BADGES · REWARD ICONS',
    themeMusic: '8-BAR STUDIO BED',
    ambientMusic: 'SOFT LOUNGE PAD',
    roomTone: 'MARBLE ROOM TONE',
    audioIntro: '4-BAR STING',
    audioOutro: 'FADE UNDER VO',
    audioTransitions: 'WHOOSH · SOFT CLICK',
    notificationSounds: 'LUXURY CHIME',
    luxurySoundEffects: 'FABRIC · GLASS · SUBTLE SPARKLE',
    promptFal: basePrompt(name),
    promptOpenArt: basePrompt(name),
    promptImageGen: basePrompt(name),
    promptVideoGen: basePrompt(name),
    promptHeroImages: basePrompt(name),
    promptMarketingGraphics: basePrompt(name),
    promptEnvExpansion: basePrompt(name),
    promptSceneExtension: basePrompt(name),
    promptBackgroundPlates: basePrompt(name),
    promptVersions: defaultPromptVersions(name),
    assetImages: '12',
    assetVideos: '4',
    asset3d: '2',
    assetAnimated: '6',
    assetTextures: '8',
    assetMaterials: '5',
    assetIcons: '14',
    assetTransitions: '3',
    assetAudio: '7',
    assetCatalog: defaultAssets(name),
    usageMap: '',
    modeEpisode: 'ENABLED',
    modeMarketing: 'ENABLED',
    modeSocial: 'ENABLED',
    modeEmail: 'ENABLED',
    modeJournal: 'ENABLED',
    modeHero: 'ENABLED',
    modeProductLaunch: 'ENABLED',
    modeAdvertising: 'ENABLED',
    modeCampaigns: 'ENABLED',
    modeFutureDesktop: 'PLANNED',
    modeFutureMobile: 'PLANNED',
    continuityLighting: 'LOCKED — LUXURY EDITORIAL BASE',
    continuityCamera: 'LOCKED — 35MM HERO FRAMING',
    continuityColor: 'LOCKED — MARBLE + RED PALETTE',
    continuityGraphics: 'LOCKED — FUTURA + HANDWRITTEN',
    continuityEnvironment: 'LOCKED — MASTER ENVIRONMENT v1',
    continuityAnimation: 'LOCKED — SUBTLE FADE MOTION',
    continuityTypography: 'LOCKED — FUTURA PT + COVERED BY YOUR GRACE',
    continuityLuxury: 'LOCKED — ACCESSIBLE LUXURY TIER',
    continuityVersion: 'v1.0 — DO NOT DRIFT WITHOUT VERSION BUMP',
    mansionFloor: '',
    mansionRoom: '',
    mansionMappingNotes: 'DESIGN ONLY — NOT ACTIVE',
    mansionStatus: 'PLANNED',
    ...partial,
  };
}

export const ADMIN_STUDIO_LOT_DEFAULTS: StudioLotEntry[] = [
  createStudio({
    id: 'weather-studio',
    studioName: 'THE WEATHER STUDIO',
    accentHex: '#4A90D9',
    artworkSrc: ARTWORK[0],
    purpose: 'TREND FORECASTS · COLOR · STYLE · HUMIDITY BRIEFINGS',
    primaryShows: 'THE SLAY REPORT',
    lightingProfileSummary: 'NEWS BROADCAST · SOFT DAYLIGHT',
    cameraPresetsSummary: 'WIDE · MEDIUM · GRAPHICS',
    usageMap: `THE SLAY REPORT
TREND FORECAST
LAUNCH WEEK
WEEKLY NEWSLETTER
WEBSITE HERO
SOCIAL REELS
FUTURE MOBILE APP
FUTURE MANSION`,
    forecastGraphics: 'WEATHER MAP · COLOR WHEEL · HUMIDITY METER',
    newsGraphics: 'BROADCAST LOWER THIRD · TICKER',
    lightingPresets: 'NEWS BROADCAST\nSOFT DAYLIGHT\nSTUDIO WHITE',
  }),
  createStudio({
    id: 'lab-studio',
    studioName: 'THE LAB STUDIO',
    accentHex: '#C41E3A',
    artworkSrc: ARTWORK[1],
    purpose: 'HANDS-ON EXPERIMENTS · LACE · COLOR · INSTALL',
    primaryShows: 'SLAY LAB',
    lightingProfileSummary: 'PRODUCT LIGHTING · MACRO',
    cameraPresetsSummary: 'MACRO · OVERHEAD · CLOSE UP',
    laboratoryHud: 'HYPOTHESIS PANEL · RESULTS METER · PSA READOUT',
    usageMap: 'SLAY LAB\nPSA ANALYZES\nPRODUCT STORIES\nSOCIAL REELS',
  }),
  createStudio({
    id: 'build-studio',
    studioName: 'THE BUILD STUDIO',
    accentHex: '#8B0000',
    artworkSrc: ARTWORK[3],
    purpose: 'BUILD-A-WIG DEEP DIVES · 3-ANGLE MANNEQUIN',
    primaryShows: 'BUILD STUDIO',
    masterEnvironment: 'NOIR BRICK STAGE · 3-ANGLE MANNEQUIN · LIVE PREVIEW',
    mansionFloor: 'BUILD WING',
    mansionRoom: 'BUILD-A-WIG ROOM',
    mansionMappingNotes: 'Build Studio → Build-A-Wig Room on Desktop Mansion floor.',
    usageMap: 'BUILD STUDIO\nBUILD-A-WIG\nPRODUCT STORIES\nWEBSITE HERO',
  }),
  createStudio({
    id: 'the-vault',
    studioName: 'THE VAULT',
    accentHex: '#1A1A1A',
    artworkSrc: ARTWORK[2],
    purpose: 'ARCHIVED MASTERCLASSES · RARE INSTALL FOOTAGE',
    primaryShows: 'THE VAULT',
    membershipAccess: 'BLACK + PREMIUM',
    luxuryLevel: 'ULTRA-PREMIUM EXCLUSIVE',
    lightingProfileSummary: 'NIGHT LUXURY · LOW KEY',
    nightVersion: 'PRIMARY — SPOT HERO · DEEP SHADOWS',
    usageMap: 'THE VAULT\nSLAY ACADEMY ARCHIVE\nMEMBER BRIEFINGS',
  }),
  createStudio({
    id: 'the-academy',
    studioName: 'THE ACADEMY',
    accentHex: '#EB1C24',
    artworkSrc: ARTWORK[1],
    purpose: 'STRUCTURED LESSONS · QUIZ CHECKPOINTS',
    primaryShows: 'SLAY ACADEMY',
    mansionFloor: 'LEARNING WING',
    mansionRoom: 'FUTURE LEARNING WING',
    mansionMappingNotes: 'The Academy → Future Learning Wing (planned Desktop Mansion expansion).',
    usageMap: 'SLAY ACADEMY\nJOURNAL GUIDES\nEMAIL SERIES',
  }),
  createStudio({
    id: 'the-lounge',
    studioName: 'THE LOUNGE',
    accentHex: '#EB1C24',
    artworkSrc: ARTWORK[3],
    purpose: 'LOUNGE TV PROGRAMMING · FEATURED · LIVE',
    primaryShows: 'THE LOUNGE',
    mansionFloor: 'LOUNGE FLOOR',
    mansionRoom: 'LOUNGE FLOOR',
    mansionMappingNotes: 'The Lounge Studio → Lounge Floor in Desktop Mansion.',
    usageMap: 'THE LOUNGE\nLOUNGE TV\nMEMBER BRIEFINGS\nFUTURE DESKTOP',
  }),
  createStudio({
    id: 'the-newsroom',
    studioName: 'THE NEWSROOM',
    accentHex: '#EB1C24',
    artworkSrc: ARTWORK[0],
    purpose: 'WEEKLY BRIEFING · MEMBER WINS · FRIDAY PREMIERE',
    primaryShows: 'THE SLAY REPORT · MEMBER BRIEFINGS',
    newsGraphics: 'NEWS DESK · TICKER · MEMBER SPOTLIGHT',
    lightingProfileSummary: 'NEWS BROADCAST',
    usageMap: 'THE SLAY REPORT\nMEMBER BRIEFINGS\nWEEKLY NEWSLETTER',
  }),
  createStudio({
    id: 'the-runway',
    studioName: 'THE RUNWAY',
    accentHex: '#EB1C24',
    artworkSrc: ARTWORK[2],
    purpose: 'LOOK REVEALS · CAMPAIGN FILMS · SEASONAL STORIES',
    primaryShows: 'CAMPAIGN FILMS',
    lightingProfileSummary: 'RUNWAY · GOLDEN HOUR',
    cameraPresetsSummary: 'TRACKING · HERO · WIDE',
    usageMap: 'CAMPAIGN FILMS\nPRODUCT STORIES\nSOCIAL REELS\nADVERTISING',
  }),
  createStudio({
    id: 'product-studio',
    studioName: 'THE PRODUCT STUDIO',
    accentHex: '#EB1C24',
    artworkSrc: ARTWORK[0],
    purpose: 'UNIT SPOTLIGHTS · NOIR · BLANCO · WAVES · CURLS',
    primaryShows: 'PRODUCT STORIES',
    lightingProfileSummary: 'PRODUCT LIGHTING',
    cameraPresetsSummary: 'PRODUCT · HERO · MACRO',
    usageMap: 'PRODUCT STORIES\nSHOP PAGES\nEMAIL\nSOCIAL',
  }),
  createStudio({
    id: 'campaign-studio',
    studioName: 'CAMPAIGN STUDIO',
    accentHex: '#EB1C24',
    artworkSrc: ARTWORK[1],
    purpose: 'BRAND FILMS · SEASONAL · LAUNCH CINEMATICS',
    primaryShows: 'CAMPAIGN FILMS',
    lightingProfileSummary: 'LUXURY EDITORIAL · GOLDEN HOUR',
    usageMap: 'CAMPAIGN FILMS\nLAUNCH WEEK\nHERO CONTENT\nADVERTISING',
  }),
  createStudio({
    id: 'founder-studio',
    studioName: 'FOUNDER STUDIO',
    accentHex: '#EB1C24',
    artworkSrc: ARTWORK[1],
    purpose: 'DIRECT-TO-CAMERA · VISION · COMMUNITY',
    primaryShows: 'FOUNDER NOTES',
    mansionFloor: 'FOUNDER SUITE',
    mansionRoom: 'FOUNDER SUITE',
    mansionMappingNotes: 'Founder Studio → Founder Suite in Desktop Mansion.',
    usageMap: 'FOUNDER NOTES\nMEMBER BRIEFINGS\nEMAIL',
  }),
  createStudio({
    id: 'psa-studio',
    studioName: 'PSA STUDIO',
    accentHex: '#EB1C24',
    artworkSrc: ARTWORK[2],
    purpose: 'PSA HOLOGRAM · CONCIERGE ANALYSIS',
    primaryShows: 'PSA ANALYZES',
    mansionFloor: 'PSA WING',
    mansionRoom: 'PSA SUITE',
    mansionMappingNotes: 'PSA Studio → PSA Suite in Desktop Mansion.',
    usageMap: 'PSA ANALYZES\nHAIR ANALYSIS\nMEMBER CONCIERGE',
  }),
  createStudio({
    id: 'future-mansion',
    studioName: 'FUTURE MANSION',
    accentHex: '#1A1A1A',
    artworkSrc: ARTWORK[3],
    purpose: 'DESKTOP MANSION ENVIRONMENT HUB — ALL FLOORS',
    primaryShows: 'ALL SHOWS · ALL STUDIOS',
    status: 'future',
    membershipAccess: 'FOUNDER PREVIEW',
    mansionFloor: 'ALL FLOORS',
    mansionRoom: 'FULL MANSION MAP',
    mansionMappingNotes: `The Lounge → Lounge Floor
Build Studio → Build-A-Wig Room
Founder Studio → Founder Suite
PSA Studio → PSA Suite
The Academy → Learning Wing
Weather Studio → Forecast Wing (planned)

INTEGRATION NOT ACTIVE — DESIGN RELATIONSHIPS ONLY.`,
    mansionStatus: 'DESIGN ONLY — NOT ACTIVE',
    usageMap: 'FUTURE DESKTOP\nFUTURE MOBILE APP\nALL STUDIOS',
    assetCount: '0',
    continuityVersion: 'v0 — MASTER PLAN ONLY',
  }),
];

export function getStudioLotById(id: string): StudioLotEntry | undefined {
  return ADMIN_STUDIO_LOT_DEFAULTS.find((s) => s.id === id);
}

export function createBlankStudioLot(id: string, name: string): StudioLotEntry {
  return createStudio({
    id,
    studioName: name.toUpperCase(),
    accentHex: '#EB1C24',
    description: 'NEW VIRTUAL PRODUCTION STUDIO — DEFINE ENVIRONMENT DNA.',
    purpose: 'DEFINE PURPOSE',
    primaryShows: 'TBD',
    status: 'in-development',
    assetCount: '0',
    usageMap: 'TBD',
  });
}
