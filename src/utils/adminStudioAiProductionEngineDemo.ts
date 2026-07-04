/** AI PRODUCTION ENGINE — departmental execution layer (CMS-ready). */

export const ADMIN_STUDIO_AI_PRODUCTION_ENGINE_SUBTITLE =
  'TURNING STRATEGY INTO PRODUCTION — THE EXECUTION TEAM OF FRONTAL SLAYER STUDIOS.';

export type AiProductionDepartmentId =
  | 'research'
  | 'writing'
  | 'creative'
  | 'visual'
  | 'voice'
  | 'editorial'
  | 'quality-control'
  | 'publishing';

export type AiProductionDepartmentStatus =
  | 'waiting'
  | 'in-progress'
  | 'generating'
  | 'pending'
  | 'complete'
  | 'queued'
  | 'paused'
  | 'approved'
  | 'rejected'
  | 'skipped';

export type AiProductionRunStatus = 'draft' | 'running' | 'paused' | 'draft-complete' | 'rejected';

export type AiProductionProviderId = 'openai' | 'fal' | 'openart' | 'voice' | 'resend' | 'future';

export type AiProductionDepartmentState = {
  status: AiProductionDepartmentStatus;
  progress: number;
  internalProvider: AiProductionProviderId;
  lastUpdated: string;
};

export type AiProductionPromptTrace = {
  id: string;
  assetLabel: string;
  promptVersion: string;
  providerUsed: AiProductionProviderId;
  generationTime: string;
  dependencies: string;
  relatedShow: string;
  relatedStudio: string;
  relatedTalent: string;
  relatedCampaign: string;
  contentPack: string;
  versionHistory: string;
};

export const AI_PRODUCTION_DEPARTMENTS: Array<{
  id: AiProductionDepartmentId;
  title: string;
  metric: string;
  description: string;
  responsibilities: string[];
}> = [
  {
    id: 'research',
    title: 'RESEARCH DEPARTMENT',
    metric: '12',
    description: 'TOPIC · REFERENCES · BRIEF',
    responsibilities: ['RESEARCH TOPIC', 'GATHER REFERENCES', 'ANALYZE BRAND BRAIN', 'READ INTELLIGENCE ENGINE', 'READ PRODUCT KNOWLEDGE', 'READ SHOW BIBLE', 'GENERATE PRODUCTION BRIEF'],
  },
  {
    id: 'writing',
    title: 'WRITING DEPARTMENT',
    metric: '9',
    description: 'SCRIPTS · JOURNAL · EMAIL · SEO',
    responsibilities: ['EPISODE OUTLINE', 'EPISODE SCRIPT', 'JOURNAL', 'EMAIL', 'PUSH NOTIFICATION', 'SEO', 'TRANSCRIPT', 'CAPTIONS', 'CTA', 'PRODUCT MENTIONS'],
  },
  {
    id: 'creative',
    title: 'CREATIVE DEPARTMENT',
    metric: '9',
    description: 'SCENES · CAMERA · TALENT',
    responsibilities: ['SCENE BREAKDOWN', 'CAMERA PLAN', 'STUDIO SELECTION', 'TALENT SELECTION', 'LIGHTING', 'ANIMATION', 'TRANSITIONS', 'MOOD', 'MUSIC STYLE'],
  },
  {
    id: 'visual',
    title: 'VISUAL DEPARTMENT',
    metric: '7',
    description: 'PROMPTS · THUMBNAILS · GRAPHICS',
    responsibilities: ['IMAGE PROMPTS', 'VIDEO PROMPTS', 'THUMBNAIL PROMPTS', 'ENVIRONMENT PROMPTS', 'MARKETING GRAPHICS', 'PRODUCT ASSETS', 'BACKGROUND ASSETS'],
  },
  {
    id: 'voice',
    title: 'VOICE DEPARTMENT',
    metric: '7',
    description: 'NARRATION · PSA · TIMING',
    responsibilities: ['NARRATION', 'PSA DIALOGUE', 'VOICEOVER', 'TIMING', 'PAUSES', 'PRONUNCIATION', 'INTRO', 'OUTRO'],
  },
  {
    id: 'editorial',
    title: 'EDITORIAL DEPARTMENT',
    metric: '8',
    description: 'TONE · ACCURACY · CONSISTENCY',
    responsibilities: ['GRAMMAR', 'LUXURY TONE', 'BRAND VOICE', 'PRODUCT ACCURACY', 'CTA ACCURACY', 'FORMATTING', 'READING LEVEL', 'CONSISTENCY'],
  },
  {
    id: 'quality-control',
    title: 'QUALITY CONTROL',
    metric: '9',
    description: 'VALIDATION · SCORE · REVISIONS',
    responsibilities: ['BRAND ALIGNMENT', 'SHOW RULES', 'STUDIO RULES', 'TALENT RULES', 'PROMPT COMPLETENESS', 'ASSET COMPLETENESS', 'CONTENT PACK COMPLETENESS', 'PRODUCT ACCURACY', 'DISTRIBUTION TARGETS'],
  },
  {
    id: 'publishing',
    title: 'PUBLISHING DEPARTMENT',
    metric: '10',
    description: 'CHANNEL PREP · MANUAL SHIP',
    responsibilities: ['LOUNGE TV', 'JOURNAL', 'EMAIL', 'INSTAGRAM', 'TIKTOK', 'PINTEREST', 'PUSH NOTIFICATION', 'SEO', 'WEBSITE', 'DESKTOP MANSION (FUTURE)', 'MOBILE APP (FUTURE)'],
  },
];

