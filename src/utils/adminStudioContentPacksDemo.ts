/** Demo content packs — weekly multi-channel bundles (CMS-ready). */

import {
  createDefaultDistributionTargets,
  type AdminStudioDistributionTarget,
} from './adminStudioDistributionDemo';

export type AdminStudioContentPackTabId =
  | 'episode'
  | 'journal'
  | 'email'
  | 'instagram'
  | 'tiktok'
  | 'pinterest'
  | 'carousel'
  | 'push'
  | 'thumbnail'
  | 'products'
  | 'seo'
  | 'psa-knowledge'
  | 'metadata'
  | 'notes'
  | 'status';

export type AdminStudioContentPackField = {
  key: string;
  label: string;
  value: string;
  multiline?: boolean;
};

export type AdminStudioContentPack = {
  id: string;
  title: string;
  subtitle: string;
  showId?: string;
  status: string;
  thumbnailSrc: string;
  accentHex: string;
  distributionTargets: AdminStudioDistributionTarget[];
  tabs: Record<AdminStudioContentPackTabId, AdminStudioContentPackField[]>;
};

export const ADMIN_STUDIO_CONTENT_PACK_TAB_LABELS: Record<AdminStudioContentPackTabId, string> = {
  episode: 'EPISODE',
  journal: 'JOURNAL',
  email: 'EMAIL',
  instagram: 'INSTAGRAM',
  tiktok: 'TIKTOK',
  pinterest: 'PINTEREST',
  carousel: 'CAROUSEL',
  push: 'PUSH',
  thumbnail: 'THUMBNAIL',
  products: 'PRODUCTS',
  seo: 'SEO',
  'psa-knowledge': 'PSA KNOWLEDGE',
  metadata: 'METADATA',
  notes: 'NOTES',
  status: 'STATUS',
};

export const ADMIN_STUDIO_CONTENT_PACK_TAB_ORDER: AdminStudioContentPackTabId[] = [
  'episode',
  'journal',
  'email',
  'instagram',
  'tiktok',
  'pinterest',
  'carousel',
  'push',
  'thumbnail',
  'products',
  'seo',
  'psa-knowledge',
  'metadata',
  'notes',
  'status',
];

