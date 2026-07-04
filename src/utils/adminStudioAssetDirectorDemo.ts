/** ASSET DIRECTOR — visual source of truth for Frontal Slayer Studios (CMS-ready). */

export const ADMIN_STUDIO_ASSET_DIRECTOR_SUBTITLE =
  'THE VISUAL SOURCE OF TRUTH — HOW FRONTAL SLAYER LOOKS ACROSS EVERY CHANNEL.';

export const ASSET_DIRECTOR_INHERITANCE_CHAIN = [
  'CONTENT BRAIN',
  'CREATIVE DIRECTOR',
  'SHOW BIBLE',
  'STUDIO LOT',
  'TALENT AGENCY',
  'ASSET DIRECTOR',
  'PRODUCTION',
  'DISTRIBUTION',
] as const;

const ARTWORK = [
  '/assets/NOIR/wave-thumb.png',
  '/assets/NOIR/curl-thumb.png',
  '/assets/NOIR/noir-thumb.png',
  '/assets/NOIR/blanco-thumb.png',
];

export type AssetDirectorStatus =
  | 'approved'
  | 'needs-review'
  | 'outdated'
  | 'in-use'
  | 'archived'
  | 'draft';

export type AssetHealthIndicator =
  | 'missing-preview'
  | 'outdated-prompt'
  | 'needs-upscale'
  | 'needs-video'
  | 'unused'
  | 'duplicate'
  | 'low-quality'
  | 'ready-for-production';

export const ASSET_DIRECTOR_STATUS_LABELS: Record<AssetDirectorStatus, string> = {
  approved: 'APPROVED',
  'needs-review': 'NEEDS REVIEW',
  outdated: 'OUTDATED',
  'in-use': 'IN USE',
  archived: 'ARCHIVED',
  draft: 'DRAFT',
};

export const ASSET_HEALTH_LABELS: Record<AssetHealthIndicator, string> = {
  'missing-preview': 'MISSING PREVIEW',
  'outdated-prompt': 'OUTDATED PROMPT',
  'needs-upscale': 'NEEDS UPSCALE',
  'needs-video': 'NEEDS VIDEO VERSION',
  unused: 'UNUSED ASSET',
  duplicate: 'DUPLICATE ASSET',
  'low-quality': 'LOW QUALITY',
  'ready-for-production': 'READY FOR PRODUCTION',
};

export type AssetDirectorSectionId =
  | 'studios'
  | 'talent'
  | 'wardrobe'
  | 'expressions'
  | 'poses'
  | 'camera'
  | 'lighting'
  | 'materials'
  | 'props'
  | 'animations'
  | 'audio'
  | 'moodboards'
  | 'brand-materials'
  | 'relationships'
  | 'version-history'
  | 'asset-health';

export const ASSET_DIRECTOR_SECTIONS: Array<{
  id: AssetDirectorSectionId;
  title: string;
  metric: string;
  description: string;
  accentHex: string;
}> = [
  { id: 'studios', title: 'STUDIOS', metric: '12', description: 'VIRTUAL ENVIRONMENTS · MASTER VISUAL DNA', accentHex: '#2563EB' },
  { id: 'talent', title: 'TALENT', metric: '8', description: 'ON-CAMERA PERSONALITIES · PORTRAITS & POSES', accentHex: '#C41E3A' },
  { id: 'wardrobe', title: 'WARDROBE', metric: '8', description: 'EDITORIAL LOOKS · ASSIGNABLE TO TALENT', accentHex: '#8B0000' },
  { id: 'expressions', title: 'EXPRESSIONS', metric: '8', description: 'FACIAL LIBRARY · REUSABLE EMOTION PRESETS', accentHex: '#CA8A04' },
  { id: 'poses', title: 'POSES', metric: '8', description: 'BODY LANGUAGE · PRESENTATION & INTERVIEW', accentHex: '#6B7280' },
  { id: 'camera', title: 'CAMERA LIBRARY', metric: '8', description: 'FRAMING PRESETS · HERO TO MACRO', accentHex: '#0D9488' },
  { id: 'lighting', title: 'LIGHTING LIBRARY', metric: '7', description: 'LUXURY LIGHTING · BROADCAST TO GOLDEN HOUR', accentHex: '#D97706' },
  { id: 'materials', title: 'MATERIAL LIBRARY', metric: '10', description: 'BRAND SURFACES · MARBLE · CHROME · ROSES', accentHex: '#EB1C24' },
  { id: 'props', title: 'PROPS', metric: '24', description: 'ON-SET OBJECTS · PRODUCT & STYLING', accentHex: '#9333EA' },
  { id: 'animations', title: 'ANIMATIONS', metric: '18', description: 'INTRO · OUTRO · IDLE · TRANSITIONS', accentHex: '#16A34A' },
  { id: 'audio', title: 'AUDIO', metric: '14', description: 'THEME · AMBIENT · VOICE PLACEHOLDERS', accentHex: '#1F2937' },
  { id: 'moodboards', title: 'MOODBOARDS', metric: '10', description: 'LIVING VISUAL DIRECTION · APPROVED REFERENCES', accentHex: '#EB1C24' },
  { id: 'brand-materials', title: 'BRAND MATERIALS', metric: '32', description: 'LOGOS · LOWER THIRDS · GRAPHICS KIT', accentHex: '#2563EB' },
  { id: 'relationships', title: 'ASSET RELATIONSHIPS', metric: '—', description: 'USAGE MAP · IMPACT WHEN ASSETS CHANGE', accentHex: '#6B7280' },
  { id: 'version-history', title: 'VERSION HISTORY', metric: '148', description: 'APPROVED REVISIONS · ROLLBACK READY', accentHex: '#0D9488' },
  { id: 'asset-health', title: 'ASSET HEALTH', metric: '23', description: 'REFRESH QUEUE · QUALITY INDICATORS', accentHex: '#CA8A04' },
];

export type AssetDirectorCard = {
  id: string;
  name: string;
  category: string;
  previewSrc: string;
  status: AssetDirectorStatus;
  lastUpdated: string;
  usedBy: string[];
  version: string;
  health: AssetHealthIndicator[];
  accentHex: string;
  promptNotes?: string;
};

export type AssetDirectorPromptVersion = {
  id: string;
  label: string;
  body: string;
  createdAt: string;
  status: AssetDirectorStatus;
};

export type AssetDirectorStudioProfile = AssetDirectorCard & {
  masterEnvironment: string;
  dayVersion: string;
  nightVersion: string;
  seasonalVersions: string;
  cameraPresets: string;
  lightingPresets: string;
  introAnimation: string;
  outroAnimation: string;
  idleAnimation: string;
  transitionAssets: string;
  lowerThirds: string;
  graphics: string;
  promptVersions: AssetDirectorPromptVersion[];
  usageMap: string[];
  impactMap: string[];
};

export type AssetDirectorTalentProfile = AssetDirectorCard & {
  masterPortrait: string;
  videoReference: string;
  voiceSamplePlaceholder: string;
  wardrobe: string[];
  hairstyle: string;
  makeup: string;
  jewelry: string;
  expressions: string[];
  poses: string[];
  gestureLibrary: string;
  promptVersions: AssetDirectorPromptVersion[];
  appearances: string[];
  usageMap: string[];
  impactMap: string[];
};

export type AssetDirectorMaterial = AssetDirectorCard & {
  promptDescription: string;
  usageRules: string;
  approvedExamples: string;
  doNotUseNotes: string;
};

export type AssetDirectorMoodboard = {
  id: string;
  title: string;
  accentHex: string;
  coverSrc: string;
  notes: string;
  promptReferences: string[];
  visualDirection: string;
  images: Array<{ id: string; src: string; caption: string }>;
  status: AssetDirectorStatus;
  lastUpdated: string;
};