export const AI_PRODUCTION_FLOW_STEPS: Array<{ id: AiProductionDepartmentId; label: string }> = [
  { id: 'research', label: 'RESEARCH' },
  { id: 'writing', label: 'WRITING' },
  { id: 'creative', label: 'CREATIVE' },
  { id: 'visual', label: 'VISUAL' },
  { id: 'voice', label: 'VOICE' },
  { id: 'editorial', label: 'EDITORIAL' },
  { id: 'quality-control', label: 'QUALITY CONTROL' },
  { id: 'publishing', label: 'PUBLISHING' },
];

export const AI_PRODUCTION_INHERITANCE_CHAIN = [
  'BRAND BRAIN',
  'CREATIVE DIRECTOR',
  'SHOW BIBLE',
  'STUDIO LOT',
  'TALENT AGENCY',
  'CASTING',
  'PRODUCTION PIPELINE',
  'AI PRODUCTION ENGINE',
  'REVIEW',
  'PUBLISHING',
] as const;

export const AI_PRODUCTION_QUALITY_THRESHOLD = 85;

export const AI_PRODUCTION_INTERNAL_PROVIDERS: Array<{
  id: AiProductionProviderId;
  label: string;
  departments: AiProductionDepartmentId[];
}> = [
  { id: 'openai', label: 'OPENAI', departments: ['research', 'writing', 'creative', 'editorial'] },
  { id: 'fal', label: 'FAL', departments: ['visual'] },
  { id: 'openart', label: 'OPENART', departments: ['visual'] },
  { id: 'voice', label: 'VOICE PROVIDER', departments: ['voice'] },
  { id: 'resend', label: 'RESEND', departments: ['publishing'] },
  { id: 'future', label: 'FUTURE AI PROVIDERS', departments: [] },
];

export const DEPARTMENT_DEFAULT_PROVIDER: Record<AiProductionDepartmentId, AiProductionProviderId> = {
  research: 'openai',
  writing: 'openai',
  creative: 'openai',
  visual: 'fal',
  voice: 'voice',
  editorial: 'openai',
  'quality-control': 'openai',
  publishing: 'resend',
};

