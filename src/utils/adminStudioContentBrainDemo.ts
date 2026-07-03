/** CONTENT BRAIN — hub metadata, section registry, and core knowledge seeds. */

export type ContentBrainSectionId =
  | 'brand-brain'
  | 'psa-personality'
  | 'show-bible'
  | 'editorial-rules'
  | 'prompt-frameworks'
  | 'campaign-frameworks'
  | 'product-knowledge'
  | 'cta-library'
  | 'content-engine'
  | 'content-calendar'
  | 'approval-rules';

export type ContentBrainHubCard = {
  id: ContentBrainSectionId;
  title: string;
  metric: string;
  description: string;
  route: string;
};

export const ADMIN_STUDIO_CONTENT_BRAIN_HUB_SUBTITLE =
  'FRONTAL SLAYER BRAND BIBLE · SHOW BIBLE · EDITORIAL BRAIN — SINGLE SOURCE OF TRUTH FOR ALL AI GENERATION.';

export const ADMIN_STUDIO_CONTENT_BRAIN_SECTIONS: ContentBrainHubCard[] = [
  {
    id: 'brand-brain',
    title: 'BRAND BRAIN',
    metric: '14',
    description: 'MISSION, VOICE, VALUES, LUXURY POSITIONING & TERMINOLOGY.',
    route: '/admin/studio/content-brain/brand-brain',
  },
  {
    id: 'psa-personality',
    title: 'PSA PERSONALITY',
    metric: '22',
    description: 'FOUNDER HOLOGRAM VOICE, TONE, CATCHPHRASES & CONVERSATION RULES.',
    route: '/admin/studio/content-brain/psa-personality',
  },
  {
    id: 'show-bible',
    title: 'SHOW BIBLE',
    metric: '8',
    description: 'PER-SHOW PRODUCTION BIBLE — HOST, ENVIRONMENT, STRUCTURE & RULES.',
    route: '/admin/studio/content-brain/show-bible',
  },
  {
    id: 'editorial-rules',
    title: 'EDITORIAL RULES',
    metric: '12',
    description: 'WRITING STANDARDS — HEADLINES, CTAS, SEO, LUXURY TONE & FORMATTING.',
    route: '/admin/studio/content-brain/editorial-rules',
  },
  {
    id: 'prompt-frameworks',
    title: 'PROMPT FRAMEWORKS',
    metric: '24',
    description: 'REUSABLE PROMPT TEMPLATES — TAGGED, VERSIONED, FAVORITED.',
    route: '/admin/studio/content-brain/prompt-frameworks',
  },
  {
    id: 'campaign-frameworks',
    title: 'CAMPAIGN FRAMEWORKS',
    metric: '8',
    description: 'LAUNCH, DROP, HOLIDAY, MEMBERSHIP & EDUCATIONAL BLUEPRINTS.',
    route: '/admin/studio/content-brain/campaign-frameworks',
  },
  {
    id: 'product-knowledge',
    title: 'PRODUCT KNOWLEDGE',
    metric: '6',
    description: 'SEARCHABLE UNIT CATALOG — FEATURES, BENEFITS, CARE & PAIRINGS.',
    route: '/admin/studio/content-brain/product-knowledge',
  },
  {
    id: 'cta-library',
    title: 'CTA LIBRARY',
    metric: '10',
    description: 'REUSABLE CTA BLOCKS FOR EVERY CHANNEL & FUNNEL.',
    route: '/admin/studio/content-brain/cta-library',
  },
  {
    id: 'content-engine',
    title: 'CONTENT ENGINE',
    metric: '15',
    description: 'MASTER TOPIC → MULTI-CHANNEL WORKFLOW — VISUAL PLANNING ONLY.',
    route: '/admin/studio/content-brain/content-engine',
  },
  {
    id: 'content-calendar',
    title: 'CONTENT CALENDAR',
    metric: '5',
    description: 'WEEKLY EDITORIAL RHYTHM — RESEARCH THROUGH PUBLISH.',
    route: '/admin/studio/content-brain/content-calendar',
  },
  {
    id: 'approval-rules',
    title: 'APPROVAL RULES',
    metric: '6',
    description: 'DRAFT → REVIEW → APPROVED — NEVER AUTO-PUBLISH.',
    route: '/admin/studio/content-brain/approval-rules',
  },
];

export function getContentBrainSectionById(id: string): ContentBrainHubCard | undefined {
  return ADMIN_STUDIO_CONTENT_BRAIN_SECTIONS.find((s) => s.id === id);
}