export type AssetDirectorRelationship = {
  assetId: string;
  assetName: string;
  category: string;
  usedBy: string[];
  impacts: string[];
};

export type AssetDirectorVersionEntry = {
  id: string;
  assetName: string;
  category: string;
  version: string;
  previousVersion: string;
  changedBy: string;
  changedAt: string;
  changeSummary: string;
  status: AssetDirectorStatus;
};

export type AssetDirectorHealthEntry = {
  assetId: string;
  assetName: string;
  category: string;
  indicators: AssetHealthIndicator[];
  priority: 'high' | 'medium' | 'low';
  lastChecked: string;
};

export type ContentPackAssetSelection = {
  studioId?: string;
  talentId?: string;
  wardrobeId?: string;
  poseId?: string;
  expressionId?: string;
  cameraId?: string;
  lightingId?: string;
  materialIds?: string[];
  propIds?: string[];
  musicId?: string;
  animationId?: string;
};

export type ContentPackAssetPickerCategory =
  | 'studio'
  | 'talent'
  | 'wardrobe'
  | 'pose'
  | 'expression'
  | 'camera'
  | 'lighting'
  | 'materials'
  | 'props'
  | 'music'
  | 'animation';

function card(
  id: string,
  name: string,
  category: string,
  idx: number,
  overrides: Partial<AssetDirectorCard> = {}
): AssetDirectorCard {
  const statuses: AssetDirectorStatus[] = ['approved', 'in-use', 'needs-review', 'draft', 'outdated'];
  const healthSets: AssetHealthIndicator[][] = [
    ['ready-for-production'],
    ['ready-for-production'],
    ['outdated-prompt'],
    ['needs-video'],
    ['missing-preview'],
    ['unused'],
    ['low-quality'],
    ['needs-upscale'],
  ];
  return {
    id,
    name,
    category,
    previewSrc: ARTWORK[idx % ARTWORK.length],
    status: statuses[idx % statuses.length],
    lastUpdated: `2026-0${(idx % 6) + 1}-${10 + (idx % 18)}`,
    usedBy: ['THE SLAY REPORT', 'LOUNGE TV'].slice(0, 1 + (idx % 2)),
    version: `v${1 + (idx % 4)}.${idx % 10}`,
    health: healthSets[idx % healthSets.length],
    accentHex: ['#EB1C24', '#2563EB', '#C41E3A', '#16A34A', '#CA8A04', '#8B0000'][idx % 6],
    ...overrides,
  };
}

function promptVersions(name: string): AssetDirectorPromptVersion[] {
  return [
    { id: `${name}-pv1`, label: 'v3.2 APPROVED', body: `MASTER VISUAL PROMPT — ${name}\nWHITE MARBLE · LUXURY EDITORIAL · CHERRY RED ACCENT`, createdAt: '2026-06-01', status: 'approved' },
    { id: `${name}-pv2`, label: 'v3.1 ARCHIVED', body: `PREVIOUS PROMPT — ${name}\nSOFT DAYLIGHT VARIANT`, createdAt: '2026-04-15', status: 'archived' },
  ];
}

