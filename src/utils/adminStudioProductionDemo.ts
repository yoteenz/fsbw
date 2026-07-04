/** PRODUCTION PIPELINE — Content Pack lifecycle management (CMS-ready). */

export const ADMIN_STUDIO_PRODUCTION_SUBTITLE =
  'TURNING IDEAS INTO EXPERIENCES — THE OPERATIONAL HEART OF FRONTAL SLAYER STUDIOS.';

export type ProductionDashboardSectionId =
  | 'current'
  | 'pre-production'
  | 'in-production'
  | 'post-production'
  | 'review-queue'
  | 'publishing-queue'
  | 'completed'
  | 'calendar'
  | 'asset-progress'
  | 'quality-assurance';

export const PRODUCTION_DASHBOARD_SECTIONS: Array<{
  id: ProductionDashboardSectionId;
  title: string;
  metric: string;
  description: string;
}> = [
  { id: 'current', title: 'CURRENT PRODUCTIONS', metric: '7', description: 'ACTIVE CONTENT PACKS IN PIPELINE' },
  { id: 'pre-production', title: 'PRE-PRODUCTION', metric: '3', description: 'IDEA · RESEARCH · STRATEGY · CASTING' },
  { id: 'in-production', title: 'IN PRODUCTION', metric: '2', description: 'SCRIPT · STORYBOARD · ASSET GENERATION' },
  { id: 'post-production', title: 'POST PRODUCTION', metric: '2', description: 'ASSEMBLY · EDITING · REVIEW' },
  { id: 'review-queue', title: 'REVIEW QUEUE', metric: '4', description: 'AWAITING EDITORIAL APPROVAL' },
  { id: 'publishing-queue', title: 'PUBLISHING QUEUE', metric: '3', description: 'SCHEDULED · READY TO SHIP' },
  { id: 'completed', title: 'COMPLETED', metric: '18', description: 'SHIPPED TO AUDIENCE' },
  { id: 'calendar', title: 'PRODUCTION CALENDAR', metric: '14', description: 'SHOOTS · LAUNCHES · PREMIERES' },
  { id: 'asset-progress', title: 'ASSET PROGRESS', metric: '68%', description: 'GENERATION & ASSEMBLY STATUS' },
  { id: 'quality-assurance', title: 'QUALITY ASSURANCE', metric: '82%', description: 'QA CHECKLIST COMPLETION' },
];

export type ProductionStageId =
  | 'idea'
  | 'research'
  | 'creative-strategy'
  | 'show-assignment'
  | 'studio-assignment'
  | 'casting'
  | 'script'
  | 'storyboard'
  | 'asset-generation'
  | 'assembly'
  | 'editing'
  | 'quality-review'
  | 'approval'
  | 'scheduling'
  | 'publishing'
  | 'completed';

export const PRODUCTION_KANBAN_STAGES: Array<{ id: ProductionStageId; label: string }> = [
  { id: 'idea', label: 'IDEA' },
  { id: 'research', label: 'RESEARCH' },
  { id: 'creative-strategy', label: 'CREATIVE STRATEGY' },
  { id: 'show-assignment', label: 'SHOW ASSIGNMENT' },
  { id: 'studio-assignment', label: 'STUDIO ASSIGNMENT' },
  { id: 'casting', label: 'CASTING' },
  { id: 'script', label: 'SCRIPT' },
  { id: 'storyboard', label: 'STORYBOARD' },
  { id: 'asset-generation', label: 'ASSET GENERATION' },
  { id: 'assembly', label: 'ASSEMBLY' },
  { id: 'editing', label: 'EDITING' },
  { id: 'quality-review', label: 'QUALITY REVIEW' },
  { id: 'approval', label: 'APPROVAL' },
  { id: 'scheduling', label: 'SCHEDULING' },
  { id: 'publishing', label: 'PUBLISHING' },
  { id: 'completed', label: 'COMPLETED' },
];

export type ProductionTabId =
  | 'board'
  | 'pre-production'
  | 'script'
  | 'storyboard'
  | 'shot-list'
  | 'assets'
  | 'assembly'
  | 'post'
  | 'qa'
  | 'calendar'
  | 'team'
  | 'package'
  | 'analytics';