export const DEPARTMENT_STATUS_LABELS: Record<AiProductionDepartmentStatus, string> = {
  waiting: 'WAITING',
  'in-progress': 'IN PROGRESS',
  generating: 'GENERATING',
  pending: 'PENDING',
  complete: 'COMPLETE',
  queued: 'QUEUED',
  paused: 'PAUSED',
  approved: 'APPROVED',
  rejected: 'REJECTED',
  skipped: 'SKIPPED',
};

export type AiProductionTabId =
  | 'monitor'
  | 'research'
  | 'writing'
  | 'creative'
  | 'visual'
  | 'voice'
  | 'editorial'
  | 'quality-control'
  | 'publishing'
  | 'traceability'
  | 'controls';

export const AI_PRODUCTION_TABS: Array<{ id: AiProductionTabId; label: string }> = [
  { id: 'monitor', label: 'MONITOR' },
  { id: 'research', label: 'RESEARCH' },
  { id: 'writing', label: 'WRITING' },
  { id: 'creative', label: 'CREATIVE' },
  { id: 'visual', label: 'VISUAL' },
  { id: 'voice', label: 'VOICE' },
  { id: 'editorial', label: 'EDITORIAL' },
  { id: 'quality-control', label: 'QUALITY' },
  { id: 'publishing', label: 'PUBLISHING' },
  { id: 'traceability', label: 'TRACE' },
  { id: 'controls', label: 'CONTROLS' },
];

export type AiProductionFieldKey = keyof Omit<
  AiProductionRun,
  'id' | 'accentHex' | 'runStatus' | 'currentDepartment' | 'departments' | 'promptTraces' | 'qualityScore' | 'qualityRevisionNote'
>;

export type AiProductionFieldGroup = {
  title: string;
  fields: Array<{ key: AiProductionFieldKey; label: string; multiline?: boolean }>;
};

export type AiProductionRun = {
  id: string;
  accentHex: string;
  title: string;
  contentPackRef: string;
  runStatus: AiProductionRunStatus;
  currentDepartment: AiProductionDepartmentId;
  lastUpdated: string;
  showName: string;
  studioName: string;
  talentName: string;
  campaignName: string;
  departments: Record<AiProductionDepartmentId, AiProductionDepartmentState>;
  qualityScore: number;
  qualityRevisionNote: string;
  promptTraces: AiProductionPromptTrace[];
  /** RESEARCH */
  researchTopic: string;
  researchReferences: string;
  researchBrandBrain: string;
  researchIntelligence: string;
  researchProductKnowledge: string;
  researchShowBible: string;
  researchBrief: string;
  /** WRITING */
  writingEpisodeOutline: string;
  writingEpisodeScript: string;
  writingJournal: string;
  writingEmail: string;
  writingPush: string;
  writingSeo: string;
  writingTranscript: string;
  writingCaptions: string;
  writingCta: string;
  writingProducts: string;
  /** CREATIVE */
  creativeSceneBreakdown: string;
  creativeCameraPlan: string;
  creativeStudioSelection: string;
  creativeTalentSelection: string;
  creativeLighting: string;
  creativeAnimation: string;
  creativeTransitions: string;
  creativeMood: string;
  creativeMusicStyle: string;
  /** VISUAL */
  visualImagePrompts: string;
  visualVideoPrompts: string;
  visualThumbnailPrompts: string;
  visualEnvironmentPrompts: string;
  visualMarketingGraphics: string;
  visualProductAssets: string;
  visualBackgroundAssets: string;
  /** VOICE */
  voiceNarration: string;
  voicePsaDialogue: string;
  voiceVoiceover: string;
  voiceTiming: string;
  voicePauses: string;
  voicePronunciation: string;
  voiceIntro: string;
  voiceOutro: string;
  /** EDITORIAL */
  editorialGrammar: string;
  editorialLuxuryTone: string;
  editorialBrandVoice: string;
  editorialProductAccuracy: string;
  editorialCtaAccuracy: string;
  editorialFormatting: string;
  editorialReadingLevel: string;
  editorialConsistency: string;
  editorialApproval: string;
  /** QUALITY */
  qualityBrandAlignment: string;
  qualityShowRules: string;
  qualityStudioRules: string;
  qualityTalentRules: string;
  qualityPromptCompleteness: string;
  qualityAssetCompleteness: string;
  qualityPackCompleteness: string;
  qualityProductAccuracy: string;
  qualityDistributionTargets: string;
  /** PUBLISHING */
  publishingLoungeTv: string;
  publishingJournal: string;
  publishingEmail: string;
  publishingInstagram: string;
  publishingTiktok: string;
  publishingPinterest: string;
  publishingPush: string;
  publishingSeo: string;
  publishingWebsite: string;
  publishingMansion: string;
  publishingMobileApp: string;
};