export const ASSET_DIRECTOR_STUDIOS: AssetDirectorStudioProfile[] = [
  {
    ...card('ad-studio-weather', 'WEATHER STUDIO', 'STUDIO', 0, { status: 'approved', usedBy: ['THE SLAY REPORT', 'TREND FORECAST EMAILS', 'SOCIAL CLIPS', 'LOUNGE TV', 'FUTURE MOBILE APP'] }),
    masterEnvironment: 'GLASS FORECAST WING · WHITE MARBLE FLOOR · CHERRY RED DATA PANELS',
    dayVersion: 'SOFT DAYLIGHT · CLOUD PLATES · BROADCAST READINESS',
    nightVersion: 'NIGHT LUXURY · AMBIENT GLOW · FORECAST GRAPHICS ILLUMINATED',
    seasonalVersions: 'SUMMER SLAY · HOLIDAY LUXURY · SPRING REFRESH',
    cameraPresets: 'WIDE FORECAST · MEDIUM HOST · HERO MAP',
    lightingPresets: 'BROADCAST · SOFT DAYLIGHT · GOLDEN HOUR',
    introAnimation: 'FORECAST SWEEP IN · GLASS PANEL REVEAL',
    outroAnimation: 'MAP DISSOLVE · LOWER THIRD FADE',
    idleAnimation: 'AMBIENT CLOUD DRIFT · SUBTLE PANEL PULSE',
    transitionAssets: 'WEATHER WIPE · GLASS REFLECTION TRANSITION',
    lowerThirds: 'SLAY REPORT FORECAST · TREND ALERT',
    graphics: '7-DAY MAP · TEMPERATURE BADGES · LUXURY ICONS',
    promptVersions: promptVersions('WEATHER STUDIO'),
    usageMap: ['THE SLAY REPORT', 'TREND FORECAST EMAILS', 'SOCIAL CLIPS', 'LOUNGE TV', 'FUTURE MOBILE APP'],
    impactMap: ['EPISODE THUMBNAILS', 'EMAIL HEROES', 'SOCIAL CLIPS', 'LOUNGE TV INTROS'],
  },
  {
    ...card('ad-studio-lab', 'LAB STUDIO', 'STUDIO', 1, { status: 'in-use', usedBy: ['SLAY LAB', 'PSA ANALYZES', 'PRODUCT STORIES'] }),
    masterEnvironment: 'ACRYLIC LAB BENCH · MICROSCOPE HUD · WHITE MARBLE COUNTERS',
    dayVersion: 'CLINICAL DAYLIGHT · SCIENCE BROADCAST',
    nightVersion: 'HUD GLOW · NIGHT LAB AMBIENT',
    seasonalVersions: 'HOLIDAY SCIENCE SPECIAL',
    cameraPresets: 'MACRO PRODUCT · MEDIUM SCIENTIST · OVERHEAD BENCH',
    lightingPresets: 'PRODUCT LIGHTING · BROADCAST',
    introAnimation: 'HUD BOOT SEQUENCE',
    outroAnimation: 'DATA FADE TO LOGO',
    idleAnimation: 'HUD PULSE · SAMPLE ROTATION',
    transitionAssets: 'LAB WIPE · MOLECULE TRANSITION',
    lowerThirds: 'SLAY LAB · SCIENCE ALERT',
    graphics: 'CHARTS · FORMULA OVERLAYS · LUXURY LABELS',
    promptVersions: promptVersions('LAB STUDIO'),
    usageMap: ['SLAY LAB', 'PSA ANALYZES', 'PRODUCT STORIES', 'EMAIL'],
    impactMap: ['TUTORIAL THUMBNAILS', 'PRODUCT LAUNCH GRAPHICS'],
  },
  {
    ...card('ad-studio-build', 'BUILD STUDIO', 'STUDIO', 2, { status: 'approved', usedBy: ['BUILD STUDIO SHOW', 'TUTORIALS', 'MEMBER CONTENT'] }),
    masterEnvironment: 'BUILD TABLE · TOOL WALL · ACRYLIC WORK SURFACE',
    dayVersion: 'WORKSHOP DAYLIGHT',
    nightVersion: 'SPOTLIGHT BUILD ZONE',
    seasonalVersions: 'HOLIDAY BUILD SPECIAL',
    cameraPresets: 'OVERHEAD HANDS · MEDIUM PRESENT · PRODUCT CLOSE',
    lightingPresets: 'PRODUCT LIGHTING · SOFT DAYLIGHT',
    introAnimation: 'TOOL RACK REVEAL',
    outroAnimation: 'FINISHED UNIT HERO',
    idleAnimation: 'SUBTLE DUST MOTES · TOOL GLINT',
    transitionAssets: 'BUILD WIPE',
    lowerThirds: 'BUILD STUDIO · STEP COUNTER',
    graphics: 'STEP BADGES · TOOL ICONS',
    promptVersions: promptVersions('BUILD STUDIO'),
    usageMap: ['BUILD STUDIO', 'TUTORIALS', 'MEMBER CONTENT'],
    impactMap: ['HOW-TO THUMBNAILS', 'MEMBER EMAILS'],
  },
  {
    ...card('ad-studio-vault', 'VAULT', 'STUDIO', 3, { status: 'approved', usedBy: ['THE VAULT', 'MEMBERSHIP', 'REWARDS'] }),
    masterEnvironment: 'LUXURY VAULT DOOR · MARBLE HALL · RED FOIL ACCENTS',
    dayVersion: 'DAYLIGHT VAULT ENTRANCE',
    nightVersion: 'NIGHT LUXURY VAULT GLOW',
    seasonalVersions: 'ANNIVERSARY VAULT',
    cameraPresets: 'HERO DOOR · MEDIUM REVEAL',
    lightingPresets: 'NIGHT LUXURY · LUXURY EDITORIAL',
    introAnimation: 'VAULT DOOR OPEN',
    outroAnimation: 'DOOR CLOSE · SEAL',
    idleAnimation: 'AMBIENT LIGHT SWEEP',
    transitionAssets: 'VAULT TRANSITION',
    lowerThirds: 'THE VAULT · MEMBER EXCLUSIVE',
    graphics: 'REWARD BADGES · TIER ICONS',
    promptVersions: promptVersions('VAULT'),
    usageMap: ['THE VAULT', 'MEMBERSHIP', 'REWARDS', 'EMAIL'],
    impactMap: ['MEMBER WELCOME', 'REWARDS CAMPAIGNS'],
  },
  {
    ...card('ad-studio-academy', 'ACADEMY', 'STUDIO', 0, { status: 'in-use', usedBy: ['ACADEMY', 'TUTORIALS', 'MEMBER LEARNING'] }),
    masterEnvironment: 'LECTURE HALL · MARBLE PODIUM · ACRYLIC SCREENS',
    dayVersion: 'CLASSROOM DAYLIGHT',
    nightVersion: 'EVENING MASTERCLASS',
    seasonalVersions: 'GRADUATION SPECIAL',
    cameraPresets: 'WIDE CLASS · MEDIUM TEACH · CLOSE DETAIL',
    lightingPresets: 'SOFT DAYLIGHT · BROADCAST',
    introAnimation: 'CURTAIN RISE',
    outroAnimation: 'DIPLOMA REVEAL',
    idleAnimation: 'SCREEN AMBIENT',
    transitionAssets: 'CHAPTER TRANSITION',
    lowerThirds: 'ACADEMY · LESSON TITLE',
    graphics: 'LESSON BADGES · PROGRESS BARS',
    promptVersions: promptVersions('ACADEMY'),
    usageMap: ['ACADEMY', 'TUTORIALS', 'MEMBER LEARNING'],
    impactMap: ['COURSE THUMBNAILS', 'MEMBER ONBOARDING'],
  },
  {
    ...card('ad-studio-lounge', 'LOUNGE', 'STUDIO', 1, { status: 'in-use', usedBy: ['LOUNGE TV', 'MEMBER LOUNGE', 'SOCIAL'] }),
    masterEnvironment: 'LUXURY LOUNGE SET · MARBLE COFFEE TABLE · ROSE ACCENTS',
    dayVersion: 'AFTERNOON LOUNGE LIGHT',
    nightVersion: 'EVENING LOUNGE AMBIENCE',
    seasonalVersions: 'HOLIDAY LOUNGE',
    cameraPresets: 'WIDE SET · INTERVIEW TWO-SHOT · CLOSE REACTION',
    lightingPresets: 'LUXURY EDITORIAL · GOLDEN HOUR',
    introAnimation: 'LOUNGE CURTAIN SWEEP',
    outroAnimation: 'FADE TO ROSES',
    idleAnimation: 'CANDLE FLICKER · SUBTLE CAMERA DRIFT',
    transitionAssets: 'LOUNGE DISSOLVE',
    lowerThirds: 'LOUNGE TV · GUEST NAME',
    graphics: 'TOPIC CARDS · MEMBER BADGES',
    promptVersions: promptVersions('LOUNGE'),
    usageMap: ['LOUNGE TV', 'MEMBER LOUNGE', 'SOCIAL', 'WEBSITE'],
    impactMap: ['EPISODE INTROS', 'SOCIAL CLIPS', 'MEMBER HUB'],
  },
  {
    ...card('ad-studio-newsroom', 'NEWSROOM', 'STUDIO', 2, { status: 'approved', usedBy: ['SLAY REPORT', 'BREAKING ALERTS'] }),
    masterEnvironment: 'NEWS DESK · MARBLE FLOOR · BROADCAST GRAPHICS WALL',
    dayVersion: 'BROADCAST DAY',
    nightVersion: 'EVENING NEWS LUXURY',
    seasonalVersions: 'YEAR IN REVIEW',
    cameraPresets: 'ANCHOR MEDIUM · WIDE DESK · GRAPHICS OTS',
    lightingPresets: 'BROADCAST · LUXURY EDITORIAL',
    introAnimation: 'NEWS STING',
    outroAnimation: 'SIGN-OFF LOWER THIRD',
    idleAnimation: 'TICKER SCROLL AMBIENT',
    transitionAssets: 'NEWS WIPE',
    lowerThirds: 'SLAY REPORT · BREAKING',
    graphics: 'TICKER · HEADLINE BANNERS',
    promptVersions: promptVersions('NEWSROOM'),
    usageMap: ['THE SLAY REPORT', 'BREAKING ALERTS', 'EMAIL'],
    impactMap: ['EPISODE GRAPHICS', 'PUSH NOTIFICATIONS'],
  },
  {
    ...card('ad-studio-runway', 'RUNWAY', 'STUDIO', 3, { status: 'approved', usedBy: ['RUNWAY', 'CAMPAIGNS', 'SOCIAL'] }),
    masterEnvironment: 'WHITE RUNWAY · MARBLE SIDES · SPOTLIGHT TRACK',
    dayVersion: 'DAYLIGHT RUNWAY',
    nightVersion: 'FASHION NIGHT · RUNWAY SPOTS',
    seasonalVersions: 'FASHION WEEK · HOLIDAY RUNWAY',
    cameraPresets: 'RUNWAY TRACK · HERO WALK · AUDIENCE WIDE',
    lightingPresets: 'RUNWAY · NIGHT LUXURY',
    introAnimation: 'CURTAIN UP · FIRST STEP',
    outroAnimation: 'FINALE POSE HOLD',
    idleAnimation: 'SPOTLIGHT SWEEP',
    transitionAssets: 'RUNWAY FLASH',
    lowerThirds: 'RUNWAY · LOOK NUMBER',
    graphics: 'LOOK CARDS · DESIGNER LABELS',
    promptVersions: promptVersions('RUNWAY'),
    usageMap: ['RUNWAY', 'CAMPAIGNS', 'SOCIAL', 'EMAIL'],
    impactMap: ['CAMPAIGN HEROES', 'INSTAGRAM CAROUSELS'],
  },
  {
    ...card('ad-studio-product', 'PRODUCT STUDIO', 'STUDIO', 0, { status: 'in-use', usedBy: ['PRODUCT LAUNCHES', 'SHOP', 'EMAIL'] }),
    masterEnvironment: 'PRODUCT PLINTH · MARBLE PEDESTAL · ACRYLIC DISPLAY',
    dayVersion: 'PRODUCT DAYLIGHT',
    nightVersion: 'LUXURY PRODUCT NIGHT',
    seasonalVersions: 'HOLIDAY GIFT SET',
    cameraPresets: 'PRODUCT HERO · MACRO TEXTURE · 360 ORBIT',
    lightingPresets: 'PRODUCT LIGHTING · LUXURY EDITORIAL',
    introAnimation: 'PRODUCT REVEAL ROTATION',
    outroAnimation: 'CTA HOLD',
    idleAnimation: 'SLOW ORBIT',
    transitionAssets: 'PRODUCT FLASH',
    lowerThirds: 'NEW ARRIVAL · SHOP NOW',
    graphics: 'PRICE TAGS · SWATCH CARDS',
    promptVersions: promptVersions('PRODUCT STUDIO'),
    usageMap: ['PRODUCT LAUNCHES', 'SHOP', 'EMAIL', 'SOCIAL'],
    impactMap: ['PDP HEROES', 'LAUNCH EMAILS'],
  },
  {
    ...card('ad-studio-campaign', 'CAMPAIGN STUDIO', 'STUDIO', 1, { status: 'approved', usedBy: ['CAMPAIGNS', 'ADS', 'SOCIAL'] }),
    masterEnvironment: 'CAMPAIGN SET · BRAND BACKDROP · FLEXIBLE PROPS',
    dayVersion: 'CAMPAIGN DAY SHOOT',
    nightVersion: 'LUXURY NIGHT CAMPAIGN',
    seasonalVersions: 'SUMMER SLAY · HOLIDAY',
    cameraPresets: 'HERO CAMPAIGN · MEDIUM STORY · SOCIAL VERTICAL',
    lightingPresets: 'LUXURY EDITORIAL · GOLDEN HOUR',
    introAnimation: 'CAMPAIGN TITLE CARD',
    outroAnimation: 'LOGO LOCKUP',
    idleAnimation: 'BRAND AMBIENT',
    transitionAssets: 'CAMPAIGN CUT',
    lowerThirds: 'CAMPAIGN NAME · OFFER',
    graphics: 'OFFER BADGES · CTA BUTTONS',
    promptVersions: promptVersions('CAMPAIGN STUDIO'),
    usageMap: ['CAMPAIGNS', 'ADS', 'SOCIAL', 'WEBSITE'],
    impactMap: ['AD CREATIVES', 'LANDING HEROES'],
  },
  {
    ...card('ad-studio-psa', 'PSA STUDIO', 'STUDIO', 2, { status: 'in-use', usedBy: ['PSA CHAT', 'WEBSITE', 'MEMBER HUB'] }),
    masterEnvironment: 'PSA SUITE · HOLOGRAM PEDESTAL · MARBLE & GLASS',
    dayVersion: 'TRUST-DAY LIGHTING',
    nightVersion: 'HOLOGRAM NIGHT MODE',
    seasonalVersions: 'MEMBER ANNIVERSARY',
    cameraPresets: 'MEDIUM PSA · CLOSE TRUST · WIDE SUITE',
    lightingPresets: 'SOFT DAYLIGHT · LUXURY EDITORIAL',
    introAnimation: 'HOLOGRAM MATERIALIZE',
    outroAnimation: 'PSA FADE · SIGN-OFF',
    idleAnimation: 'SUBTLE HOLOGRAM SHIMMER',
    transitionAssets: 'PSA TRANSITION',
    lowerThirds: 'PSA · MEMBER BRIEFING',
    graphics: 'TRUST BADGES · CHAT UI',
    promptVersions: promptVersions('PSA STUDIO'),
    usageMap: ['PSA CHAT', 'WEBSITE', 'MEMBER HUB', 'EMAIL'],
    impactMap: ['CHAT AVATAR', 'WELCOME FLOWS'],
  },
  {
    ...card('ad-studio-mansion', 'FUTURE MANSION', 'STUDIO', 3, { status: 'draft', usedBy: ['FUTURE DESKTOP APP', 'FUTURE MOBILE'] }),
    masterEnvironment: 'MANSION LOBBY · MARBLE GRAND HALL · FUTURE UI PANELS',
    dayVersion: 'MANSION DAY — DESIGN ONLY',
    nightVersion: 'MANSION NIGHT — DESIGN ONLY',
    seasonalVersions: 'PLANNED SEASONAL ROOMS',
    cameraPresets: 'LOBBY WIDE · ROOM ENTRY · POV WALK',
    lightingPresets: 'NIGHT LUXURY · GOLDEN HOUR',
    introAnimation: 'MANSION DOOR OPEN — PLACEHOLDER',
    outroAnimation: 'ROOM TRANSITION — PLACEHOLDER',
    idleAnimation: 'AMBIENT MANSION — PLACEHOLDER',
    transitionAssets: 'ROOM PORTAL — PLACEHOLDER',
    lowerThirds: 'MANSION NAV — PLACEHOLDER',
    graphics: 'FLOOR MAP · ROOM LABELS',
    promptVersions: promptVersions('FUTURE MANSION'),
    usageMap: ['FUTURE DESKTOP APP', 'FUTURE MOBILE'],
    impactMap: ['APP ENVIRONMENTS', 'DESKTOP EXPERIENCE'],
  },
];

