/** Prompt Frameworks — reusable templates with categories, tags, versions, favorites. */

export type PromptFrameworkCategoryId =
  | 'video'
  | 'image'
  | 'article'
  | 'email'
  | 'carousel'
  | 'pinterest'
  | 'thumbnail'
  | 'journal'
  | 'psa-dialogue'
  | 'push-notification'
  | 'voiceover';

export type PromptFrameworkVersion = {
  id: string;
  savedAt: string;
  body: string;
  note: string;
};

export type PromptFrameworkEntry = {
  id: string;
  title: string;
  categoryId: PromptFrameworkCategoryId;
  category: string;
  description: string;
  body: string;
  tags: string[];
  versions: PromptFrameworkVersion[];
};

export const PROMPT_FRAMEWORK_CATEGORIES: Array<{ id: PromptFrameworkCategoryId; label: string }> = [
  { id: 'video', label: 'VIDEO' },
  { id: 'image', label: 'IMAGE' },
  { id: 'article', label: 'ARTICLE' },
  { id: 'email', label: 'EMAIL' },
  { id: 'carousel', label: 'CAROUSEL' },
  { id: 'pinterest', label: 'PINTEREST' },
  { id: 'thumbnail', label: 'THUMBNAIL' },
  { id: 'journal', label: 'JOURNAL' },
  { id: 'psa-dialogue', label: 'PSA DIALOGUE' },
  { id: 'push-notification', label: 'PUSH NOTIFICATION' },
  { id: 'voiceover', label: 'VOICEOVER' },
];

const V1 = (body: string): PromptFrameworkVersion[] => [
  { id: 'v1', savedAt: '2026-07-01T12:00:00Z', body, note: 'INITIAL SEED' },
];