export const PRODUCTION_TABS: Array<{ id: ProductionTabId; label: string }> = [
  { id: 'board', label: 'BOARD' },
  { id: 'pre-production', label: 'PRE-PROD' },
  { id: 'script', label: 'SCRIPT' },
  { id: 'storyboard', label: 'STORYBOARD' },
  { id: 'shot-list', label: 'SHOT LIST' },
  { id: 'assets', label: 'ASSETS' },
  { id: 'assembly', label: 'ASSEMBLY' },
  { id: 'post', label: 'POST' },
  { id: 'qa', label: 'QA' },
  { id: 'calendar', label: 'CALENDAR' },
  { id: 'team', label: 'TEAM' },
  { id: 'package', label: 'PACKAGE' },
  { id: 'analytics', label: 'ANALYTICS' },
];

export const PRODUCTION_INHERITANCE_CHAIN = [
  'CREATIVE DIRECTOR',
  'INTELLIGENCE ENGINE',
  'SHOW BIBLE',
  'STUDIO LOT',
  'TALENT AGENCY',
  'CASTING',
  'PRODUCTION PIPELINE',
  'AI GENERATION',
  'REVIEW',
  'PUBLISHING',
] as const;

export type ProductionScene = {
  id: string;
  sceneNumber: string;
  purpose: string;
  dialogue: string;
  camera: string;
  studio: string;
  talent: string;
  lighting: string;
  mood: string;
  animation: string;
  assetsRequired: string;
  promptStatus: string;
  completionStatus: string;
};

export type ProductionContentPack = {
  id: string;
  accentHex: string;
  title: string;
  stage: ProductionStageId;
  lastUpdated: string;
  /** PRE-PRODUCTION */
  topic: string;
  cdRecommendation: string;
  intelligenceSummary: string;
  confidenceScore: string;
  showName: string;
  studioName: string;
  talentName: string;
  campaignName: string;
  products: string;
  cta: string;
  distribution: string;
  /** SCRIPT ROOM */
  masterOutline: string;
  episodeScript: string;
  journalDraft: string;
  emailDraft: string;
  scriptCta: string;
  productsMentioned: string;
  rewards: string;
  psaNotes: string;
  scriptVersion: string;
  scriptApproval: string;
  /** STORYBOARD */
  scenes: ProductionScene[];
  /** SHOT LIST */
  shotHero: string;
  shotWide: string;
  shotMedium: string;
  shotCloseUp: string;
  shotProduct: string;
  shotCta: string;
  shotThumbnail: string;
  shotOutro: string;
  /** ASSET GENERATION */
  assetImages: string;
  assetVideos: string;
  assetVoice: string;
  assetMusic: string;
  assetCaptions: string;
  assetThumbnail: string;
  assetGraphics: string;
  assetLowerThirds: string;
  assetTransitions: string;
  assetBackgrounds: string;
  assetPromptStatus: string;
  assetProviderStatus: string;
  assetRetryStatus: string;
  assetVersionHistory: string;
  /** ASSEMBLY */
  assemblyTimeline: string;
  assemblyMissing: string;
  assemblyCompleted: string;
  /** POST PRODUCTION */
  postCaptions: string;
  postColor: string;
  postAudio: string;
  postBrand: string;
  postEditorial: string;
  postThumbnail: string;
  postJournal: string;
  postEmail: string;
  postSeo: string;
  /** QA */
  qaChecklist: Record<string, boolean>;
  /** CALENDAR */
  calendarToday: string;
  calendarThisWeek: string;
  calendarNextWeek: string;
  calendarLaunches: string;
  calendarDeadlines: string;
  calendarPremieres: string;
  /** TEAM (architecture) */
  assignedReviewer: string;
  teamComments: string;
  teamApprovals: string;
  teamRevisions: string;
  /** CONTENT PACKAGE */
  pkgEpisode: string;
  pkgJournal: string;
  pkgEmail: string;
  pkgCarousel: string;
  pkgInstagram: string;
  pkgTiktok: string;
  pkgPinterest: string;
  pkgPush: string;
  pkgThumbnail: string;
  pkgTranscript: string;
  pkgMetadata: string;
  pkgPromptHistory: string;
  pkgAssetHistory: string;
  pkgVersionHistory: string;
  /** ANALYTICS (demo) */
  analyticsProdTime: string;
  analyticsRevisions: string;
  analyticsApprovalTime: string;
  analyticsGenTime: string;
  analyticsAssetCompletion: string;
  analyticsBottleneck: string;
};