/** Flat string-field knowledge record — all values editable. */
export type ContentBrainFieldRecord = Record<string, string>;

export type ContentBrainFieldDef = {
  key: string;
  label: string;
  multiline?: boolean;
};

export type ContentBrainFieldGroup = {
  title: string;
  fields: ContentBrainFieldDef[];
};

// ─── Brand Brain ───────────────────────────────────────────────

export const ADMIN_STUDIO_BRAND_BRAIN_DEFAULTS: ContentBrainFieldRecord = {
  mission:
    'EMPOWER EVERY WOMAN TO SLAY WITHOUT COMPROMISE — LUXURY WIGS, EDUCATION, AND COMMUNITY BUILT FOR REAL LIFE.',
  vision:
    'THE WORLD RECOGNIZES FRONTAL SLAYER AS THE DEFINITIVE LUXURY WIG HOUSE — WHERE TRUST, CRAFT, AND CULTURE MEET.',
  brandStory:
    "BORN FROM KATEENA ARMSTRONG'S JOURNEY — FRONTAL SLAYER TURNED GATEKEEPING INTO GUIDANCE. WE BUILD UNITS, TEACH TECHNIQUE, AND CELEBRATE EVERY SLAY.",
  coreValues: 'TRUST · EDUCATION · LUXURY · NO GATEKEEPING · COMMUNITY · CRAFT',
  luxuryPositioning:
    'ACCESSIBLE LUXURY — MUSEUM-QUALITY UNITS, EDITORIAL EXPERIENCE, PREMIUM WITHOUT PRETENSE.',
  targetAudience:
    'WOMEN 25–55 WHO INVEST IN THEIR LOOK — PROFESSIONALS, CREATORS, MOMS, AND SLAYERS WHO WANT EXPERT GUIDANCE.',
  brandVoice: 'CONFIDENT · WARM · EDUCATOR · HAIR BESTIE — NEVER SALESY OR ROBOTIC.',
  writingStyle: 'UPPERCASE LABELS · SHORT PUNCHY SENTENCES · HANDWRITTEN ACCENTS FOR DATES & METRICS.',
  designLanguage:
    'MARBLE TEXTURES · FROSTED GLASS CARDS · #EB1C24 ACCENT · FUTURA PT + COVERED BY YOUR GRACE.',
  approvedTerminology:
    'SLAY · FRONTAL SLAYER · BUILD-A-WIG · LOUNGE TV · PSA · SLAY CHALLENGE · SLAY BOARD · UNIT · RAW',
  forbiddenTerminology: 'CHEAP · FAKE · BASIC · ROBOTIC · AI-GENERATED (IN CUSTOMER COPY) · DISCOUNT HAIR',
  contentGoals:
    'EDUCATE FIRST · DRIVE LOUNGE WATCH TIME · BUILD MEMBERSHIP · SUPPORT UNIT SALES WITHOUT HARD SELL.',
  marketingPhilosophy: 'TRUST OVER SALES — EVERY PIECE MUST FEEL LIKE A GIFT, NOT AN AD.',
};

export const ADMIN_STUDIO_BRAND_BRAIN_GROUPS: ContentBrainFieldGroup[] = [
  {
    title: 'FOUNDATION',
    fields: [
      { key: 'mission', label: 'MISSION', multiline: true },
      { key: 'vision', label: 'VISION', multiline: true },
      { key: 'brandStory', label: 'BRAND STORY', multiline: true },
      { key: 'coreValues', label: 'CORE VALUES', multiline: true },
    ],
  },
  {
    title: 'POSITIONING',
    fields: [
      { key: 'luxuryPositioning', label: 'LUXURY POSITIONING', multiline: true },
      { key: 'targetAudience', label: 'TARGET AUDIENCE', multiline: true },
      { key: 'contentGoals', label: 'CONTENT GOALS', multiline: true },
      { key: 'marketingPhilosophy', label: 'MARKETING PHILOSOPHY', multiline: true },
    ],
  },
  {
    title: 'VOICE & LANGUAGE',
    fields: [
      { key: 'brandVoice', label: 'BRAND VOICE', multiline: true },
      { key: 'writingStyle', label: 'WRITING STYLE', multiline: true },
      { key: 'designLanguage', label: 'DESIGN LANGUAGE', multiline: true },
      { key: 'approvedTerminology', label: 'APPROVED TERMINOLOGY', multiline: true },
      { key: 'forbiddenTerminology', label: 'FORBIDDEN TERMINOLOGY', multiline: true },
    ],
  },
];