function cherryRedForecastTabs(): Record<AdminStudioContentPackTabId, AdminStudioContentPackField[]> {
  return {
    episode: [
      { key: 'title', label: 'EPISODE TITLE', value: 'CHERRY RED FORECAST — SUMMER SLAY COLOR' },
      { key: 'runtime', label: 'RUNTIME', value: '8 MIN' },
      { key: 'script', label: 'SCRIPT', value: 'OPEN ON SWATCH CARD. TODAY WE FORECAST CHERRY RED — UNDERTONE, LIFT, AND LOUNGE STYLING PAIRINGS...', multiline: true },
      { key: 'cta', label: 'EPISODE CTA', value: 'WATCH IN LOUNGE · TRY IN BUILD-A-WIG' },
    ],
    journal: [
      { key: 'headline', label: 'HEADLINE', value: 'CHERRY RED FORECAST' },
      { key: 'readTime', label: 'READ TIME', value: '4 MIN' },
      { key: 'intro', label: 'INTRO', value: 'CHERRY RED IS HAVING A MOMENT — HERE IS HOW TO WEAR IT WITHOUT WASHING OUT YOUR UNDERTONE.', multiline: true },
      { key: 'takeaways', label: 'KEY TAKEAWAYS', value: 'MATCH UNDERTONE · TEST IN DAYLIGHT · PAIR WITH SOFT WAVE TEXTURE', multiline: true },
    ],
    email: [
      { key: 'subject', label: 'SUBJECT LINE', value: 'YOUR CHERRY RED FORECAST IS LIVE 🍒' },
      { key: 'preheader', label: 'PREHEADER', value: 'WATCH + READ THIS WEEK IN THE LOUNGE' },
      { key: 'body', label: 'BODY', value: "HEY SLAYER — THIS WEEK'S PACK DROPS CHERRY RED FORECAST. TAP TO WATCH IN THE LOUNGE OR READ THE JOURNAL GUIDE.", multiline: true },
    ],
    instagram: [
      { key: 'caption', label: 'CAPTION', value: 'CHERRY RED FORECAST IS LIVE. SWIPE FOR UNDERTONE TIPS + LOUNGE LINK.', multiline: true },
      { key: 'hashtags', label: 'HASHTAGS', value: '#FRONTALSLAYER #CHERRYRED #SLAYFORECAST #LOUNGETV' },
    ],
    tiktok: [
      { key: 'hook', label: 'HOOK', value: 'POV: YOU FINALLY FOUND YOUR CHERRY RED UNDERTONE' },
      { key: 'caption', label: 'CAPTION', value: 'CHERRY RED FORECAST — LINK IN BIO FOR FULL LOUNGE EPISODE', multiline: true },
    ],
    pinterest: [
      { key: 'title', label: 'PIN TITLE', value: 'CHERRY RED HAIR FORECAST — UNDERTONE GUIDE' },
      { key: 'description', label: 'PIN DESCRIPTION', value: 'SUMMER SLAY COLOR FORECAST WITH SWATCH MATCHING + STYLING PAIRINGS FROM FRONTAL SLAYER.', multiline: true },
    ],
    carousel: [
      { key: 'slide1', label: 'SLIDE 1', value: 'CHERRY RED FORECAST' },
      { key: 'slide2', label: 'SLIDE 2', value: 'STEP 1 — IDENTIFY YOUR UNDERTONE' },
      { key: 'slide3', label: 'SLIDE 3', value: 'STEP 2 — SWATCH IN DAYLIGHT' },
      { key: 'slide4', label: 'SLIDE 4', value: 'WATCH FULL EPISODE IN THE LOUNGE' },
    ],
    push: [
      { key: 'title', label: 'PUSH TITLE', value: 'CHERRY RED FORECAST IS LIVE' },
      { key: 'body', label: 'PUSH BODY', value: 'NEW LOUNGE EPISODE + JOURNAL GUIDE — TAP TO WATCH' },
    ],
    thumbnail: [
      { key: 'style', label: 'THUMBNAIL STYLE', value: 'CHERRY SWATCH HERO · RED LOWER THIRD · 16:9' },
      { key: 'alt', label: 'ALT TEXT', value: 'CHERRY RED HAIR COLOR FORECAST THUMBNAIL' },
    ],
    products: [
      { key: 'primary', label: 'PRIMARY PRODUCT', value: 'NOIR — OFF BLACK BASE FOR CHERRY TINT LAYERING' },
      { key: 'secondary', label: 'SECONDARY', value: 'SOFT WAVE UNIT — MOVEMENT FOR RED TONES' },
      { key: 'shop', label: 'SHOP CTA', value: 'SHOP THIS LOOK → /home/shop' },
    ],
    seo: [
      { key: 'title', label: 'SEO TITLE', value: 'Cherry Red Hair Forecast | Frontal Slayer Lounge' },
      { key: 'description', label: 'META DESCRIPTION', value: 'Watch and read the Cherry Red Forecast — undertone matching, swatch tips, and lounge styling pairings.', multiline: true },
      { key: 'keywords', label: 'KEYWORDS', value: 'cherry red hair, color forecast, frontal slayer, lounge tv' },
    ],
    'psa-knowledge': [
      { key: 'summary', label: 'PSA SUMMARY', value: 'CHERRY RED WORKS BEST ON COOL-NEUTRAL UNDERTONES. WARM GOLDEN SKIN — DROP ONE SATURATION STEP.', multiline: true },
      { key: 'units', label: 'RECOMMENDED UNITS', value: 'NOIR · SOFT WAVE · BEACH WAVE' },
    ],
    metadata: [
      { key: 'packId', label: 'PACK ID', value: 'cherry-red-forecast' },
      { key: 'release', label: 'RELEASE DATE', value: '2026-07-04 · FRIDAY 7PM ET' },
      { key: 'show', label: 'SHOW', value: 'THE SLAY REPORT' },
      { key: 'format', label: 'FORMAT', value: 'BOTH — WATCH + READ' },
    ],
    notes: [
      { key: 'internal', label: 'INTERNAL NOTES', value: 'COORDINATE WITH MARKETING SPECIAL OFFER CARD. THUMBNAIL DUE WED.', multiline: true },
    ],
    status: [
      { key: 'workflow', label: 'WORKFLOW STATUS', value: 'IN REVIEW' },
      { key: 'channels', label: 'CHANNELS READY', value: 'EPISODE · JOURNAL · EMAIL · INSTAGRAM' },
      { key: 'owner', label: 'OWNER', value: 'STUDIO EDITORIAL' },
    ],
  };
}