export const PRODUCTION_QA_ITEMS = [
  { id: 'luxury-branding', label: 'LUXURY BRANDING' },
  { id: 'grammar', label: 'GRAMMAR' },
  { id: 'product-accuracy', label: 'PRODUCT ACCURACY' },
  { id: 'cta-accuracy', label: 'CTA ACCURACY' },
  { id: 'brand-alignment', label: 'BRAND ALIGNMENT' },
  { id: 'visual-consistency', label: 'VISUAL CONSISTENCY' },
  { id: 'studio-consistency', label: 'STUDIO CONSISTENCY' },
  { id: 'talent-consistency', label: 'TALENT CONSISTENCY' },
  { id: 'prompt-validation', label: 'PROMPT VALIDATION' },
  { id: 'asset-completeness', label: 'ASSET COMPLETENESS' },
] as const;

export const PRODUCTION_ASSEMBLY_DEFAULT = `INTRO
↓
COLD OPEN
↓
SCENE 1
↓
SCENE 2
↓
SCENE 3
↓
CTA
↓
REWARD
↓
OUTRO`;

export type ProductionFieldKey = keyof Omit<ProductionContentPack, 'id' | 'accentHex' | 'stage' | 'scenes' | 'qaChecklist'>;

export type ProductionFieldGroup = { title: string; fields: Array<{ key: ProductionFieldKey; label: string; multiline?: boolean }> };

export const PRODUCTION_PREPROD_GROUPS: ProductionFieldGroup[] = [
  {
    title: 'BRIEFING',
    fields: [
      { key: 'topic', label: 'TOPIC', multiline: true },
      { key: 'cdRecommendation', label: 'CREATIVE DIRECTOR RECOMMENDATION', multiline: true },
      { key: 'intelligenceSummary', label: 'INTELLIGENCE SUMMARY', multiline: true },
      { key: 'confidenceScore', label: 'CONFIDENCE SCORE' },
    ],
  },
  {
    title: 'ASSIGNMENTS',
    fields: [
      { key: 'showName', label: 'SHOW' },
      { key: 'studioName', label: 'STUDIO' },
      { key: 'talentName', label: 'TALENT' },
      { key: 'campaignName', label: 'CAMPAIGN' },
      { key: 'products', label: 'PRODUCTS', multiline: true },
      { key: 'cta', label: 'CTA' },
      { key: 'distribution', label: 'DISTRIBUTION', multiline: true },
    ],
  },
];

export const PRODUCTION_SCRIPT_GROUPS: ProductionFieldGroup[] = [
  {
    title: 'SCRIPT ROOM',
    fields: [
      { key: 'masterOutline', label: 'MASTER OUTLINE', multiline: true },
      { key: 'episodeScript', label: 'EPISODE SCRIPT', multiline: true },
      { key: 'journalDraft', label: 'JOURNAL DRAFT', multiline: true },
      { key: 'emailDraft', label: 'EMAIL DRAFT', multiline: true },
      { key: 'scriptCta', label: 'CTA' },
      { key: 'productsMentioned', label: 'PRODUCTS MENTIONED', multiline: true },
      { key: 'rewards', label: 'REWARDS', multiline: true },
      { key: 'psaNotes', label: 'PSA NOTES', multiline: true },
      { key: 'scriptVersion', label: 'VERSION' },
      { key: 'scriptApproval', label: 'APPROVAL STATUS' },
    ],
  },
];

export const PRODUCTION_ASSET_GROUPS: ProductionFieldGroup[] = [
  {
    title: 'GENERATION STATUS',
    fields: [
      { key: 'assetImages', label: 'IMAGES' },
      { key: 'assetVideos', label: 'VIDEOS' },
      { key: 'assetVoice', label: 'VOICE' },
      { key: 'assetMusic', label: 'MUSIC' },
      { key: 'assetCaptions', label: 'CAPTIONS' },
      { key: 'assetThumbnail', label: 'THUMBNAIL' },
      { key: 'assetGraphics', label: 'GRAPHICS' },
      { key: 'assetLowerThirds', label: 'LOWER THIRDS' },
      { key: 'assetTransitions', label: 'TRANSITIONS' },
      { key: 'assetBackgrounds', label: 'BACKGROUND ASSETS' },
      { key: 'assetPromptStatus', label: 'PROMPT STATUS' },
      { key: 'assetProviderStatus', label: 'PROVIDER STATUS' },
      { key: 'assetRetryStatus', label: 'RETRY STATUS' },
      { key: 'assetVersionHistory', label: 'VERSION HISTORY', multiline: true },
    ],
  },
];