export const ASSET_DIRECTOR_TALENT: AssetDirectorTalentProfile[] = [
  {
    ...card('ad-talent-psa', 'PSA', 'TALENT', 0, { status: 'approved', usedBy: ['PSA CHAT', 'SLAY REPORT', 'SLAY LAB', 'BUILD STUDIO', 'LOUNGE TV', 'EMAIL', 'WEBSITE'] }),
    masterPortrait: 'PSA HOLOGRAM PORTRAIT · TRUST EXPRESSION · LUXURY EDITORIAL',
    videoReference: 'PSA INTRO LOOP — PLACEHOLDER MP4',
    voiceSamplePlaceholder: 'VOICE SAMPLE — WARM · TRUSTED · NEVER ROBOTIC',
    wardrobe: ['LUXURY EDITORIAL', 'MINIMAL'],
    hairstyle: 'SLEEK FOUNDER BOB · CHERRY RED ACCENT STREAK',
    makeup: 'SOFT GLAM · NATURAL GLOW',
    jewelry: 'DIAMOND STUDS · THIN GOLD CHAIN',
    expressions: ['LUXURY SMILE', 'THINKING', 'WELCOMING', 'NEUTRAL'],
    poses: ['STANDING', 'PRESENTING', 'INTERVIEW'],
    gestureLibrary: 'OPEN PALM WELCOME · POINT TO DATA · NOD LISTEN',
    promptVersions: promptVersions('PSA'),
    appearances: ['PSA CHAT', 'MEMBER BRIEFINGS', 'SLAY REPORT CAMEOS'],
    usageMap: ['PSA CHAT', 'SLAY REPORT', 'SLAY LAB', 'BUILD STUDIO', 'LOUNGE TV', 'EMAIL', 'WEBSITE'],
    impactMap: ['CHAT UI', 'EPISODE INTROS', 'EMAIL HEADERS'],
  },
  {
    ...card('ad-talent-founder', 'FOUNDER AVATAR', 'TALENT', 1, { status: 'in-use', usedBy: ['WEBSITE', 'FOUNDER STUDIO', 'CAMPAIGNS'] }),
    masterPortrait: 'FOUNDER EDITORIAL PORTRAIT · CONFIDENT LUXURY',
    videoReference: 'FOUNDER MESSAGE LOOP — PLACEHOLDER',
    voiceSamplePlaceholder: 'VOICE SAMPLE — EDITORIAL · INSPIRING',
    wardrobe: ['LUXURY EDITORIAL', 'EVENING', 'LAUNCH'],
    hairstyle: 'SIGNATURE SLAY BOB',
    makeup: 'FULL EDITORIAL GLAM',
    jewelry: 'STATEMENT EARRINGS · WATCH',
    expressions: ['LUXURY SMILE', 'CELEBRATING', 'CAMERA READY'],
    poses: ['STANDING', 'PRESENTING', 'SITTING'],
    gestureLibrary: 'FOUNDER WAVE · PRODUCT PRESENT',
    promptVersions: promptVersions('FOUNDER AVATAR'),
    appearances: ['WEBSITE HERO', 'CAMPAIGN FILMS', 'FOUNDER STUDIO'],
    usageMap: ['WEBSITE', 'FOUNDER STUDIO', 'CAMPAIGNS', 'EMAIL'],
    impactMap: ['HOMEPAGE HERO', 'BRAND FILMS'],
  },
  {
    ...card('ad-talent-stylist', 'LUXURY STYLIST', 'TALENT', 2, { status: 'approved', usedBy: ['SLAY REPORT', 'RUNWAY', 'LOUNGE TV'] }),
    masterPortrait: 'STYLIST EDITORIAL · RUNWAY READY',
    videoReference: 'STYLING TIPS LOOP — PLACEHOLDER',
    voiceSamplePlaceholder: 'VOICE SAMPLE — CHIC · AUTHORITATIVE',
    wardrobe: ['LUXURY EDITORIAL', 'EVENING', 'HOLIDAY'],
    hairstyle: 'VOLUMINOUS WAVE',
    makeup: 'RUNWAY GLAM',
    jewelry: 'LAYERED GOLD',
    expressions: ['LUXURY SMILE', 'TEACHING', 'CAMERA READY'],
    poses: ['STANDING', 'PRESENTING', 'PRODUCT SHOWCASE'],
    gestureLibrary: 'FABRIC SWEEP · MIRROR POINT',
    promptVersions: promptVersions('LUXURY STYLIST'),
    appearances: ['SLAY REPORT', 'RUNWAY', 'STYLING SEGMENTS'],
    usageMap: ['SLAY REPORT', 'RUNWAY', 'LOUNGE TV', 'SOCIAL'],
    impactMap: ['STYLING THUMBNAILS', 'RUNWAY GRAPHICS'],
  },
  {
    ...card('ad-talent-scientist', 'HAIR SCIENTIST', 'TALENT', 3, { status: 'in-use', usedBy: ['SLAY LAB', 'PRODUCT STORIES'] }),
    masterPortrait: 'LAB COAT EDITORIAL · SCIENTIST POSE',
    videoReference: 'LAB DEMO LOOP — PLACEHOLDER',
    voiceSamplePlaceholder: 'VOICE SAMPLE — CLEAR · EDUCATIONAL',
    wardrobe: ['SCIENTIST', 'MINIMAL'],
    hairstyle: 'SLEEK PONYTAIL',
    makeup: 'NATURAL PROFESSIONAL',
    jewelry: 'MINIMAL STUDS',
    expressions: ['TEACHING', 'THINKING', 'NEUTRAL'],
    poses: ['STANDING', 'POINTING', 'HOLDING PRODUCT'],
    gestureLibrary: 'MICROSCOPE GESTURE · SAMPLE HOLD',
    promptVersions: promptVersions('HAIR SCIENTIST'),
    appearances: ['SLAY LAB', 'PRODUCT DEEP DIVES'],
    usageMap: ['SLAY LAB', 'PRODUCT STORIES', 'TUTORIALS'],
    impactMap: ['LAB THUMBNAILS', 'PRODUCT EMAILS'],
  },
  {
    ...card('ad-talent-reporter', 'BEAUTY REPORTER', 'TALENT', 0, { status: 'approved', usedBy: ['SLAY REPORT', 'NEWSROOM'] }),
    masterPortrait: 'REPORTER ON-CAMERA · BROADCAST READY',
    videoReference: 'FIELD REPORT LOOP — PLACEHOLDER',
    voiceSamplePlaceholder: 'VOICE SAMPLE — ENERGETIC · CLEAR',
    wardrobe: ['WEATHER HOST', 'LUXURY EDITORIAL'],
    hairstyle: 'BLOWOUT WAVE',
    makeup: 'HD BROADCAST',
    jewelry: 'PEARL STUDS',
    expressions: ['CAMERA READY', 'WELCOMING', 'LISTENING'],
    poses: ['STANDING', 'INTERVIEW', 'WEATHER REPORT'],
    gestureLibrary: 'MIC HOLD · HEADLINE POINT',
    promptVersions: promptVersions('BEAUTY REPORTER'),
    appearances: ['SLAY REPORT', 'FIELD SEGMENTS'],
    usageMap: ['SLAY REPORT', 'NEWSROOM', 'SOCIAL'],
    impactMap: ['SEGMENT GRAPHICS', 'CLIP THUMBNAILS'],
  },
  {
    ...card('ad-talent-build', 'BUILD SPECIALIST', 'TALENT', 1, { status: 'in-use', usedBy: ['BUILD STUDIO', 'TUTORIALS'] }),
    masterPortrait: 'BUILD SPECIALIST · HANDS-ON POSE',
    videoReference: 'BUILD DEMO LOOP — PLACEHOLDER',
    voiceSamplePlaceholder: 'VOICE SAMPLE — FRIENDLY · INSTRUCTIVE',
    wardrobe: ['BUILD STUDIO', 'MINIMAL'],
    hairstyle: 'PRACTICAL UPDO',
    makeup: 'NATURAL',
    jewelry: 'NONE ON SET',
    expressions: ['TEACHING', 'CELEBRATING', 'NEUTRAL'],
    poses: ['STANDING', 'HOLDING PRODUCT', 'POINTING'],
    gestureLibrary: 'TOOL DEMONSTRATE · UNIT HOLD',
    promptVersions: promptVersions('BUILD SPECIALIST'),
    appearances: ['BUILD STUDIO', 'HOW-TO SERIES'],
    usageMap: ['BUILD STUDIO', 'TUTORIALS', 'MEMBER CONTENT'],
    impactMap: ['TUTORIAL THUMBNAILS', 'STEP GRAPHICS'],
  },
  {
    ...card('ad-talent-guest', 'GUEST EXPERT', 'TALENT', 2, { status: 'needs-review', usedBy: ['LOUNGE TV', 'SLAY LAB'] }),
    masterPortrait: 'GUEST EXPERT PLACEHOLDER · ROTATING CAST',
    videoReference: 'GUEST INTRO — PLACEHOLDER',
    voiceSamplePlaceholder: 'VOICE SAMPLE — TBD PER GUEST',
    wardrobe: ['LUXURY EDITORIAL', 'EVENING'],
    hairstyle: 'GUEST SPECIFIC',
    makeup: 'GUEST SPECIFIC',
    jewelry: 'GUEST SPECIFIC',
    expressions: ['WELCOMING', 'LISTENING', 'NEUTRAL'],
    poses: ['SITTING', 'INTERVIEW', 'STANDING'],
    gestureLibrary: 'CONVERSATION GESTURES',
    promptVersions: promptVersions('GUEST EXPERT'),
    appearances: ['LOUNGE TV EPISODES', 'SPECIAL SEGMENTS'],
    usageMap: ['LOUNGE TV', 'SLAY LAB', 'CAMPAIGNS'],
    impactMap: ['EPISODE GRAPHICS', 'GUEST LOWER THIRDS'],
  },
  {
    ...card('ad-talent-community', 'COMMUNITY SPOTLIGHT', 'TALENT', 3, { status: 'draft', usedBy: ['COMMUNITY', 'SOCIAL', 'MEMBER HUB'] }),
    masterPortrait: 'MEMBER SPOTLIGHT TEMPLATE · CELEBRATORY',
    videoReference: 'SPOTLIGHT REEL — PLACEHOLDER',
    voiceSamplePlaceholder: 'VOICE SAMPLE — MEMBER SUBMITTED',
    wardrobe: ['MINIMAL', 'LAUNCH'],
    hairstyle: 'MEMBER SPECIFIC',
    makeup: 'MEMBER SPECIFIC',
    jewelry: 'MEMBER SPECIFIC',
    expressions: ['CELEBRATING', 'LUXURY SMILE', 'WELCOMING'],
    poses: ['STANDING', 'PRESENTING'],
    gestureLibrary: 'CELEBRATION WAVE',
    promptVersions: promptVersions('COMMUNITY SPOTLIGHT'),
    appearances: ['MEMBER SPOTLIGHTS', 'SOCIAL SHOUTOUTS'],
    usageMap: ['COMMUNITY', 'SOCIAL', 'MEMBER HUB', 'EMAIL'],
    impactMap: ['UGC TEMPLATES', 'MEMBER EMAILS'],
  },
];