// ─── PSA Personality ───────────────────────────────────────────

export const ADMIN_STUDIO_PSA_PERSONALITY_DEFAULTS: ContentBrainFieldRecord = {
  name: 'PSA — PERSONAL STYLING ASSISTANT',
  role: 'FOUNDER HOLOGRAM · CONCIERGE · HAIR BESTIE · EDUCATOR',
  purpose:
    'GUIDE MEMBERS TO THEIR BEST LOOK — RECOMMEND REAL CATALOG UNITS, ANSWER QUESTIONS, NEVER GATEKEEP.',
  tone: 'WARM · CONFIDENT · DIRECT — LIKE A TRUSTED FRIEND WHO HAPPENS TO BE AN EXPERT.',
  humorStyle: 'LIGHT WIT · NEVER SARCASTIC AT THE CUSTOMER · OCCASIONAL PLAYFUL HAIR PUNS.',
  vocabulary: 'SLAY · UNIT · RAW · LACE · INSTALL · BUILD · LOUNGE · BESTIE — NO CORPORATE JARGON.',
  speakingStyle: 'SHORT SENTENCES · ONE IDEA AT A TIME · ASK CLARIFYING QUESTIONS BEFORE RECOMMENDING.',
  confidenceLevel: 'HIGH — STATE RECOMMENDATIONS CLEARLY; ACKNOWLEDGE WHEN SOMETHING IS PREFERENCE.',
  professionalism: 'LUXURY CONCIERGE — POLISHED BUT NEVER STIFF OR SCRIPTED.',
  luxuryLanguage: 'CURATED · BESPOKE · MUSEUM-QUALITY · YOUR SIGNATURE LOOK — NEVER "BUDGET" OR "DEAL".',
  catchphrases: 'LET US BUILD YOUR NEXT MOVE · TRUST OVER SALES · YOU ARE ALWAYS IN CONTROL.',
  recurringExpressions: 'HERE IS WHAT I WOULD DO · LET ME BREAK THAT DOWN · YOUR SLAY STARTS HERE.',
  greetingVariations:
    'PSA HERE — WHAT CAN I HELP YOU SLAY TODAY? · WELCOME BACK — READY FOR YOUR NEXT LOOK?',
  closingVariations:
    'TRUST OVER SALES. YOU ARE ALWAYS IN CONTROL. · SAVE THIS TO YOUR SLAY BOARD — I WILL BE HERE.',
  favoriteAnalogies:
    'LACE IS LIKE FOUNDATION — GET THE BASE RIGHT AND EVERYTHING ELSE FLOWS. · COLOR IS SEASONING — A LITTLE GOES A LONG WAY.',
  educationalStyle: 'SHOW THE WHY BEFORE THE HOW · ONE TECHNIQUE PER ANSWER · LINK TO LOUNGE LESSONS.',
  conversationRules:
    'ALWAYS RECOMMEND REAL CATALOG UNITS (NOIR, BLANCO, SOFT WAVE, BEACH WAVE, SOFT CURL, OCEAN CURL). NEVER INVENT PRODUCTS. NEVER SOUND ROBOTIC.',
  topicsToAvoid: 'MEDICAL CLAIMS · COMPETITOR BASHING · PRESSURE TO BUY · FAKE URGENCY · GENERIC AI PHRASES.',
  brandValues: 'TRUST · NO GATEKEEPING · EDUCATION · LUXURY · COMMUNITY — EMBED IN EVERY REPLY.',
};