export const PRODUCTION_POST_GROUPS: ProductionFieldGroup[] = [
  {
    title: 'POST PRODUCTION REVIEW',
    fields: [
      { key: 'postCaptions', label: 'CAPTIONS' },
      { key: 'postColor', label: 'COLOR REVIEW' },
      { key: 'postAudio', label: 'AUDIO REVIEW' },
      { key: 'postBrand', label: 'BRAND REVIEW' },
      { key: 'postEditorial', label: 'EDITORIAL REVIEW' },
      { key: 'postThumbnail', label: 'THUMBNAIL REVIEW' },
      { key: 'postJournal', label: 'JOURNAL REVIEW' },
      { key: 'postEmail', label: 'EMAIL REVIEW' },
      { key: 'postSeo', label: 'SEO REVIEW' },
    ],
  },
];

export const PRODUCTION_PACKAGE_GROUPS: ProductionFieldGroup[] = [
  {
    title: 'CONTENT PACKAGE',
    fields: [
      { key: 'pkgEpisode', label: 'EPISODE' },
      { key: 'pkgJournal', label: 'JOURNAL' },
      { key: 'pkgEmail', label: 'EMAIL' },
      { key: 'pkgCarousel', label: 'CAROUSEL' },
      { key: 'pkgInstagram', label: 'INSTAGRAM' },
      { key: 'pkgTiktok', label: 'TIKTOK' },
      { key: 'pkgPinterest', label: 'PINTEREST' },
      { key: 'pkgPush', label: 'PUSH' },
      { key: 'pkgThumbnail', label: 'THUMBNAIL' },
      { key: 'pkgTranscript', label: 'TRANSCRIPT' },
      { key: 'pkgMetadata', label: 'METADATA', multiline: true },
      { key: 'pkgPromptHistory', label: 'PROMPT HISTORY', multiline: true },
      { key: 'pkgAssetHistory', label: 'ASSET HISTORY', multiline: true },
      { key: 'pkgVersionHistory', label: 'VERSION HISTORY', multiline: true },
    ],
  },
];

function defaultQa(): Record<string, boolean> {
  return Object.fromEntries(PRODUCTION_QA_ITEMS.map((i) => [i.id, false]));
}

function defaultScenes(): ProductionScene[] {
  return [
    {
      id: 'sc-1',
      sceneNumber: '1',
      purpose: 'COLD OPEN HOOK',
      dialogue: 'OPEN ON TREND FORECAST',
      camera: 'WIDE MASTER',
      studio: 'WEATHER STUDIO',
      talent: 'BEAUTY REPORTER',
      lighting: 'NEWS BROADCAST',
      mood: 'CONFIDENT ENERGY',
      animation: 'RED WIPE IN',
      assetsRequired: 'FORECAST GRAPHIC · LOWER THIRD',
      promptStatus: 'READY',
      completionStatus: 'IN PROGRESS',
    },
    {
      id: 'sc-2',
      sceneNumber: '2',
      purpose: 'MAIN SEGMENT',
      dialogue: 'PSA TIP + PRODUCT SPOTLIGHT',
      camera: 'MEDIUM',
      studio: 'PRODUCT STUDIO',
      talent: 'PSA',
      lighting: 'PRODUCT LIGHTING',
      mood: 'WARM EDUCATOR',
      animation: 'SUBTLE PUSH',
      assetsRequired: 'UNIT HERO · CTA LOWER THIRD',
      promptStatus: 'QUEUED',
      completionStatus: 'PENDING',
    },
  ];
}