const WARDROBE_NAMES = [
  'LUXURY EDITORIAL',
  'WEATHER HOST',
  'SCIENTIST',
  'BUILD STUDIO',
  'LAUNCH',
  'HOLIDAY',
  'EVENING',
  'MINIMAL',
];

const EXPRESSION_NAMES = [
  'LUXURY SMILE',
  'THINKING',
  'TEACHING',
  'WELCOMING',
  'CELEBRATING',
  'LISTENING',
  'NEUTRAL',
  'CAMERA READY',
];

const POSE_NAMES = [
  'STANDING',
  'SITTING',
  'POINTING',
  'PRESENTING',
  'HOLDING PRODUCT',
  'INTERVIEW',
  'WEATHER REPORT',
  'PRODUCT SHOWCASE',
];

const CAMERA_NAMES = [
  'WIDE',
  'MEDIUM',
  'CLOSE-UP',
  'HERO',
  'PRODUCT',
  'MACRO',
  'OVERHEAD',
  'POV',
];

const LIGHTING_NAMES = [
  'LUXURY EDITORIAL',
  'SOFT DAYLIGHT',
  'PRODUCT LIGHTING',
  'BROADCAST',
  'RUNWAY',
  'GOLDEN HOUR',
  'NIGHT LUXURY',
];