export const ADMIN_STUDIO_PROMPT_FRAMEWORKS_DEFAULTS: PromptFrameworkEntry[] = [
  {
    id: 'pf-video-episode',
    title: 'EPISODE SCRIPT — LOUNGE TV',
    categoryId: 'video',
    category: 'VIDEO',
    description: 'FULL EPISODE SCRIPT WITH SEGMENTS, B-ROLL, AND CTA PLACEMENT.',
    tags: ['LOUNGE', 'EPISODE', 'SCRIPT'],
    body: `ROLE: {{SHOW_HOST}} — {{SHOW_VOICE}}

MASTER TOPIC: {{MASTER_TOPIC}}

STRUCTURE:
1. COLD OPEN (15 SEC) — HOOK FROM MASTER TOPIC
2. SEGMENT A — EDUCATION / TREND
3. SEGMENT B — PRODUCT OR TECHNIQUE
4. MEMBER MOMENT — COMMUNITY WIN
5. CLOSE — {{SHOW_CLOSING_LINE}} + {{CTA}}

BRAND: REFERENCE CONTENT BRAIN · EDITORIAL RULES · SHOW BIBLE.
OUTPUT: DRAFT ONLY — REQUIRES APPROVAL.`,
    versions: V1(`ROLE: {{SHOW_HOST}} — {{SHOW_VOICE}}\n\nMASTER TOPIC: {{MASTER_TOPIC}}\n\nSTRUCTURE:\n1. COLD OPEN\n2. SEGMENT A\n3. SEGMENT B\n4. CLOSE + CTA`),
  },
  {
    id: 'pf-image-hero',
    title: 'HERO IMAGE — CAMPAIGN',
    categoryId: 'image',
    category: 'IMAGE',
    description: 'FAL-READY HERO IMAGE BRIEF FOR CAMPAIGN AND LOUNGE.',
    tags: ['FAL', 'HERO', 'CAMPAIGN'],
    body: `SUBJECT: {{UNIT_NAME}} ON {{MODEL_TYPE}} — {{STYLING}}

COMPOSITION: CINEMATIC 3:4 · MARBLE OR BRICK STAGE PER SHOW BIBLE
COLOR: {{COLOR_SWATCH}} — ACCURATE PIGMENT, NO DRIFT
LIGHTING: SOFT KEY + RED RIM ACCENT #EB1C24
STYLE: LUXURY EDITORIAL — NO PLASTIC DRIFT

REFERENCE: BRAND BRAIN DESIGN LANGUAGE + ASSET LIBRARY.`,
    versions: V1('SUBJECT: {{UNIT_NAME}} — LUXURY EDITORIAL HERO'),
  },
  {
    id: 'pf-article-journal',
    title: 'JOURNAL ARTICLE — LONG FORM',
    categoryId: 'article',
    category: 'ARTICLE',
    description: 'LOUNGE READ GUIDE EXPANDING EPISODE CONTENT.',
    tags: ['JOURNAL', 'SEO', 'LOUNGE'],
    body: `HEADLINE: BENEFIT-FIRST · 6–10 WORDS
MASTER TOPIC: {{MASTER_TOPIC}}

STRUCTURE:
- HOOK PARAGRAPH
- 3–5 H2 SECTIONS (EDUCATIONAL)
- PRODUCT CALLOUT (REAL CATALOG UNIT)
- CHECKLIST (ACTIONABLE STEPS)
- CTA: {{CTA_BLOCK}}

TONE: EDITORIAL RULES · LUXURY TONE · READING LEVEL GRADE 8–10.`,
    versions: V1('HEADLINE + HOOK + SECTIONS + CTA'),
  },
  {
    id: 'pf-email-newsletter',
    title: 'EMAIL — WEEKLY NEWSLETTER',
    categoryId: 'email',
    category: 'EMAIL',
    description: 'MEMBER NEWSLETTER WITH EPISODE TEASE AND SHOP CTA.',
    tags: ['EMAIL', 'NEWSLETTER', 'RESEND'],
    body: `SUBJECT: {{HEADLINE}} — FRONTAL SLAYER
PREHEADER: {{PREVIEW_TEXT}}

BODY:
- PERSONAL GREETING (WARM, NOT ROBOTIC)
- EPISODE TEASE + WATCH CTA
- ONE EDUCATIONAL TIP FROM MASTER TOPIC
- PRODUCT SPOTLIGHT (REAL UNIT)
- {{CTA_BLOCK}}

FOOTER: UNSUBSCRIBE · BRAND BRAIN VOICE.`,
    versions: V1('SUBJECT + TEASE + TIP + CTA'),
  },
  {
    id: 'pf-carousel-ig',
    title: 'INSTAGRAM CAROUSEL — 5 SLIDES',
    categoryId: 'carousel',
    category: 'CAROUSEL',
    description: 'EDUCATIONAL CAROUSEL FROM MASTER TOPIC.',
    tags: ['INSTAGRAM', 'CAROUSEL', 'SOCIAL'],
    body: `SLIDE 1: HOOK — BOLD STATEMENT FROM {{MASTER_TOPIC}}
SLIDE 2–4: ONE TIP PER SLIDE · MINIMAL TEXT
SLIDE 5: CTA — {{CTA_BLOCK}}

CAPTION: FIRST LINE HOOK · 3–5 HASHTAGS MAX · LINK IN BIO
DESIGN: MARBLE + RED ACCENT · FUTURA LABELS`,
    versions: V1('5 SLIDE EDUCATIONAL CAROUSEL'),
  },
  {
    id: 'pf-pinterest-pin',
    title: 'PINTEREST PIN — SEO',
    categoryId: 'pinterest',
    category: 'PINTEREST',
    description: 'PIN TITLE, DESCRIPTION, AND BOARD CATEGORY.',
    tags: ['PINTEREST', 'SEO'],
    body: `TITLE: {{KEYWORD}} + BENEFIT · 60 CHAR MAX
DESCRIPTION: 2–3 SENTENCES · NATURAL KEYWORDS · LINK TO JOURNAL
BOARD: {{BOARD_CATEGORY}}
IMAGE BRIEF: VERTICAL 2:3 · THUMBNAIL RULES FROM SHOW BIBLE`,
    versions: V1('TITLE + DESCRIPTION + BOARD'),
  },
  {
    id: 'pf-thumbnail-yt',
    title: 'THUMBNAIL — EPISODE',
    categoryId: 'thumbnail',
    category: 'THUMBNAIL',
    description: 'EPISODE THUMBNAIL TITLE TREATMENT AND COMPOSITION.',
    tags: ['THUMBNAIL', 'LOUNGE'],
    body: `TITLE: HANDWRITTEN ACCENT + BOLD FUTURA SUBTITLE
COMPOSITION: HOST OR HERO UNIT · RED LOWER THIRD
EPISODE BADGE: {{EPISODE_NUMBER}}
RULES: SHOW BIBLE THUMBNAIL RULES · NO CLUTTER`,
    versions: V1('TITLE TREATMENT + COMPOSITION BRIEF'),
  },
  {
    id: 'pf-journal-checklist',
    title: 'JOURNAL CHECKLIST',
    categoryId: 'journal',
    category: 'JOURNAL',
    description: 'ACTIONABLE CHECKLIST PAIRED WITH LOUNGE ARTICLE.',
    tags: ['CHECKLIST', 'LOUNGE'],
    body: `TITLE: {{MASTER_TOPIC}} — YOUR SLAY CHECKLIST

ITEMS (5–8):
□ STEP ONE — CLEAR ACTION
□ STEP TWO — PRODUCT IF NEEDED
□ ...

FOOTER: SAVE TO SLAY BOARD · WATCH FULL EPISODE`,
    versions: V1('5–8 ITEM CHECKLIST'),
  },
  {
    id: 'pf-psa-reply',
    title: 'PSA DIALOGUE — MEMBER REPLY',
    categoryId: 'psa-dialogue',
    category: 'PSA DIALOGUE',
    description: 'FOUNDER HOLOGRAM REPLY USING PSA PERSONALITY.',
    tags: ['PSA', 'CONCIERGE'],
    body: `CONTEXT: {{MEMBER_QUESTION}}

PSA PERSONALITY: WARM · CONFIDENT · NEVER ROBOTIC
RECOMMEND: REAL CATALOG UNIT ONLY (NOIR, BLANCO, SOFT WAVE, ETC.)

STRUCTURE:
1. GREETING VARIATION
2. DIRECT ANSWER
3. UNIT RECOMMENDATION + WHY
4. EDUCATIONAL TIP
5. CLOSING VARIATION — TRUST OVER SALES

AVOID: {{TOPICS_TO_AVOID}}`,
    versions: V1('GREETING + ANSWER + UNIT REC + CLOSE'),
  },
  {
    id: 'pf-push-episode',
    title: 'PUSH — NEW EPISODE',
    categoryId: 'push-notification',
    category: 'PUSH NOTIFICATION',
    description: 'SHORT PUSH FOR LOUNGE EPISODE DROP.',
    tags: ['PUSH', 'MOBILE'],
    body: `TITLE: NEW IN THE LOUNGE (40 CHAR)
BODY: {{SHOW_NAME}} — {{HOOK_LINE}} (90 CHAR)
CTA: WATCH NOW
DEEP LINK: LOUNGE TV EPISODE`,
    versions: V1('TITLE + BODY + DEEP LINK'),
  },
  {
    id: 'pf-voiceover-intro',
    title: 'VOICEOVER — SHOW INTRO',
    categoryId: 'voiceover',
    category: 'VOICEOVER',
    description: '15–30 SEC SHOW INTRO VOICEOVER SCRIPT.',
    tags: ['VO', 'INTRO'],
    body: `SHOW: {{SHOW_NAME}}
OPENING LINE: {{OPENING_LINE}}
DURATION: 15–30 SEC
MUSIC: FADE UNDER AT 3 SEC
VOICE: {{SHOW_VOICE_STYLE}}

SCRIPT: EXPAND OPENING LINE · ONE SENTENCE HOOK · BRAND SIGNATURE`,
    versions: V1('15–30 SEC INTRO SCRIPT'),
  },
];