function cuttingLacePackTabs(): Record<AdminStudioContentPackTabId, AdminStudioContentPackField[]> {
  return {
    episode: [
      { key: 'title', label: 'EPISODE TITLE', value: 'CUTTING YOUR LACE' },
      { key: 'runtime', label: 'RUNTIME', value: '8 MIN' },
      { key: 'script', label: 'SCRIPT', value: 'MAP YOUR HAIRLINE. TRIM IN SECTIONS. LEAVE A BUFFER FOR FIRST WEAR.', multiline: true },
    ],
    journal: [
      { key: 'headline', label: 'HEADLINE', value: 'CUTTING YOUR LACE — STEP BY STEP' },
      { key: 'readTime', label: 'READ TIME', value: '4 MIN' },
      { key: 'intro', label: 'INTRO', value: 'A CLEAN LACE CUT IS THE FOUNDATION OF EVERY UNDETECTABLE INSTALL.', multiline: true },
    ],
    email: [{ key: 'subject', label: 'SUBJECT LINE', value: 'NEW LESSON: CUTTING YOUR LACE' }],
    instagram: [{ key: 'caption', label: 'CAPTION', value: 'LACE MASTERY WEEK — CUTTING YOUR LACE GUIDE IS LIVE.' }],
    tiktok: [{ key: 'hook', label: 'HOOK', value: 'STOP CUTTING LACE LIKE THIS' }],
    pinterest: [{ key: 'title', label: 'PIN TITLE', value: 'HOW TO CUT LACE ON A FRONTAL WIG' }],
    carousel: [{ key: 'slide1', label: 'SLIDE 1', value: 'CUTTING YOUR LACE — 4 STEPS' }],
    push: [{ key: 'title', label: 'PUSH TITLE', value: 'NEW LACE LESSON LIVE' }],
    thumbnail: [{ key: 'style', label: 'THUMBNAIL STYLE', value: 'LACE SCISSORS MACRO · RED BADGE' }],
    products: [{ key: 'primary', label: 'PRIMARY PRODUCT', value: 'LACE SCISSORS · WASHABLE MARKER' }],
    seo: [{ key: 'title', label: 'SEO TITLE', value: 'How to Cut Lace | Frontal Slayer' }],
    'psa-knowledge': [{ key: 'summary', label: 'PSA SUMMARY', value: 'BUFFER LACE ON FIRST CUT — REFINE AFTER FIRST WEAR.' }],
    metadata: [
      { key: 'packId', label: 'PACK ID', value: 'cutting-your-lace' },
      { key: 'show', label: 'SHOW', value: 'SLAY ACADEMY' },
    ],
    notes: [{ key: 'internal', label: 'INTERNAL NOTES', value: 'SYNC WITH LOUNGE TV CONTENT PACK.' }],
    status: [{ key: 'workflow', label: 'WORKFLOW STATUS', value: 'PUBLISHED' }],
  };
}

export const ADMIN_STUDIO_DEFAULT_CONTENT_PACKS: AdminStudioContentPack[] = [
  {
    id: 'cherry-red-forecast',
    title: 'CHERRY RED FORECAST',
    subtitle: 'SUMMER SLAY COLOR — UNDERTONE, SWATCH, LOUNGE PAIRINGS',
    showId: 'the-slay-report',
    status: 'IN REVIEW',
    thumbnailSrc: '/assets/NOIR/curl-thumb.png',
    accentHex: '#EB1C24',
    distributionTargets: createDefaultDistributionTargets(),
    tabs: cherryRedForecastTabs(),
  },
  {
    id: 'cutting-your-lace',
    title: 'CUTTING YOUR LACE',
    subtitle: 'LACE MASTERY — TRIM, MAP, REFINE',
    showId: 'slay-academy',
    status: 'PUBLISHED',
    thumbnailSrc: '/assets/NOIR/wave-thumb.png',
    accentHex: '#8B0000',
    distributionTargets: createDefaultDistributionTargets(),
    tabs: cuttingLacePackTabs(),
  },
  {
    id: 'soft-wave-reveal',
    title: 'SOFT WAVE REVEAL',
    subtitle: 'PRODUCT REVEAL — TEXTURE, MOVEMENT, STYLING',
    showId: 'campaigns',
    status: 'DRAFT',
    thumbnailSrc: '/assets/NOIR/blanco-thumb.png',
    accentHex: '#C41E3A',
    distributionTargets: createDefaultDistributionTargets(),
    tabs: cherryRedForecastTabs(),
  },
];

export function getAdminStudioContentPackById(id: string): AdminStudioContentPack | undefined {
  return ADMIN_STUDIO_DEFAULT_CONTENT_PACKS.find((p) => p.id === id);
}