const MATERIAL_NAMES = [
  'WHITE MARBLE',
  'ACRYLIC GLASS',
  'CHROME',
  'DIAMONDS',
  'RED ROSES',
  'RED FOIL',
  'CRYSTAL',
  'TRANSPARENT UI PANELS',
  'BLACK THEATER UI',
  'WHITE LUXURY PAPER',
];

export const ASSET_DIRECTOR_WARDROBE: AssetDirectorCard[] = WARDROBE_NAMES.map((name, i) =>
  card(`ad-wardrobe-${i}`, name, 'WARDROBE', i, {
    promptNotes: `${name} WARDROBE — WHITE MARBLE BACKDROP · LUXURY FABRIC · CHERRY RED ACCENT`,
    usedBy: ['PSA', 'FOUNDER AVATAR', 'LUXURY STYLIST'].slice(0, 1 + (i % 3)),
  })
);

export const ASSET_DIRECTOR_EXPRESSIONS: AssetDirectorCard[] = EXPRESSION_NAMES.map((name, i) =>
  card(`ad-expression-${i}`, name, 'EXPRESSION', i, {
    promptNotes: `FACIAL EXPRESSION — ${name} · NATURAL · LUXURY EDITORIAL LIGHTING`,
    usedBy: ['PSA', 'SLAY REPORT', 'LOUNGE TV'].slice(0, 1 + (i % 2)),
  })
);

export const ASSET_DIRECTOR_POSES: AssetDirectorCard[] = POSE_NAMES.map((name, i) =>
  card(`ad-pose-${i}`, name, 'POSE', i, {
    promptNotes: `BODY POSE — ${name} · FULL BODY · ASSIGNABLE TO TALENT`,
    usedBy: ['BUILD STUDIO', 'PRODUCT STUDIO', 'RUNWAY'].slice(0, 1 + (i % 2)),
  })
);

export const ASSET_DIRECTOR_CAMERA: AssetDirectorCard[] = CAMERA_NAMES.map((name, i) =>
  card(`ad-camera-${i}`, name, 'CAMERA', i, {
    promptNotes: `CAMERA PRESET — ${name} · LENS NOTES · FRAMING GUIDE`,
    status: 'approved',
    usedBy: ['ALL STUDIOS'],
  })
);

export const ASSET_DIRECTOR_LIGHTING: AssetDirectorCard[] = LIGHTING_NAMES.map((name, i) =>
  card(`ad-lighting-${i}`, name, 'LIGHTING', i, {
    promptNotes: `LIGHTING PRESET — ${name} · KEY/FILL/RIM · MOOD NOTES`,
    status: 'approved',
    usedBy: ['STUDIO LOT', 'PRODUCT STUDIO'],
  })
);

export const ASSET_DIRECTOR_MATERIALS: AssetDirectorMaterial[] = MATERIAL_NAMES.map((name, i) => ({
  ...card(`ad-material-${i}`, name, 'MATERIAL', i, { status: 'approved' }),
  promptDescription: `${name} — LUXURY SURFACE · HIGH GLOSS · EDITORIAL GRADE`,
  usageRules: i % 2 === 0 ? 'USE FOR HERO SURFACES · BACKGROUNDS · UI PANELS' : 'USE FOR ACCENTS · PROPS · GRAPHICS ONLY',
  approvedExamples: `APPROVED IN SLAY REPORT EP 12 · PRODUCT STUDIO LAUNCH`,
  doNotUseNotes: i % 3 === 0 ? 'DO NOT MIX WITH LOW-RES TEXTURES' : 'DO NOT OVERUSE — MAX 2 PER FRAME',
}));

export const ASSET_DIRECTOR_PROPS: AssetDirectorCard[] = [
  'CHERRY RED SWATCH',
  'LACE SAMPLE BOARD',
  'LUXURY MIRROR',
  'PRODUCT PLINTH',
  'FORECAST TABLET',
  'LAB MICROSCOPE',
  'BUILD TOOL KIT',
  'RUNWAY CLUTCH',
].map((name, i) => card(`ad-prop-${i}`, name, 'PROP', i));

export const ASSET_DIRECTOR_ANIMATIONS: AssetDirectorCard[] = [
  'INTRO SWEEP',
  'OUTRO FADE',
  'IDLE AMBIENT',
  'GLASS TRANSITION',
  'LOWER THIRD IN',
  'HERO REVEAL',
].map((name, i) => card(`ad-anim-${i}`, name, 'ANIMATION', i));

export const ASSET_DIRECTOR_AUDIO: AssetDirectorCard[] = [
  'SLAY REPORT THEME',
  'LOUNGE AMBIENT',
  'LAB HUD SFX',
  'LUXURY STING',
  'MEMBER WELCOME',
].map((name, i) => card(`ad-audio-${i}`, name, 'AUDIO', i));