export const ADMIN_STUDIO_PSA_PERSONALITY_GROUPS: ContentBrainFieldGroup[] = [
  {
    title: 'IDENTITY',
    fields: [
      { key: 'name', label: 'NAME' },
      { key: 'role', label: 'ROLE' },
      { key: 'purpose', label: 'PURPOSE', multiline: true },
    ],
  },
  {
    title: 'VOICE',
    fields: [
      { key: 'tone', label: 'TONE', multiline: true },
      { key: 'humorStyle', label: 'HUMOR STYLE', multiline: true },
      { key: 'vocabulary', label: 'VOCABULARY', multiline: true },
      { key: 'speakingStyle', label: 'SPEAKING STYLE', multiline: true },
      { key: 'confidenceLevel', label: 'CONFIDENCE LEVEL', multiline: true },
      { key: 'professionalism', label: 'PROFESSIONALISM', multiline: true },
      { key: 'luxuryLanguage', label: 'LUXURY LANGUAGE', multiline: true },
    ],
  },
  {
    title: 'SIGNATURE PHRASES',
    fields: [
      { key: 'catchphrases', label: 'CATCHPHRASES', multiline: true },
      { key: 'recurringExpressions', label: 'RECURRING EXPRESSIONS', multiline: true },
      { key: 'greetingVariations', label: 'GREETING VARIATIONS', multiline: true },
      { key: 'closingVariations', label: 'CLOSING VARIATIONS', multiline: true },
      { key: 'favoriteAnalogies', label: 'FAVORITE ANALOGIES', multiline: true },
    ],
  },
  {
    title: 'RULES',
    fields: [
      { key: 'educationalStyle', label: 'EDUCATIONAL STYLE', multiline: true },
      { key: 'conversationRules', label: 'CONVERSATION RULES', multiline: true },
      { key: 'topicsToAvoid', label: 'TOPICS TO AVOID', multiline: true },
      { key: 'brandValues', label: 'BRAND VALUES', multiline: true },
    ],
  },
];

// ─── Editorial Rules ───────────────────────────────────────────

export const ADMIN_STUDIO_EDITORIAL_RULES_DEFAULTS: ContentBrainFieldRecord = {
  readingLevel: 'GRADE 8–10 — CLEAR, ACCESSIBLE, NO JARGON WITHOUT EXPLANATION.',
  sentenceLength: '12–18 WORDS AVERAGE · MAX 25 FOR COMPLEX IDEAS · ONE IDEA PER SENTENCE.',
  formattingStyle: 'UPPERCASE LABELS · BULLET LISTS FOR STEPS · SHORT PARAGRAPHS (2–3 LINES MAX).',
  capitalizationRules: 'ALL CAPS FOR UI LABELS & CTAS · TITLE CASE FOR HEADLINES · SENTENCE CASE FOR BODY.',
  emojiUsage: 'SPARINGLY IN SOCIAL ONLY · NEVER IN EMAIL SUBJECTS OR LOUNGE COPY · MAX 1 PER POST.',
  headlineStyle: 'BENEFIT-FIRST · 6–10 WORDS · HANDWRITTEN ACCENT FOR DATES & EPISODE NUMBERS.',
  ctaStyle: 'VERB-FIRST · 3–5 WORDS · RED TEXT ON WHITE · EXAMPLES: WATCH FULL EPISODE · OPEN BUILD-A-WIG.',
  seoStyle: 'NATURAL KEYWORDS · UNIT NAMES + TECHNIQUE TERMS · NO KEYWORD STUFFING.',
  educationalStyle: 'NUMBERED STEPS · BEFORE/AFTER WHEN POSSIBLE · LINK TO LOUNGE LESSONS.',
  luxuryTone: 'ASPIRATIONAL WITHOUT SNOBBERY · CELEBRATE THE CUSTOMER · NEVER TALK DOWN.',
  storytellingStructure: 'HOOK → CONTEXT → VALUE → CTA · EPISODE ARC: OPEN → BUILD → PAYOFF → CLOSE.',
  factCheckingStatus: 'REQUIRED FOR PRODUCT SPECS · VERIFY UNIT NAMES & PRICING · DEMO STATUS: MANUAL REVIEW.',
};

export const ADMIN_STUDIO_EDITORIAL_RULES_GROUPS: ContentBrainFieldGroup[] = [
  {
    title: 'READABILITY',
    fields: [
      { key: 'readingLevel', label: 'READING LEVEL', multiline: true },
      { key: 'sentenceLength', label: 'SENTENCE LENGTH', multiline: true },
      { key: 'formattingStyle', label: 'FORMATTING STYLE', multiline: true },
      { key: 'capitalizationRules', label: 'CAPITALIZATION RULES', multiline: true },
    ],
  },
  {
    title: 'CHANNEL STYLE',
    fields: [
      { key: 'headlineStyle', label: 'HEADLINE STYLE', multiline: true },
      { key: 'ctaStyle', label: 'CTA STYLE', multiline: true },
      { key: 'seoStyle', label: 'SEO STYLE', multiline: true },
      { key: 'emojiUsage', label: 'EMOJI USAGE', multiline: true },
    ],
  },
  {
    title: 'TONE & STRUCTURE',
    fields: [
      { key: 'educationalStyle', label: 'EDUCATIONAL STYLE', multiline: true },
      { key: 'luxuryTone', label: 'LUXURY TONE', multiline: true },
      { key: 'storytellingStructure', label: 'STORYTELLING STRUCTURE', multiline: true },
      { key: 'factCheckingStatus', label: 'FACT CHECKING STATUS', multiline: true },
    ],
  },
];