export const AI_PRODUCTION_RESEARCH_GROUPS: AiProductionFieldGroup[] = [
  {
    title: 'RESEARCH DEPARTMENT',
    fields: [
      { key: 'researchTopic', label: 'RESEARCH TOPIC', multiline: true },
      { key: 'researchReferences', label: 'REFERENCES', multiline: true },
      { key: 'researchBrandBrain', label: 'BRAND BRAIN ANALYSIS', multiline: true },
      { key: 'researchIntelligence', label: 'INTELLIGENCE ENGINE', multiline: true },
      { key: 'researchProductKnowledge', label: 'PRODUCT KNOWLEDGE', multiline: true },
      { key: 'researchShowBible', label: 'SHOW BIBLE', multiline: true },
      { key: 'researchBrief', label: 'PRODUCTION BRIEF', multiline: true },
    ],
  },
];

export const AI_PRODUCTION_WRITING_GROUPS: AiProductionFieldGroup[] = [
  {
    title: 'WRITING DEPARTMENT',
    fields: [
      { key: 'writingEpisodeOutline', label: 'EPISODE OUTLINE', multiline: true },
      { key: 'writingEpisodeScript', label: 'EPISODE SCRIPT', multiline: true },
      { key: 'writingJournal', label: 'JOURNAL', multiline: true },
      { key: 'writingEmail', label: 'EMAIL', multiline: true },
      { key: 'writingPush', label: 'PUSH NOTIFICATION', multiline: true },
      { key: 'writingSeo', label: 'SEO', multiline: true },
      { key: 'writingTranscript', label: 'TRANSCRIPT', multiline: true },
      { key: 'writingCaptions', label: 'CAPTIONS', multiline: true },
      { key: 'writingCta', label: 'CTA' },
      { key: 'writingProducts', label: 'PRODUCT MENTIONS', multiline: true },
    ],
  },
];

export const AI_PRODUCTION_CREATIVE_GROUPS: AiProductionFieldGroup[] = [
  {
    title: 'CREATIVE DEPARTMENT',
    fields: [
      { key: 'creativeSceneBreakdown', label: 'SCENE BREAKDOWN', multiline: true },
      { key: 'creativeCameraPlan', label: 'CAMERA PLAN', multiline: true },
      { key: 'creativeStudioSelection', label: 'STUDIO SELECTION' },
      { key: 'creativeTalentSelection', label: 'TALENT SELECTION' },
      { key: 'creativeLighting', label: 'LIGHTING' },
      { key: 'creativeAnimation', label: 'ANIMATION' },
      { key: 'creativeTransitions', label: 'TRANSITIONS' },
      { key: 'creativeMood', label: 'MOOD' },
      { key: 'creativeMusicStyle', label: 'MUSIC STYLE' },
    ],
  },
];