export const ASSET_DIRECTOR_MOODBOARDS: AssetDirectorMoodboard[] = [
  'SLAY REPORT',
  'SLAY LAB',
  'BUILD STUDIO',
  'THE VAULT',
  'LOUNGE TV',
  'MEMBERSHIP',
  'REWARDS',
  'PRODUCT LAUNCHES',
  'EMAIL TEMPLATES',
  'SOCIAL CAMPAIGNS',
].map((title, i) => ({
  id: `ad-moodboard-${i}`,
  title,
  accentHex: ['#EB1C24', '#2563EB', '#C41E3A', '#16A34A', '#CA8A04'][i % 5],
  coverSrc: ARTWORK[i % ARTWORK.length],
  notes: `${title} VISUAL DIRECTION — WHITE MARBLE · CHERRY RED · LUXURY EDITORIAL`,
  promptReferences: [`${title} MASTER PROMPT v3`, `${title} SOCIAL VARIANT`],
  visualDirection: 'APPROVED: MARBLE + GLASS + RED ACCENT · NO DARK MODE',
  images: [
    { id: `mb-${i}-1`, src: ARTWORK[0], caption: 'HERO REFERENCE' },
    { id: `mb-${i}-2`, src: ARTWORK[1], caption: 'TEXTURE REFERENCE' },
    { id: `mb-${i}-3`, src: ARTWORK[2], caption: 'TYPOGRAPHY REFERENCE' },
  ],
  status: (['approved', 'in-use', 'needs-review'] as AssetDirectorStatus[])[i % 3],
  lastUpdated: `2026-06-${10 + i}`,
}));

export const ASSET_DIRECTOR_BRAND_MATERIALS: AssetDirectorCard[] = [
  'LOGO LOCKUP',
  'LOWER THIRD KIT',
  'FORECAST GRAPHICS',
  'MEMBER BADGES',
  'SOCIAL TEMPLATES',
  'EMAIL HEADER',
].map((name, i) => card(`ad-brand-${i}`, name, 'BRAND', i, { status: 'approved' }));

export const ASSET_DIRECTOR_RELATIONSHIPS: AssetDirectorRelationship[] = [
  {
    assetId: 'ad-studio-weather',
    assetName: 'WEATHER STUDIO',
    category: 'STUDIO',
    usedBy: ['THE SLAY REPORT', 'TREND FORECAST EMAILS', 'SOCIAL CLIPS', 'LOUNGE TV', 'FUTURE MOBILE APP'],
    impacts: ['EPISODE THUMBNAILS', 'EMAIL HEROES', 'SOCIAL CLIPS', 'LOUNGE TV INTROS'],
  },
  {
    assetId: 'ad-talent-psa',
    assetName: 'PSA',
    category: 'TALENT',
    usedBy: ['PSA CHAT', 'SLAY REPORT', 'SLAY LAB', 'BUILD STUDIO', 'LOUNGE TV', 'EMAIL', 'WEBSITE'],
    impacts: ['CHAT UI', 'EPISODE INTROS', 'EMAIL HEADERS', 'WEBSITE HERO'],
  },
  {
    assetId: 'ad-material-0',
    assetName: 'WHITE MARBLE',
    category: 'MATERIAL',
    usedBy: ['ALL STUDIOS', 'EMAIL TEMPLATES', 'WEBSITE', 'SOCIAL'],
    impacts: ['BACKGROUNDS', 'UI PANELS', 'HERO SURFACES'],
  },
  {
    assetId: 'ad-wardrobe-0',
    assetName: 'LUXURY EDITORIAL',
    category: 'WARDROBE',
    usedBy: ['PSA', 'FOUNDER AVATAR', 'LUXURY STYLIST', 'RUNWAY'],
    impacts: ['ON-CAMERA LOOKS', 'CAMPAIGN STILLS'],
  },
];

export const ASSET_DIRECTOR_VERSION_HISTORY: AssetDirectorVersionEntry[] = [
  { id: 'vh-1', assetName: 'WEATHER STUDIO', category: 'STUDIO', version: 'v3.2', previousVersion: 'v3.1', changedBy: 'CREATIVE DIRECTOR', changedAt: '2026-06-28', changeSummary: 'UPDATED NIGHT VERSION PROMPT', status: 'approved' },
  { id: 'vh-2', assetName: 'PSA', category: 'TALENT', version: 'v4.0', previousVersion: 'v3.9', changedBy: 'ASSET DIRECTOR', changedAt: '2026-06-22', changeSummary: 'NEW MASTER PORTRAIT', status: 'approved' },
  { id: 'vh-3', assetName: 'WHITE MARBLE', category: 'MATERIAL', version: 'v2.1', previousVersion: 'v2.0', changedBy: 'BRAND', changedAt: '2026-06-15', changeSummary: 'USAGE RULES CLARIFIED', status: 'approved' },
  { id: 'vh-4', assetName: 'LUXURY EDITORIAL', category: 'WARDROBE', version: 'v1.3', previousVersion: 'v1.2', changedBy: 'TALENT AGENCY', changedAt: '2026-06-10', changeSummary: 'HOLIDAY VARIANT ADDED', status: 'in-use' },
  { id: 'vh-5', assetName: 'SLAY REPORT MOODBOARD', category: 'MOODBOARD', version: 'v5.0', previousVersion: 'v4.8', changedBy: 'CREATIVE DIRECTOR', changedAt: '2026-06-01', changeSummary: 'CHERRY RED DIRECTION LOCKED', status: 'approved' },
];

export const ASSET_DIRECTOR_HEALTH_QUEUE: AssetDirectorHealthEntry[] = [
  { assetId: 'ad-studio-mansion', assetName: 'FUTURE MANSION', category: 'STUDIO', indicators: ['missing-preview', 'outdated-prompt'], priority: 'medium', lastChecked: '2026-07-01' },
  { assetId: 'ad-talent-guest', assetName: 'GUEST EXPERT', category: 'TALENT', indicators: ['missing-preview', 'outdated-prompt'], priority: 'high', lastChecked: '2026-07-02' },
  { assetId: 'ad-talent-community', assetName: 'COMMUNITY SPOTLIGHT', category: 'TALENT', indicators: ['needs-video', 'missing-preview'], priority: 'medium', lastChecked: '2026-07-01' },
  { assetId: 'ad-anim-2', assetName: 'IDLE AMBIENT', category: 'ANIMATION', indicators: ['low-quality', 'needs-upscale'], priority: 'high', lastChecked: '2026-06-30' },
  { assetId: 'ad-prop-4', assetName: 'FORECAST TABLET', category: 'PROP', indicators: ['unused'], priority: 'low', lastChecked: '2026-06-28' },
  { assetId: 'ad-audio-3', assetName: 'LUXURY STING', category: 'AUDIO', indicators: ['duplicate'], priority: 'low', lastChecked: '2026-06-25' },
  { assetId: 'ad-camera-6', assetName: 'OVERHEAD', category: 'CAMERA', indicators: ['ready-for-production'], priority: 'low', lastChecked: '2026-07-03' },
  { assetId: 'ad-material-5', assetName: 'RED FOIL', category: 'MATERIAL', indicators: ['outdated-prompt'], priority: 'medium', lastChecked: '2026-06-29' },
];

export function getAssetDirectorStudioById(id: string): AssetDirectorStudioProfile | undefined {
  return ASSET_DIRECTOR_STUDIOS.find((s) => s.id === id);
}

export function getAssetDirectorTalentById(id: string): AssetDirectorTalentProfile | undefined {
  return ASSET_DIRECTOR_TALENT.find((t) => t.id === id);
}