// ─── Content Engine workflow ───────────────────────────────────

export type ContentEngineStepId =
  | 'master-topic'
  | 'research'
  | 'outline'
  | 'episode-script'
  | 'scene-list'
  | 'journal'
  | 'email'
  | 'instagram'
  | 'tiktok'
  | 'pinterest'
  | 'thumbnail'
  | 'seo'
  | 'psa-knowledge'
  | 'publishing';

export const ADMIN_STUDIO_CONTENT_ENGINE_STEPS: Array<{
  id: ContentEngineStepId;
  label: string;
  note: string;
}> = [
  { id: 'master-topic', label: 'MASTER TOPIC', note: 'SINGLE SOURCE IDEA — ALL CHANNELS BRANCH FROM HERE.' },
  { id: 'research', label: 'RESEARCH', note: 'TRENDS, PRODUCT SPECS, MEMBER QUESTIONS, PSA KNOWLEDGE.' },
  { id: 'outline', label: 'OUTLINE', note: 'EPISODE OR ARTICLE STRUCTURE BEFORE SCRIPTING.' },
  { id: 'episode-script', label: 'EPISODE SCRIPT', note: 'HOST LINES, SEGMENTS, B-ROLL NOTES.' },
  { id: 'scene-list', label: 'SCENE LIST', note: 'SHOT LIST · ANGLES · GRAPHICS · TRANSITIONS.' },
  { id: 'journal', label: 'JOURNAL', note: 'LONG-FORM ARTICLE · LOUNGE READ GUIDE.' },
  { id: 'email', label: 'EMAIL', note: 'NEWSLETTER OR CAMPAIGN EMAIL COPY.' },
  { id: 'instagram', label: 'INSTAGRAM', note: 'CAPTION · CAROUSEL SLIDES · STORIES HOOKS.' },
  { id: 'tiktok', label: 'TIKTOK', note: 'SHORT HOOK · 15–60 SEC SCRIPT · TREND AUDIO NOTES.' },
  { id: 'pinterest', label: 'PINTEREST', note: 'PIN TITLE · DESCRIPTION · BOARD CATEGORY.' },
  { id: 'thumbnail', label: 'THUMBNAIL', note: 'TITLE TREATMENT · COLOR · COMPOSITION BRIEF.' },
  { id: 'seo', label: 'SEO', note: 'META TITLE · DESCRIPTION · KEYWORDS · SLUG.' },
  { id: 'psa-knowledge', label: 'PSA KNOWLEDGE', note: 'FOUNDER VOICE SNIPPETS · UNIT RECOMMENDATIONS.' },
  { id: 'publishing', label: 'PUBLISHING', note: 'QUEUE · APPROVAL · SCHEDULE — NEVER AUTO-PUBLISH.' },
];

export const ADMIN_STUDIO_CONTENT_ENGINE_DEFAULTS: ContentBrainFieldRecord = {
  masterTopic: 'CHERRY RED WILL TREND THIS FALL — LACE MASTERY + COLOR FORECAST FOR SLAY REPORT.',
  workflowNotes:
    'VISUAL PLANNING ONLY — NO AUTOMATION. EACH STEP DRAFTS SEPARATELY; ALL REQUIRE APPROVAL BEFORE PUBLISHING.',
};

// ─── Content Calendar ──────────────────────────────────────────

export type ContentCalendarDay = {
  id: string;
  dayLabel: string;
  focus: string;
  tasks: string;
  notes: string;
};