function createPack(partial: Partial<ProductionContentPack> & Pick<ProductionContentPack, 'id' | 'title' | 'accentHex'>): ProductionContentPack {
  return {
    stage: 'idea',
    lastUpdated: '2026-07-04',
    topic: '',
    cdRecommendation: '',
    intelligenceSummary: '',
    confidenceScore: '0%',
    showName: '',
    studioName: '',
    talentName: '',
    campaignName: '',
    products: '',
    cta: 'WATCH FULL EPISODE',
    distribution: 'LOUNGE TV · EMAIL · SOCIAL',
    masterOutline: '',
    episodeScript: '',
    journalDraft: '',
    emailDraft: '',
    scriptCta: '',
    productsMentioned: '',
    rewards: '',
    psaNotes: '',
    scriptVersion: 'v0.1',
    scriptApproval: 'DRAFT',
    scenes: defaultScenes(),
    shotHero: 'HOST HERO — RULE OF THIRDS',
    shotWide: 'STUDIO WIDE ESTABLISHING',
    shotMedium: 'HOST MEDIUM — CONVERSATIONAL',
    shotCloseUp: 'PRODUCT CLOSE — MACRO DETAIL',
    shotProduct: 'UNIT HERO — 3-ANGLE',
    shotCta: 'CTA FULL FRAME — RED ACCENT',
    shotThumbnail: 'THUMBNAIL HERO — HANDWRITTEN TITLE',
    shotOutro: 'OUTRO HOLD — LOGO + CTA',
    assetImages: 'PENDING',
    assetVideos: 'PENDING',
    assetVoice: 'PENDING',
    assetMusic: 'PENDING',
    assetCaptions: 'PENDING',
    assetThumbnail: 'PENDING',
    assetGraphics: 'PENDING',
    assetLowerThirds: 'PENDING',
    assetTransitions: 'PENDING',
    assetBackgrounds: 'PENDING',
    assetPromptStatus: 'ASSEMBLED — NOT CONNECTED',
    assetProviderStatus: 'NOT_CONNECTED',
    assetRetryStatus: 'NONE',
    assetVersionHistory: 'v0.1 — INITIAL',
    assemblyTimeline: PRODUCTION_ASSEMBLY_DEFAULT,
    assemblyMissing: 'SCENE 2 B-ROLL · THUMBNAIL FINAL',
    assemblyCompleted: 'INTRO · COLD OPEN · SCENE 1',
    postCaptions: 'PENDING',
    postColor: 'PENDING',
    postAudio: 'PENDING',
    postBrand: 'PENDING',
    postEditorial: 'PENDING',
    postThumbnail: 'PENDING',
    postJournal: 'PENDING',
    postEmail: 'PENDING',
    postSeo: 'PENDING',
    qaChecklist: defaultQa(),
    calendarToday: '',
    calendarThisWeek: '',
    calendarNextWeek: '',
    calendarLaunches: '',
    calendarDeadlines: '',
    calendarPremieres: '',
    assignedReviewer: 'EDITORIAL — TBD',
    teamComments: 'ARCHITECTURE ONLY — NO COLLAB YET',
    teamApprovals: 'PENDING',
    teamRevisions: '0',
    pkgEpisode: 'DRAFT',
    pkgJournal: 'DRAFT',
    pkgEmail: 'DRAFT',
    pkgCarousel: 'DRAFT',
    pkgInstagram: 'DRAFT',
    pkgTiktok: 'DRAFT',
    pkgPinterest: 'DRAFT',
    pkgPush: 'DRAFT',
    pkgThumbnail: 'DRAFT',
    pkgTranscript: 'DRAFT',
    pkgMetadata: '',
    pkgPromptHistory: '',
    pkgAssetHistory: '',
    pkgVersionHistory: 'v0.1',
    analyticsProdTime: '4.2 DAYS',
    analyticsRevisions: '2',
    analyticsApprovalTime: '18 HRS',
    analyticsGenTime: '6 HRS',
    analyticsAssetCompletion: '45%',
    analyticsBottleneck: 'ASSET GENERATION',
    ...partial,
  };
}