export function getAssetDirectorSectionCards(sectionId: AssetDirectorSectionId): AssetDirectorCard[] {
  switch (sectionId) {
    case 'wardrobe':
      return ASSET_DIRECTOR_WARDROBE;
    case 'expressions':
      return ASSET_DIRECTOR_EXPRESSIONS;
    case 'poses':
      return ASSET_DIRECTOR_POSES;
    case 'camera':
      return ASSET_DIRECTOR_CAMERA;
    case 'lighting':
      return ASSET_DIRECTOR_LIGHTING;
    case 'materials':
      return ASSET_DIRECTOR_MATERIALS;
    case 'props':
      return ASSET_DIRECTOR_PROPS;
    case 'animations':
      return ASSET_DIRECTOR_ANIMATIONS;
    case 'audio':
      return ASSET_DIRECTOR_AUDIO;
    case 'brand-materials':
      return ASSET_DIRECTOR_BRAND_MATERIALS;
    default:
      return [];
  }
}

export function getAssetDirectorSectionById(id: string) {
  return ASSET_DIRECTOR_SECTIONS.find((s) => s.id === id);
}

export function assemblePromptFromAssets(selection: ContentPackAssetSelection): string {
  const parts: string[] = ['APPROVED VISUAL ASSET PROMPT ASSEMBLY — DEMO ONLY'];
  if (selection.studioId) {
    const studio = getAssetDirectorStudioById(selection.studioId);
    if (studio) parts.push(`STUDIO: ${studio.name} — ${studio.masterEnvironment}`);
  }
  if (selection.talentId) {
    const talent = getAssetDirectorTalentById(selection.talentId);
    if (talent) parts.push(`TALENT: ${talent.name} — ${talent.masterPortrait}`);
  }
  const lib = (ids: string[] | undefined, list: AssetDirectorCard[], label: string) => {
    if (!ids?.length) return;
    ids.forEach((id) => {
      const item = list.find((a) => a.id === id);
      if (item) parts.push(`${label}: ${item.name} — ${item.promptNotes ?? item.category}`);
    });
  };
  if (selection.wardrobeId) {
    const w = ASSET_DIRECTOR_WARDROBE.find((a) => a.id === selection.wardrobeId);
    if (w) parts.push(`WARDROBE: ${w.name}`);
  }
  if (selection.poseId) {
    const p = ASSET_DIRECTOR_POSES.find((a) => a.id === selection.poseId);
    if (p) parts.push(`POSE: ${p.name}`);
  }
  if (selection.expressionId) {
    const e = ASSET_DIRECTOR_EXPRESSIONS.find((a) => a.id === selection.expressionId);
    if (e) parts.push(`EXPRESSION: ${e.name}`);
  }
  if (selection.cameraId) {
    const c = ASSET_DIRECTOR_CAMERA.find((a) => a.id === selection.cameraId);
    if (c) parts.push(`CAMERA: ${c.name} — ${c.promptNotes}`);
  }
  if (selection.lightingId) {
    const l = ASSET_DIRECTOR_LIGHTING.find((a) => a.id === selection.lightingId);
    if (l) parts.push(`LIGHTING: ${l.name} — ${l.promptNotes}`);
  }
  lib(selection.materialIds, ASSET_DIRECTOR_MATERIALS, 'MATERIAL');
  lib(selection.propIds, ASSET_DIRECTOR_PROPS, 'PROP');
  if (selection.musicId) {
    const m = ASSET_DIRECTOR_AUDIO.find((a) => a.id === selection.musicId);
    if (m) parts.push(`MUSIC: ${m.name}`);
  }
  if (selection.animationId) {
    const a = ASSET_DIRECTOR_ANIMATIONS.find((a) => a.id === selection.animationId);
    if (a) parts.push(`ANIMATION: ${a.name}`);
  }
  parts.push('WHITE MARBLE · LUXURY EDITORIAL · NO AI GENERATION CONNECTED');
  return parts.join('\n');
}

export function searchAssetDirectorIndex(query: string): Array<{ id: string; label: string; category: string; route: string }> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: Array<{ id: string; label: string; category: string; route: string }> = [];
  ASSET_DIRECTOR_STUDIOS.forEach((s) => {
    if (s.name.toLowerCase().includes(q)) {
      results.push({ id: s.id, label: s.name, category: 'STUDIO', route: `/admin/studio/asset-director/studios/${s.id}` });
    }
  });
  ASSET_DIRECTOR_TALENT.forEach((t) => {
    if (t.name.toLowerCase().includes(q)) {
      results.push({ id: t.id, label: t.name, category: 'TALENT', route: `/admin/studio/asset-director/talent/${t.id}` });
    }
  });
  [...ASSET_DIRECTOR_WARDROBE, ...ASSET_DIRECTOR_MATERIALS].forEach((a) => {
    if (a.name.toLowerCase().includes(q)) {
      results.push({ id: a.id, label: a.name, category: a.category, route: `/admin/studio/asset-director/section/${a.category.toLowerCase()}` });
    }
  });
  return results.slice(0, 12);
}

export const CONTENT_PACK_ASSET_PICKER_CATEGORIES: Array<{ id: ContentPackAssetPickerCategory; label: string }> = [
  { id: 'studio', label: 'STUDIO' },
  { id: 'talent', label: 'TALENT' },
  { id: 'wardrobe', label: 'WARDROBE' },
  { id: 'pose', label: 'POSE' },
  { id: 'expression', label: 'EXPRESSION' },
  { id: 'camera', label: 'CAMERA' },
  { id: 'lighting', label: 'LIGHTING' },
  { id: 'materials', label: 'MATERIALS' },
  { id: 'props', label: 'PROPS' },
  { id: 'music', label: 'MUSIC' },
  { id: 'animation', label: 'ANIMATION' },
];

export function getPickerOptionsForCategory(
  category: ContentPackAssetPickerCategory
): Array<{ id: string; name: string; previewSrc: string }> {
  switch (category) {
    case 'studio':
      return ASSET_DIRECTOR_STUDIOS.map((s) => ({ id: s.id, name: s.name, previewSrc: s.previewSrc }));
    case 'talent':
      return ASSET_DIRECTOR_TALENT.map((t) => ({ id: t.id, name: t.name, previewSrc: t.previewSrc }));
    case 'wardrobe':
      return ASSET_DIRECTOR_WARDROBE.map((w) => ({ id: w.id, name: w.name, previewSrc: w.previewSrc }));
    case 'pose':
      return ASSET_DIRECTOR_POSES.map((p) => ({ id: p.id, name: p.name, previewSrc: p.previewSrc }));
    case 'expression':
      return ASSET_DIRECTOR_EXPRESSIONS.map((e) => ({ id: e.id, name: e.name, previewSrc: e.previewSrc }));
    case 'camera':
      return ASSET_DIRECTOR_CAMERA.map((c) => ({ id: c.id, name: c.name, previewSrc: c.previewSrc }));
    case 'lighting':
      return ASSET_DIRECTOR_LIGHTING.map((l) => ({ id: l.id, name: l.name, previewSrc: l.previewSrc }));
    case 'materials':
      return ASSET_DIRECTOR_MATERIALS.map((m) => ({ id: m.id, name: m.name, previewSrc: m.previewSrc }));
    case 'props':
      return ASSET_DIRECTOR_PROPS.map((p) => ({ id: p.id, name: p.name, previewSrc: p.previewSrc }));
    case 'music':
      return ASSET_DIRECTOR_AUDIO.map((a) => ({ id: a.id, name: a.name, previewSrc: a.previewSrc }));
    case 'animation':
      return ASSET_DIRECTOR_ANIMATIONS.map((a) => ({ id: a.id, name: a.name, previewSrc: a.previewSrc }));
    default:
      return [];
  }
}