export const ADMIN_STUDIO_CONTENT_CALENDAR_DEFAULTS: ContentCalendarDay[] = [
  {
    id: 'monday',
    dayLabel: 'MONDAY',
    focus: 'TOPIC RESEARCH',
    tasks: 'TREND SCAN · MEMBER QUESTIONS · PRODUCT UPDATES · PSA KNOWLEDGE SYNC',
    notes: 'LOCK MASTER TOPIC BY EOD — SHARE WITH EDITORIAL.',
  },
  {
    id: 'tuesday',
    dayLabel: 'TUESDAY',
    focus: 'SCRIPT',
    tasks: 'EPISODE OUTLINE · HOST LINES · SEGMENT BREAKS · CTA PLACEMENT',
    notes: 'REFERENCE SHOW BIBLE + EDITORIAL RULES.',
  },
  {
    id: 'wednesday',
    dayLabel: 'WEDNESDAY',
    focus: 'PRODUCTION',
    tasks: 'FILM / DESIGN · THUMBNAILS · B-ROLL · GRAPHICS · VOICEOVER',
    notes: 'ASSET LIBRARY + PROMPT FRAMEWORKS FOR AI ASSISTS (PHASE 2).',
  },
  {
    id: 'thursday',
    dayLabel: 'THURSDAY',
    focus: 'REVIEW',
    tasks: 'FACT CHECK · BRAND VOICE PASS · APPROVAL RULES · LEGAL SCAN',
    notes: 'ALL ASSETS → NEEDS REVIEW — NO EXCEPTIONS.',
  },
  {
    id: 'friday',
    dayLabel: 'FRIDAY',
    focus: 'PUBLISH',
    tasks: 'LOUNGE PREMIERE · EMAIL SEND · SOCIAL SCHEDULE · ANALYTICS BASELINE',
    notes: 'SLAY REPORT 7PM ET — PUBLISHING QUEUE ONLY AFTER APPROVED.',
  },
];

// ─── Approval Rules ────────────────────────────────────────────

export type ApprovalStatusId =
  | 'draft'
  | 'needs-review'
  | 'approved'
  | 'rejected'
  | 'scheduled'
  | 'published';

export const ADMIN_STUDIO_APPROVAL_STATUSES: Array<{ id: ApprovalStatusId; label: string; color: string }> = [
  { id: 'draft', label: 'DRAFT', color: '#808080' },
  { id: 'needs-review', label: 'NEEDS REVIEW', color: '#CA8A04' },
  { id: 'approved', label: 'APPROVED', color: '#16A34A' },
  { id: 'rejected', label: 'REJECTED', color: '#EB1C24' },
  { id: 'scheduled', label: 'SCHEDULED', color: '#2563EB' },
  { id: 'published', label: 'PUBLISHED', color: '#000000' },
];

export const ADMIN_STUDIO_APPROVAL_RULES_DEFAULTS: ContentBrainFieldRecord = {
  policy:
    'EVERY GENERATED ASSET REQUIRES HUMAN APPROVAL. NEVER AUTO-PUBLISH. AI OUTPUTS ALWAYS START AS DRAFT.',
  draftRule: 'ALL NEW CONTENT ENTERS AS DRAFT — INCLUDING AI STUDIO GENERATIONS.',
  reviewRule: 'EDITOR OR FOUNDER MUST REVIEW BEFORE APPROVED. FACT-CHECK PRODUCT CLAIMS.',
  approvedRule: 'APPROVED ASSETS MAY BE SCHEDULED — NOT PUBLISHED WITHOUT EXPLICIT SCHEDULE ACTION.',
  rejectedRule: 'REJECTED ASSETS RETURN TO DRAFT WITH NOTES — NO SILENT DISCARD.',
  scheduledRule: 'SCHEDULED ITEMS LOCK EDITING UNTIL UNSCHEDULED OR PUBLISHED.',
  publishedRule: 'PUBLISHED IS FINAL — ARCHIVE ONLY; NO AUTO-REPUBLISH.',
  automationBlock:
    'AUTOMATIC PUBLISHING IS DISABLED IN ALL PHASES. PUBLISHING SERVICE STUB RETURNS NOT_CONNECTED.',
};

export const ADMIN_STUDIO_APPROVAL_RULES_GROUPS: ContentBrainFieldGroup[] = [
  {
    title: 'POLICY',
    fields: [
      { key: 'policy', label: 'APPROVAL POLICY', multiline: true },
      { key: 'automationBlock', label: 'AUTOMATION BLOCK', multiline: true },
    ],
  },
  {
    title: 'STATUS RULES',
    fields: [
      { key: 'draftRule', label: 'DRAFT', multiline: true },
      { key: 'reviewRule', label: 'NEEDS REVIEW', multiline: true },
      { key: 'approvedRule', label: 'APPROVED', multiline: true },
      { key: 'rejectedRule', label: 'REJECTED', multiline: true },
      { key: 'scheduledRule', label: 'SCHEDULED', multiline: true },
      { key: 'publishedRule', label: 'PUBLISHED', multiline: true },
    ],
  },
];