export const AI_PRODUCTION_VISUAL_GROUPS: AiProductionFieldGroup[] = [
  {
    title: 'VISUAL DEPARTMENT',
    fields: [
      { key: 'visualImagePrompts', label: 'IMAGE PROMPTS', multiline: true },
      { key: 'visualVideoPrompts', label: 'VIDEO PROMPTS', multiline: true },
      { key: 'visualThumbnailPrompts', label: 'THUMBNAIL PROMPTS', multiline: true },
      { key: 'visualEnvironmentPrompts', label: 'ENVIRONMENT PROMPTS', multiline: true },
      { key: 'visualMarketingGraphics', label: 'MARKETING GRAPHICS', multiline: true },
      { key: 'visualProductAssets', label: 'PRODUCT ASSETS', multiline: true },
      { key: 'visualBackgroundAssets', label: 'BACKGROUND ASSETS', multiline: true },
    ],
  },
];

export const AI_PRODUCTION_VOICE_GROUPS: AiProductionFieldGroup[] = [
  {
    title: 'VOICE DEPARTMENT',
    fields: [
      { key: 'voiceNarration', label: 'NARRATION', multiline: true },
      { key: 'voicePsaDialogue', label: 'PSA DIALOGUE', multiline: true },
      { key: 'voiceVoiceover', label: 'VOICEOVER', multiline: true },
      { key: 'voiceTiming', label: 'TIMING' },
      { key: 'voicePauses', label: 'PAUSES' },
      { key: 'voicePronunciation', label: 'PRONUNCIATION', multiline: true },
      { key: 'voiceIntro', label: 'INTRO' },
      { key: 'voiceOutro', label: 'OUTRO' },
    ],
  },
];

export const AI_PRODUCTION_EDITORIAL_GROUPS: AiProductionFieldGroup[] = [
  {
    title: 'EDITORIAL DEPARTMENT',
    fields: [
      { key: 'editorialGrammar', label: 'GRAMMAR' },
      { key: 'editorialLuxuryTone', label: 'LUXURY TONE' },
      { key: 'editorialBrandVoice', label: 'BRAND VOICE' },
      { key: 'editorialProductAccuracy', label: 'PRODUCT ACCURACY' },
      { key: 'editorialCtaAccuracy', label: 'CTA ACCURACY' },
      { key: 'editorialFormatting', label: 'FORMATTING' },
      { key: 'editorialReadingLevel', label: 'READING LEVEL' },
      { key: 'editorialConsistency', label: 'CONSISTENCY' },
      { key: 'editorialApproval', label: 'EDITORIAL APPROVAL' },
    ],
  },
];

export const AI_PRODUCTION_QUALITY_GROUPS: AiProductionFieldGroup[] = [
  {
    title: 'QUALITY CONTROL',
    fields: [
      { key: 'qualityBrandAlignment', label: 'BRAND ALIGNMENT' },
      { key: 'qualityShowRules', label: 'SHOW RULES' },
      { key: 'qualityStudioRules', label: 'STUDIO RULES' },
      { key: 'qualityTalentRules', label: 'TALENT RULES' },
      { key: 'qualityPromptCompleteness', label: 'PROMPT COMPLETENESS' },
      { key: 'qualityAssetCompleteness', label: 'ASSET COMPLETENESS' },
      { key: 'qualityPackCompleteness', label: 'CONTENT PACK COMPLETENESS' },
      { key: 'qualityProductAccuracy', label: 'PRODUCT ACCURACY' },
      { key: 'qualityDistributionTargets', label: 'DISTRIBUTION TARGETS' },
    ],
  },
];

export const AI_PRODUCTION_PUBLISHING_GROUPS: AiProductionFieldGroup[] = [
  {
    title: 'PUBLISHING DEPARTMENT',
    fields: [
      { key: 'publishingLoungeTv', label: 'LOUNGE TV' },
      { key: 'publishingJournal', label: 'JOURNAL' },
      { key: 'publishingEmail', label: 'EMAIL' },
      { key: 'publishingInstagram', label: 'INSTAGRAM' },
      { key: 'publishingTiktok', label: 'TIKTOK' },
      { key: 'publishingPinterest', label: 'PINTEREST' },
      { key: 'publishingPush', label: 'PUSH NOTIFICATION' },
      { key: 'publishingSeo', label: 'SEO' },
      { key: 'publishingWebsite', label: 'WEBSITE' },
      { key: 'publishingMansion', label: 'DESKTOP MANSION (FUTURE)' },
      { key: 'publishingMobileApp', label: 'MOBILE APP (FUTURE)' },
    ],
  },
];