export const ADMIN_STUDIO_PRODUCTION_DEFAULTS: ProductionContentPack[] = [
  createPack({
    id: 'pack-slay-report-13',
    title: 'SLAY REPORT EP 13 — CHERRY RED FORECAST',
    accentHex: '#EB1C24',
    stage: 'asset-generation',
    topic: 'CHERRY RED TREND FORECAST · FRIDAY PREMIERE',
    cdRecommendation: 'THE SLAY REPORT · WEATHER STUDIO · BEAUTY REPORTER',
    intelligenceSummary: 'HIGH CONFIDENCE — TREND SIGNAL FROM 4 CONNECTORS',
    confidenceScore: '87%',
    showName: 'THE SLAY REPORT',
    studioName: 'THE WEATHER STUDIO',
    talentName: 'BEAUTY REPORTER',
    campaignName: 'SUMMER SLAY',
    products: 'NOIR UNIT · CHERRY RED SWATCH',
    assetImages: '6/8 COMPLETE',
    assetVideos: '2/4 COMPLETE',
    assetVoice: 'QUEUED',
    analyticsAssetCompletion: '68%',
    qaChecklist: { ...defaultQa(), 'brand-alignment': true, 'visual-consistency': true },
  }),
  createPack({
    id: 'pack-slay-lab-8',
    title: 'SLAY LAB EP 8 — LACE TENSION',
    accentHex: '#C41E3A',
    stage: 'storyboard',
    topic: 'LACE TENSION EXPERIMENT',
    showName: 'SLAY LAB',
    studioName: 'THE LAB STUDIO',
    talentName: 'HAIR SCIENTIST · PSA',
    confidenceScore: '72%',
    scriptApproval: 'IN REVIEW',
    analyticsAssetCompletion: '22%',
  }),
  createPack({
    id: 'pack-psa-22',
    title: 'PSA ANALYZES EP 22',
    accentHex: '#EB1C24',
    stage: 'quality-review',
    topic: 'MEMBER LOOK BREAKDOWN',
    showName: 'PSA ANALYZES',
    studioName: 'PSA STUDIO',
    talentName: 'PSA',
    postBrand: 'APPROVED',
    postEditorial: 'IN REVIEW',
    analyticsAssetCompletion: '91%',
    qaChecklist: { ...defaultQa(), 'luxury-branding': true, 'grammar': true, 'product-accuracy': true, 'talent-consistency': true },
  }),
  createPack({
    id: 'pack-campaign-summer',
    title: 'SUMMER LAUNCH MANIFESTO',
    accentHex: '#EB1C24',
    stage: 'scheduling',
    topic: 'SUMMER CAMPAIGN CINEMATIC',
    showName: 'CAMPAIGN FILMS',
    studioName: 'CAMPAIGN STUDIO',
    talentName: 'CAMPAIGN TALENT',
    calendarLaunches: '2026-08-01',
    pkgEpisode: 'LOCKED',
    pkgThumbnail: 'APPROVED',
    analyticsAssetCompletion: '100%',
  }),
  createPack({
    id: 'pack-build-5',
    title: 'BUILD STUDIO EP 5 — NOIR PREVIEW',
    accentHex: '#8B0000',
    stage: 'casting',
    topic: 'BUILD-A-WIG NOIR CUSTOM',
    showName: 'BUILD STUDIO',
    studioName: 'THE BUILD STUDIO',
    talentName: 'BUILD SPECIALIST',
    confidenceScore: '65%',
  }),
  createPack({
    id: 'pack-member-brief',
    title: 'MEMBER BRIEFING — JULY',
    accentHex: '#EB1C24',
    stage: 'completed',
    topic: 'MEMBER REWARDS UPDATE',
    showName: 'MEMBER BRIEFINGS',
    studioName: 'THE NEWSROOM',
    talentName: 'PSA',
    scriptApproval: 'APPROVED',
    analyticsProdTime: '2.8 DAYS',
    analyticsAssetCompletion: '100%',
    pkgEpisode: 'SHIPPED',
    pkgEmail: 'SHIPPED',
  }),
  createPack({
    id: 'pack-idea-new',
    title: 'NEW IDEA — HUMIDITY ALERT SPECIAL',
    accentHex: '#4A90D9',
    stage: 'idea',
    topic: 'HUMIDITY ALERT DEEP DIVE',
    confidenceScore: '54%',
  }),
];

export function getProductionPackById(id: string): ProductionContentPack | undefined {
  return ADMIN_STUDIO_PRODUCTION_DEFAULTS.find((p) => p.id === id);
}

export function createBlankProductionPack(id: string, title: string): ProductionContentPack {
  return createPack({ id, title: title.toUpperCase(), accentHex: '#EB1C24', stage: 'idea', topic: 'NEW CONTENT PACK' });
}

export function getQaCompletionPercent(qa: Record<string, boolean>): number {
  const total = PRODUCTION_QA_ITEMS.length;
  const done = PRODUCTION_QA_ITEMS.filter((i) => qa[i.id]).length;
  return Math.round((done / total) * 100);
}

export function stageIndex(stage: ProductionStageId): number {
  return PRODUCTION_KANBAN_STAGES.findIndex((s) => s.id === stage);
}