function defaultDepartments(overrides?: Partial<Record<AiProductionDepartmentId, Partial<AiProductionDepartmentState>>>): Record<AiProductionDepartmentId, AiProductionDepartmentState> {
  const base = (id: AiProductionDepartmentId, status: AiProductionDepartmentStatus, progress: number): AiProductionDepartmentState => ({
    status,
    progress,
    internalProvider: DEPARTMENT_DEFAULT_PROVIDER[id],
    lastUpdated: 'JUL 4',
    ...overrides?.[id],
  });
  return {
    research: base('research', 'waiting', 0),
    writing: base('writing', 'waiting', 0),
    creative: base('creative', 'waiting', 0),
    visual: base('visual', 'waiting', 0),
    voice: base('voice', 'waiting', 0),
    editorial: base('editorial', 'waiting', 0),
    'quality-control': base('quality-control', 'waiting', 0),
    publishing: base('publishing', 'waiting', 0),
  };
}

function defaultTraces(run: Partial<AiProductionRun>): AiProductionPromptTrace[] {
  return [
    {
      id: 'trace-1',
      assetLabel: 'EPISODE SCRIPT',
      promptVersion: 'v2.1',
      providerUsed: 'openai',
      generationTime: '4.2 MIN',
      dependencies: 'SHOW BIBLE · BRAND BRAIN · CD REC',
      relatedShow: run.showName ?? '—',
      relatedStudio: run.studioName ?? '—',
      relatedTalent: run.talentName ?? '—',
      relatedCampaign: run.campaignName ?? '—',
      contentPack: run.title ?? '—',
      versionHistory: 'v1.0 → v1.8 → v2.1',
    },
    {
      id: 'trace-2',
      assetLabel: 'THUMBNAIL PROMPT',
      promptVersion: 'v1.4',
      providerUsed: 'fal',
      generationTime: '2.8 MIN',
      dependencies: 'STUDIO LOT · TALENT AGENCY · SHOW BIBLE',
      relatedShow: run.showName ?? '—',
      relatedStudio: run.studioName ?? '—',
      relatedTalent: run.talentName ?? '—',
      relatedCampaign: run.campaignName ?? '—',
      contentPack: run.title ?? '—',
      versionHistory: 'v1.0 → v1.4',
    },
  ];
}

export function computeQualityScore(run: AiProductionRun): number {
  const deptScores = AI_PRODUCTION_FLOW_STEPS.map((step) => run.departments[step.id].progress);
  const avg = deptScores.reduce((a, b) => a + b, 0) / deptScores.length;
  const approvedBonus = AI_PRODUCTION_FLOW_STEPS.filter((s) => run.departments[s.id].status === 'approved' || run.departments[s.id].status === 'complete').length * 2;
  return Math.min(100, Math.round(avg * 0.7 + approvedBonus));
}

export function departmentFlowIndex(id: AiProductionDepartmentId): number {
  return AI_PRODUCTION_FLOW_STEPS.findIndex((s) => s.id === id);
}

function createRun(partial: Partial<AiProductionRun> & Pick<AiProductionRun, 'id' | 'title'>): AiProductionRun {
  const run: AiProductionRun = {
    accentHex: '#EB1C24',
    contentPackRef: partial.id,
    runStatus: 'draft',
    currentDepartment: 'research',
    lastUpdated: 'JUL 4',
    showName: 'THE SLAY REPORT',
    studioName: 'THE WEATHER STUDIO',
    talentName: 'BEAUTY REPORTER',
    campaignName: 'SUMMER SLAY',
    departments: defaultDepartments(),
    qualityScore: 0,
    qualityRevisionNote: '',
    promptTraces: [],
    researchTopic: '',
    researchReferences: '',
    researchBrandBrain: '',
    researchIntelligence: '',
    researchProductKnowledge: '',
    researchShowBible: '',
    researchBrief: '',
    writingEpisodeOutline: '',
    writingEpisodeScript: '',
    writingJournal: '',
    writingEmail: '',
    writingPush: '',
    writingSeo: '',
    writingTranscript: '',
    writingCaptions: '',
    writingCta: '',
    writingProducts: '',
    creativeSceneBreakdown: '',
    creativeCameraPlan: '',
    creativeStudioSelection: '',
    creativeTalentSelection: '',
    creativeLighting: '',
    creativeAnimation: '',
    creativeTransitions: '',
    creativeMood: '',
    creativeMusicStyle: '',
    visualImagePrompts: '',
    visualVideoPrompts: '',
    visualThumbnailPrompts: '',
    visualEnvironmentPrompts: '',
    visualMarketingGraphics: '',
    visualProductAssets: '',
    visualBackgroundAssets: '',
    voiceNarration: '',
    voicePsaDialogue: '',
    voiceVoiceover: '',
    voiceTiming: '',
    voicePauses: '',
    voicePronunciation: '',
    voiceIntro: '',
    voiceOutro: '',
    editorialGrammar: '',
    editorialLuxuryTone: '',
    editorialBrandVoice: '',
    editorialProductAccuracy: '',
    editorialCtaAccuracy: '',
    editorialFormatting: '',
    editorialReadingLevel: '',
    editorialConsistency: '',
    editorialApproval: 'PENDING',
    qualityBrandAlignment: 'PENDING',
    qualityShowRules: 'PENDING',
    qualityStudioRules: 'PENDING',
    qualityTalentRules: 'PENDING',
    qualityPromptCompleteness: 'PENDING',
    qualityAssetCompleteness: 'PENDING',
    qualityPackCompleteness: 'PENDING',
    qualityProductAccuracy: 'PENDING',
    qualityDistributionTargets: 'PENDING',
    publishingLoungeTv: 'QUEUED',
    publishingJournal: 'QUEUED',
    publishingEmail: 'QUEUED',
    publishingInstagram: 'QUEUED',
    publishingTiktok: 'QUEUED',
    publishingPinterest: 'QUEUED',
    publishingPush: 'QUEUED',
    publishingSeo: 'QUEUED',
    publishingWebsite: 'QUEUED',
    publishingMansion: 'FUTURE',
    publishingMobileApp: 'FUTURE',
    ...partial,
  };
  run.promptTraces = partial.promptTraces ?? defaultTraces(run);
  run.qualityScore = partial.qualityScore ?? computeQualityScore(run);
  return run;
}

export const ADMIN_STUDIO_AI_PRODUCTION_RUN_DEFAULTS: AiProductionRun[] = [
  createRun({
    id: 'run-slay-report-13',
    title: 'SLAY REPORT EP 13 — CHERRY RED FORECAST',
    contentPackRef: 'pack-slay-report-13',
    runStatus: 'running',
    currentDepartment: 'writing',
    showName: 'THE SLAY REPORT',
    studioName: 'THE WEATHER STUDIO',
    talentName: 'BEAUTY REPORTER',
    departments: defaultDepartments({
      research: { status: 'complete', progress: 100 },
      writing: { status: 'in-progress', progress: 62 },
      creative: { status: 'pending', progress: 15 },
      visual: { status: 'generating', progress: 28 },
      voice: { status: 'waiting', progress: 0 },
      editorial: { status: 'pending', progress: 0 },
      'quality-control': { status: 'waiting', progress: 0 },
      publishing: { status: 'queued', progress: 0 },
    }),
    researchTopic: 'CHERRY RED TREND FORECAST · FRIDAY PREMIERE',
    researchBrief: 'APPROVED BRIEF — INHERITS SHOW BIBLE + INTELLIGENCE ENGINE',
    writingEpisodeOutline: 'COLD OPEN → TREND REVEAL → PRODUCT SPOTLIGHT → CTA',
    writingEpisodeScript: 'DRAFT v2.1 — LUXURY TONE LOCKED',
    creativeStudioSelection: 'THE WEATHER STUDIO',
    creativeTalentSelection: 'BEAUTY REPORTER',
    visualImagePrompts: '6 PROMPTS ASSEMBLED · STUDIO LOT + TALENT AGENCY',
    qualityScore: 78,
    qualityRevisionNote: 'BELOW THRESHOLD — VISUAL GENERATION INCOMPLETE',
  }),
  createRun({
    id: 'run-psa-22',
    title: 'PSA ANALYZES EP 22',
    contentPackRef: 'pack-psa-22',
    accentHex: '#C41E3A',
    runStatus: 'paused',
    currentDepartment: 'editorial',
    showName: 'PSA ANALYZES',
    studioName: 'PSA STUDIO',
    talentName: 'PSA',
    departments: defaultDepartments({
      research: { status: 'approved', progress: 100 },
      writing: { status: 'approved', progress: 100 },
      creative: { status: 'approved', progress: 100 },
      visual: { status: 'complete', progress: 100 },
      voice: { status: 'complete', progress: 100 },
      editorial: { status: 'in-progress', progress: 55 },
      'quality-control': { status: 'waiting', progress: 0 },
      publishing: { status: 'queued', progress: 0 },
    }),
    editorialApproval: 'IN REVIEW',
    qualityScore: 88,
  }),
  createRun({
    id: 'run-campaign-summer',
    title: 'SUMMER LAUNCH MANIFESTO',
    contentPackRef: 'pack-campaign-summer',
    runStatus: 'draft-complete',
    currentDepartment: 'publishing',
    showName: 'CAMPAIGN FILMS',
    studioName: 'CAMPAIGN STUDIO',
    talentName: 'CAMPAIGN TALENT',
    departments: defaultDepartments({
      research: { status: 'approved', progress: 100 },
      writing: { status: 'approved', progress: 100 },
      creative: { status: 'approved', progress: 100 },
      visual: { status: 'approved', progress: 100 },
      voice: { status: 'approved', progress: 100 },
      editorial: { status: 'approved', progress: 100 },
      'quality-control': { status: 'approved', progress: 100 },
      publishing: { status: 'complete', progress: 100 },
    }),
    publishingLoungeTv: 'PREPARED · MANUAL SHIP',
    publishingEmail: 'PREPARED · MANUAL SHIP',
    qualityScore: 96,
    qualityRevisionNote: 'APPROVED — READY FOR MANUAL PUBLISHING',
  }),
  createRun({
    id: 'run-slay-lab-8',
    title: 'SLAY LAB EP 8 — LACE TENSION',
    contentPackRef: 'pack-slay-lab-8',
    accentHex: '#8B0000',
    runStatus: 'draft',
    currentDepartment: 'research',
    showName: 'SLAY LAB',
    studioName: 'THE LAB STUDIO',
    talentName: 'HAIR SCIENTIST · PSA',
    departments: defaultDepartments({
      research: { status: 'queued', progress: 5 },
    }),
    qualityScore: 12,
  }),
];

export function getAiProductionRunById(id: string): AiProductionRun | undefined {
  return ADMIN_STUDIO_AI_PRODUCTION_RUN_DEFAULTS.find((r) => r.id === id);
}

export function createBlankAiProductionRun(title: string): AiProductionRun {
  const id = `run-custom-${Date.now()}`;
  return createRun({
    id,
    title: title.toUpperCase(),
    contentPackRef: id,
    runStatus: 'draft',
    currentDepartment: 'research',
    departments: defaultDepartments({ research: { status: 'queued', progress: 0 } }),
    qualityScore: 0,
  });
}
