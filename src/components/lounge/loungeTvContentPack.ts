import type { LoungeTvAccessType } from './loungeTvContent';
import {
  LOUNGE_TV_CONTENT_VIDEO_SRC,
  LOUNGE_TV_MEDIA,
  LOUNGE_TV_PLUCKING_LACE_TILE_ID,
} from './loungeTvAssets';

export type FeaturedPremiereKind =
  | 'psa-welcome'
  | 'new-this-week'
  | 'featured-lesson'
  | 'product-premiere'
  | 'seasonal-collection'
  | 'brand-film';

export type ContentPackArticleStep = {
  title: string;
  body: string;
};

export type ContentPackProduct = {
  name: string;
  shopHref?: string;
};

/** CMS-ready weekly content pack — video + article + metadata from one topic. */
export type LoungeContentPack = {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  /** Display series / curriculum name (e.g. PSA ACADEMY). */
  series?: string;
  originalSeries?: string;
  programSeries?: string;
  season?: number | string;
  episode?: number;
  episodeTitle?: string;
  host?: string;
  difficulty?: string;
  runtime?: string;
  readTime?: string;
  membershipRequired?: boolean;
  ticketCost?: number;
  accessType?: LoungeTvAccessType;
  thumbnail?: string;
  heroImage?: string;
  previewVideo?: string;
  fullVideo?: string;
  article?: {
    intro?: string;
    takeaways?: string[];
    steps?: ContentPackArticleStep[];
  };
  transcript?: string;
  checklist?: string[];
  productsUsed?: ContentPackProduct[];
  relatedLessons?: string[];
  releaseDate?: string;
  tags?: string[];
  isFreePreview?: boolean;
  isPremium?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  isRecommended?: boolean;
  justAdded?: boolean;
  membersFavorite?: boolean;
  /** Rotating featured tab premiere slot. */
  featuredPremiere?: FeaturedPremiereKind;
  /** Explicit format; derived from video/article when omitted. */
  contentFormat?: ContentPackFormat;
  /** Placement hints for Featured rows (metadata-driven). */
  featuredRows?: Array<
    | 'hero'
    | 'continue'
    | 'new'
    | 'trending'
    | 'psa-recommends'
    | 'premium'
    | 'recently-added'
    | 'because-you-watched'
    | 'members-favorites'
  >;
  /** Learning path id (learn tab sidebar). */
  learningPathId?: string;
  /** Sort order within a learning path curriculum. */
  learningPathOrder?: number;
  /** Explore section id (explore tab sidebar). */
  exploreSectionId?: string;
  /** Streaming platform metadata (series, artwork, lifecycle, future pages). */
  streaming?: LoungeContentStreamingMeta;
};

export type ContentPackFormatBadge = 'WATCH' | 'READ' | 'BOTH';

import type { LoungeContentStreamingMeta } from './loungeTvStreamingTypes';
import { hydrateAllContentPacks } from './loungeTvStreamingMeta';

export type ContentPackFormat = 'watch' | 'read' | 'both';

const LOCAL_PREVIEW_POOL = [
  LOUNGE_TV_MEDIA.previews.psaTopLace,
  LOUNGE_TV_MEDIA.previews.straightFrontal,
  LOUNGE_TV_MEDIA.previews.straightClosure,
  LOUNGE_TV_MEDIA.previews.loungeAnimation,
] as const;

function videoForPack(id: string): string | undefined {
  if (id === LOUNGE_TV_PLUCKING_LACE_TILE_ID) return LOUNGE_TV_CONTENT_VIDEO_SRC;
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h + id.charCodeAt(i) * (i + 1)) % LOCAL_PREVIEW_POOL.length;
  return LOCAL_PREVIEW_POOL[h] ?? LOUNGE_TV_MEDIA.previews.loungeAnimation;
}

const LACE_ARTICLE_BASE = {
  takeaways: [
    'MAP YOUR HAIRLINE BEFORE YOU CUT',
    'USE SMALL SCISSOR SNIPS — NEVER ONE LONG CUT',
    'LEAVE A LACE BUFFER UNTIL AFTER YOUR FIRST WEAR',
    'BLEND EDGES WITH TINT AFTER THE TRIM',
  ],
  steps: [
    {
      title: 'STEP 1 — MARK YOUR HAIRLINE',
      body: 'PLACE THE UNIT ON A MANNEQUIN OR YOUR HEAD. TRACE WHERE YOUR NATURAL HAIRLINE SITS WITH A WASHABLE MARKER.',
    },
    {
      title: 'STEP 2 — TRIM IN SECTIONS',
      body: 'CUT AWAY EXCESS LACE IN SMALL SECTIONS. FOLLOW YOUR MARKED LINE AND CHECK SYMMETRY IN A MIRROR.',
    },
    {
      title: 'STEP 3 — REFINE THE EDGE',
      body: 'SNIP ANY JAGGED LACE. LEAVE A SLIGHT BUFFER IF THIS IS YOUR FIRST INSTALL — YOU CAN FINE-TUNE AFTER MELT.',
    },
    {
      title: 'STEP 4 — PREP FOR INSTALL',
      body: 'TINT IF NEEDED, THEN PROCEED TO BLEACH / PLUCK / MELT STEPS FOR A SEAMLESS FINISH.',
    },
  ],
};

const LOUNGE_TV_CONTENT_PACKS_RAW: LoungeContentPack[] = [
  {
    id: 'cutting-lace',
    title: 'CUTTING YOUR LACE',
    subtitle: 'TRIM AND SHAPE YOUR LACE FRONT FOR A CLEAN HAIRLINE BEFORE INSTALL.',
    category: 'Lace Mastery',
    series: 'Lace Mastery',
    originalSeries: 'PSA ACADEMY',
    programSeries: 'psa-academy',
    host: 'PSA',
    season: 1,
    episode: 1,
    episodeTitle: 'CHOOSING YOUR LACE',
    difficulty: 'BEGINNER',
    runtime: '8 MIN',
    readTime: '4 MIN',
    ticketCost: 0,
    isFreePreview: true,
    isNew: true,
    isFeatured: true,
    isTrending: true,
    isRecommended: true,
    justAdded: true,
    membersFavorite: true,
    featuredPremiere: 'featured-lesson',
    contentFormat: 'both',
    thumbnail: '/assets/NOIR/wave-thumb.png',
    heroImage: '/assets/NOIR/wave-thumb.png',
    previewVideo: videoForPack('cutting-lace'),
    fullVideo: videoForPack('cutting-lace'),
    learningPathId: 'lace-mastery',
    learningPathOrder: 1,
    featuredRows: ['hero', 'new', 'trending', 'psa-recommends', 'recently-added', 'members-favorites'],
    streaming: {
      seriesId: 'psa-academy-s1',
      durationSec: 8 * 60,
      artwork: {
        landscapeCover: '/assets/NOIR/wave-thumb.png',
        portraitCover: '/assets/NOIR/noir-thumb.png',
        heroBanner: '/assets/NOIR/wave-thumb.png',
        episodeThumbnail: '/assets/NOIR/wave-thumb.png',
        previewImage: '/assets/NOIR/blanco-thumb.png',
        hoverImage: '/assets/NOIR/curl-thumb.png',
      },
      productIntegration: { unitKey: 'noir', installationGuideIds: ['cutting-lace'] },
      achievementsFuture: { certificateEligible: true, loyaltyPoints: 50 },
      analyticsSeed: { views: 1240, completionRate: 0.72, averageWatchTimeSec: 360 },
    },
    releaseDate: '2026-06-28',
    tags: ['lace', 'install', 'beginner'],
    article: {
      intro:
        'A CLEAN LACE CUT IS THE FOUNDATION OF EVERY UNDETECTABLE INSTALL. THIS GUIDE WALKS YOU THROUGH MAPPING, TRIMMING, AND REFINING YOUR FRONTAL EDGE.',
      ...LACE_ARTICLE_BASE,
    },
    transcript:
      'WELCOME TO LACE MASTERY. TODAY WE MAP THE HAIRLINE, TRIM IN SECTIONS, AND LEAVE ROOM TO REFINE AFTER YOUR FIRST WEAR.',
    checklist: [
      'MARK HAIRLINE',
      'TRIM IN SECTIONS',
      'CHECK SYMMETRY',
      'LEAVE BUFFER LACE',
      'TINT IF NEEDED',
    ],
    productsUsed: [
      { name: 'LACE SCISSORS', shopHref: '/home/shop' },
      { name: 'WASHABLE MARKER', shopHref: '/home/shop' },
    ],
    relatedLessons: ['tinting-lace', 'bleaching-knots'],
  },
  {
    id: 'tinting-lace',
    title: 'TINTING YOUR LACE',
    subtitle: 'CUSTOM TINT LACE TO MATCH YOUR SKIN TONE FOR AN UNDETECTABLE BLEND.',
    category: 'Lace Mastery',
    series: 'Lace Mastery',
    difficulty: 'INTERMEDIATE',
    runtime: '5 MIN',
    readTime: '3 MIN',
    ticketCost: 1,
    contentFormat: 'both',
    thumbnail: '/assets/NOIR/curl-thumb.png',
    heroImage: '/assets/NOIR/curl-thumb.png',
    previewVideo: videoForPack('tinting-lace'),
    fullVideo: videoForPack('tinting-lace'),
    learningPathId: 'lace-mastery',
    learningPathOrder: 3,
    host: 'PSA',
    originalSeries: 'PSA ACADEMY',
    season: 1,
    episode: 3,
    episodeTitle: 'TINTING YOUR LACE',
    isTrending: true,
    featuredRows: ['trending', 'recently-added'],
    releaseDate: '2026-07-12',
    article: {
      intro: 'MATCH LACE TO YOUR UNDERTONE SO EDGES DISAPPEAR ON CAMERA AND IN NATURAL LIGHT.',
      takeaways: ['TEST ON A SCRAP FIRST', 'BUILD COLOR IN LAYERS', 'LET DRY FULLY BEFORE INSTALL'],
      steps: [
        { title: 'STEP 1 — MIX TINT', body: 'CHOOSE A SHADE ONE STEP LIGHTER THAN YOUR SKIN. MIX PER PRODUCT INSTRUCTIONS.' },
        { title: 'STEP 2 — APPLY', body: 'DAB ONTO LACE ONLY. AVOID THE HAIRLINE FIBERS.' },
      ],
    },
    relatedLessons: ['cutting-lace', 'melting-lace'],
  },
  {
    id: 'bleaching-knots',
    title: 'BLEACHING YOUR KNOTS',
    subtitle: 'LIGHTEN KNOTS SAFELY SO PART LINES AND EDGES DISAPPEAR ON CAMERA.',
    category: 'Lace Mastery',
    series: 'Lace Mastery',
    difficulty: 'INTERMEDIATE',
    runtime: '6 MIN',
    readTime: '4 MIN',
    ticketCost: 1,
    contentFormat: 'both',
    thumbnail: '/assets/NOIR/noir-thumb.png',
    heroImage: '/assets/NOIR/noir-thumb.png',
    previewVideo: videoForPack('bleaching-knots'),
    fullVideo: videoForPack('bleaching-knots'),
    learningPathId: 'lace-mastery',
    learningPathOrder: 2,
    host: 'PSA',
    originalSeries: 'PSA ACADEMY',
    season: 1,
    episode: 2,
    episodeTitle: 'BLEACHING YOUR KNOTS',
    isRecommended: true,
    featuredRows: ['psa-recommends', 'recently-added'],
    releaseDate: '2026-07-05',
    article: {
      intro: 'CONTROLLED BLEACHING OPENS THE LACE WITHOUT DAMAGING FIBERS.',
      takeaways: ['WATCH THE CLOCK', 'RINSE THOROUGHLY', 'NEUTRALIZE AFTER BLEACH'],
      steps: [
        { title: 'STEP 1 — PREP', body: 'PLACE UNIT ON A STAND. PROTECT HAIR YOU ARE NOT LIGHTENING.' },
        { title: 'STEP 2 — APPLY BLEACH', body: 'PAINT KNOTS ONLY. CHECK EVERY 5–10 MINUTES.' },
      ],
    },
    relatedLessons: ['plucking-lace'],
  },
  {
    id: 'plucking-lace',
    title: 'PLUCKING YOUR LACE',
    subtitle: 'PLUCK DENSITY ALONG THE HAIRLINE FOR A NATURAL, LESS WIGGY FINISH.',
    category: 'Lace Mastery',
    series: 'Lace Mastery',
    difficulty: 'ADVANCED',
    runtime: '7 MIN',
    readTime: '5 MIN',
    ticketCost: 2,
    contentFormat: 'both',
    thumbnail: '/assets/NOIR/blanco-thumb.png',
    heroImage: '/assets/NOIR/blanco-thumb.png',
    previewVideo: videoForPack(LOUNGE_TV_PLUCKING_LACE_TILE_ID),
    fullVideo: videoForPack(LOUNGE_TV_PLUCKING_LACE_TILE_ID),
    learningPathId: 'lace-mastery',
    learningPathOrder: 4,
    host: 'PSA',
    originalSeries: 'PSA ACADEMY',
    season: 1,
    episode: 4,
    episodeTitle: 'PLUCKING YOUR LACE',
    featuredRows: ['premium', 'members-favorites'],
    releaseDate: '2026-07-15',
    isPremium: false,
    article: {
      intro: 'STRATEGIC PLUCKING CREATES A GRADUATED HAIRLINE THAT MIMICS NATURAL GROWTH.',
      takeaways: ['PLUCK FROM THE UNDERSIDE', 'WORK IN SMALL ZONES', 'STEP BACK OFTEN'],
      steps: [
        { title: 'STEP 1 — SECTION', body: 'DIVIDE THE HAIRLINE INTO THREE ZONES: CENTER, LEFT, RIGHT.' },
        { title: 'STEP 2 — PLUCK', body: 'REMOVE 1–3 HAIRS AT A TIME. BLEND DENSITY GRADUALLY.' },
      ],
    },
    relatedLessons: ['melting-lace'],
  },
  {
    id: 'melting-lace',
    title: 'MELTING YOUR LACE',
    subtitle: 'MELT LACE INTO THE SKIN USING THE RIGHT ADHESIVE AND PRESSURE TECHNIQUE.',
    category: 'Install Like A Pro',
    series: 'Install Like A Pro',
    difficulty: 'INTERMEDIATE',
    runtime: '5 MIN',
    readTime: '3 MIN',
    ticketCost: 1,
    contentFormat: 'both',
    thumbnail: '/assets/NOIR/wave-thumb.png',
    heroImage: '/assets/NOIR/wave-thumb.png',
    previewVideo: videoForPack('melting-lace'),
    fullVideo: videoForPack('melting-lace'),
    learningPathId: 'install-pro',
    featuredRows: ['trending'],
    releaseDate: '2026-07-19',
    article: {
      intro: 'MELTING IS WHERE LACE BECOMES SKIN. PRESSURE, HEAT, AND TIMING MATTER.',
      takeaways: ['PREP SKIN FIRST', 'USE THIN ADHESIVE LAYERS', 'PRESS — DO NOT SLIDE'],
      steps: [
        { title: 'STEP 1 — ADHESIVE', body: 'APPLY A THIN, EVEN LAYER. LET TACK UP PER PRODUCT SPECS.' },
        { title: 'STEP 2 — MELT', body: 'PRESS WITH A WRAP OR BAND. APPLY GENTLE HEAT IF RECOMMENDED.' },
      ],
    },
    relatedLessons: ['extending-install'],
  },
  {
    id: 'extending-install',
    title: 'EXTENDING YOUR INSTALL',
    subtitle: 'EXTEND WEAR TIME WITH REINFORCEMENT ZONES AND TENSION-FREE STITCHING.',
    category: 'Install Like A Pro',
    series: 'Install Like A Pro',
    difficulty: 'ADVANCED',
    runtime: '8 MIN',
    readTime: '4 MIN',
    ticketCost: 2,
    contentFormat: 'both',
    thumbnail: '/assets/NOIR/curl-thumb.png',
    heroImage: '/assets/NOIR/curl-thumb.png',
    previewVideo: videoForPack('extending-install'),
    fullVideo: videoForPack('extending-install'),
    learningPathId: 'install-pro',
    article: {
      intro: 'LONG-WEAR INSTALLS NEED REINFORCEMENT WITHOUT ADDING BULK AT THE HAIRLINE.',
      takeaways: ['REINFORCE PERIMETER', 'AVOID TENSION AT TEMPLES', 'CHECK ADHESIVE WEEKLY'],
      steps: [
        { title: 'STEP 1 — MAP STRESS POINTS', body: 'IDENTIFY TEMPLES AND NAPE AS PRIMARY WEAR ZONES.' },
        { title: 'STEP 2 — REINFORCE', body: 'ADD SUPPORT STITCHES OR TAPES WHERE NEEDED — NOT AT THE FRONT EDGE.' },
      ],
    },
  },
  {
    id: 'cleaning-lace',
    title: 'CLEANING YOUR LACE',
    subtitle: 'REMOVE BUILDUP AND RESET LACE WITHOUT DAMAGING FIBERS OR TINT.',
    category: 'Hair Care',
    series: 'Hair Care',
    difficulty: 'BEGINNER',
    runtime: '4 MIN',
    readTime: '3 MIN',
    ticketCost: 0,
    isFreePreview: true,
    contentFormat: 'both',
    thumbnail: '/assets/NOIR/noir-thumb.png',
    heroImage: '/assets/NOIR/noir-thumb.png',
    previewVideo: videoForPack('cleaning-lace'),
    fullVideo: videoForPack('cleaning-lace'),
    learningPathId: 'hair-care',
    featuredRows: ['new'],
    releaseDate: '2026-08-02',
    article: {
      intro: 'GENTLE CLEANSING EXTENDS THE LIFE OF YOUR LACE AND KEEPS TINT TRUE.',
      takeaways: ['DETANGLE FIRST', 'USE SULFATE-FREE CLEANSER', 'AIR DRY ON A STAND'],
      steps: [
        { title: 'STEP 1 — DETANGLE', body: 'WORK FROM ENDS UP WITH A WIDE-TOOTH COMB.' },
        { title: 'STEP 2 — WASH', body: 'SUBMERGE LACE ONLY. SWISH — DO NOT SCRUB KNOTS.' },
      ],
    },
  },
  {
    id: 'styling-layers-demo',
    title: 'LAYERED STYLING BASICS',
    subtitle: 'BUILD SOFT LAYERS THAT FRAME THE FACE WITHOUT HIDING THE LACE LINE.',
    category: 'STYLING',
    series: 'STYLING',
    difficulty: 'INTERMEDIATE',
    runtime: '6 MIN',
    readTime: '4 MIN',
    ticketCost: 1,
    contentFormat: 'both',
    thumbnail: '/assets/NOIR/wave-thumb.png',
    heroImage: '/assets/NOIR/wave-thumb.png',
    previewVideo: videoForPack('styling-layers-demo'),
    fullVideo: videoForPack('styling-layers-demo'),
    learningPathId: 'styling-academy',
    exploreSectionId: 'slay-cam',
    article: {
      intro: 'FACE-FRAMING LAYERS SHOULD ENHANCE THE INSTALL — NOT COVER YOUR HARD WORK.',
      takeaways: ['CUT DRY WHEN POSSIBLE', 'POINT-CUT FOR SOFTNESS', 'SET WITH LOW HEAT'],
      steps: [
        { title: 'STEP 1 — SECTION', body: 'ISOLATE FRONT LAYERS FROM THE MAIN BODY.' },
        { title: 'STEP 2 — CUT + STYLE', body: 'POINT-CUT LAYERS. CURL AWAY FROM THE FACE.' },
      ],
    },
  },
  {
    id: 'color-lab-swatches',
    title: 'COLOR LAB — SWATCH MATCHING',
    subtitle: 'MATCH CUSTOM COLOR TO YOUR NATURAL UNDERTONE AND LIGHTING.',
    category: 'Color Lab',
    series: 'Color Lab',
    difficulty: 'ADVANCED',
    runtime: '7 MIN',
    readTime: '5 MIN',
    ticketCost: 2,
    isPremium: true,
    contentFormat: 'both',
    thumbnail: '/assets/NOIR/curl-thumb.png',
    heroImage: '/assets/NOIR/curl-thumb.png',
    previewVideo: videoForPack('color-lab-swatches'),
    fullVideo: videoForPack('color-lab-swatches'),
    learningPathId: 'color-lab',
    featuredRows: ['premium'],
    releaseDate: '2026-06-18',
    article: {
      intro: 'UNDERTONE IS EVERYTHING. TEST SWATCHES IN DAYLIGHT AND INDOOR LIGHT.',
      takeaways: ['IDENTIFY UNDERTONE', 'TEST TWO SWATCHES', 'DOCUMENT YOUR FORMULA'],
      steps: [
        { title: 'STEP 1 — UNDERTONE', body: 'WARM, COOL, OR NEUTRAL — MATCH THE LACE TINT AND FIBER TONE.' },
        { title: 'STEP 2 — SWATCH', body: 'APPLY TEST STRANDS. COMPARE IN NATURAL LIGHT.' },
      ],
    },
  },
  {
    id: 'baw-academy-intro',
    title: 'BUILD-A-WIG — PRODUCT WALKTHROUGH',
    subtitle: 'HOW TO USE BUILD-A-WIG OPTIONS TO PREVIEW YOUR FINAL LOOK.',
    category: 'Product Education',
    series: 'PSA TODAY',
    originalSeries: 'PRODUCT EDUCATION',
    difficulty: 'BEGINNER',
    runtime: '5 MIN',
    readTime: '3 MIN',
    ticketCost: 0,
    isFreePreview: true,
    contentFormat: 'both',
    thumbnail: '/assets/NOIR/blanco-thumb.png',
    heroImage: '/assets/NOIR/blanco-thumb.png',
    previewVideo: videoForPack('baw-academy-intro'),
    fullVideo: videoForPack('baw-academy-intro'),
    learningPathId: 'product-education',
    featuredRows: ['psa-recommends'],
    releaseDate: '2026-06-22',
    article: {
      intro: 'BUILD-A-WIG LETS YOU CUSTOMIZE LENGTH, DENSITY, COLOR, AND STYLING BEFORE YOU BUY.',
      takeaways: ['START WITH A UNIT', 'CONFIRM EACH STEP', 'SAVE YOUR BUILD'],
      steps: [
        { title: 'STEP 1 — CHOOSE UNIT', body: 'PICK NOIR, BLANCO, OR YOUR SIGNATURE TEXTURE.' },
        { title: 'STEP 2 — CUSTOMIZE', body: 'WALK THROUGH LENGTH, LACE, COLOR, AND STYLING OPTIONS.' },
      ],
    },
  },
  {
    id: 'product-breakdown-noir',
    title: 'NOIR — PRODUCT BREAKDOWN',
    subtitle: 'SIGNATURE STRAIGHT UNIT DOSSIER.',
    category: 'Product Education',
    originalSeries: 'PRODUCT EDUCATION',
    contentFormat: 'read',
    readTime: '4 MIN',
    ticketCost: 0,
    thumbnail: '/assets/NOIR/noir-thumb.png',
    heroImage: '/assets/2D%20NOIR%20FRONT.png',
    learningPathId: 'product-education',
    releaseDate: '2026-08-11',
  },
  {
    id: 'product-breakdown-blanco',
    title: 'BLANCO — PRODUCT BREAKDOWN',
    subtitle: 'SIGNATURE STRAIGHT UNIT DOSSIER.',
    category: 'Product Education',
    originalSeries: 'PRODUCT EDUCATION',
    contentFormat: 'read',
    readTime: '4 MIN',
    ticketCost: 0,
    thumbnail: '/assets/NOIR/blanco-thumb.png',
    heroImage: '/assets/2D%20BLANCO%20FRONT.png',
    learningPathId: 'product-education',
    releaseDate: '2026-08-11',
  },
  {
    id: 'product-breakdown-soft-wave',
    title: 'SOFT WAVE — PRODUCT BREAKDOWN',
    subtitle: 'SIGNATURE WAVY UNIT DOSSIER.',
    category: 'Product Education',
    originalSeries: 'PRODUCT EDUCATION',
    contentFormat: 'read',
    readTime: '4 MIN',
    ticketCost: 0,
    thumbnail: '/assets/NOIR/wave-thumb.png',
    heroImage: '/assets/NOIR/wave-thumb.png',
    learningPathId: 'product-education',
    releaseDate: '2026-08-11',
  },
  {
    id: 'product-breakdown-beach-wave',
    title: 'BEACH WAVE — PRODUCT BREAKDOWN',
    subtitle: 'SIGNATURE WAVY UNIT DOSSIER.',
    category: 'Product Education',
    originalSeries: 'PRODUCT EDUCATION',
    contentFormat: 'read',
    readTime: '4 MIN',
    ticketCost: 0,
    thumbnail: '/assets/NOIR/wave-thumb.png',
    heroImage: '/assets/NOIR/wave-thumb.png',
    learningPathId: 'product-education',
    releaseDate: '2026-08-11',
  },
  {
    id: 'product-breakdown-soft-curl',
    title: 'SOFT CURL — PRODUCT BREAKDOWN',
    subtitle: 'SIGNATURE CURLY UNIT DOSSIER.',
    category: 'Product Education',
    originalSeries: 'PRODUCT EDUCATION',
    contentFormat: 'read',
    readTime: '4 MIN',
    ticketCost: 0,
    thumbnail: '/assets/NOIR/curl-thumb.png',
    heroImage: '/assets/NOIR/curl-thumb.png',
    learningPathId: 'product-education',
    releaseDate: '2026-08-11',
  },
  {
    id: 'product-breakdown-ocean-curl',
    title: 'OCEAN CURL — PRODUCT BREAKDOWN',
    subtitle: 'SIGNATURE CURLY UNIT DOSSIER.',
    category: 'Product Education',
    originalSeries: 'PRODUCT EDUCATION',
    contentFormat: 'read',
    readTime: '4 MIN',
    ticketCost: 0,
    thumbnail: '/assets/NOIR/curl-thumb.png',
    heroImage: '/assets/NOIR/curl-thumb.png',
    learningPathId: 'product-education',
    releaseDate: '2026-08-11',
  },
  {
    id: 'psa-welcome-frontal-slayer',
    title: 'WELCOME TO FRONTAL SLAYER TV',
    subtitle: 'MEET PSA — YOUR LUXURY BEAUTY CONCIERGE AND HOST OF THE NETWORK.',
    category: 'PSA Welcome',
    originalSeries: 'FRONTAL SLAYER ORIGINALS',
    host: 'PSA',
    contentFormat: 'watch',
    runtime: '2 MIN',
    ticketCost: 0,
    isFreePreview: true,
    featuredPremiere: 'psa-welcome',
    thumbnail: '/assets/NOIR/noir-thumb.png',
    heroImage: '/assets/NOIR/noir-thumb.png',
    previewVideo: videoForPack('psa-welcome-frontal-slayer'),
    fullVideo: videoForPack('psa-welcome-frontal-slayer'),
    featuredRows: ['psa-recommends', 'members-favorites'],
    releaseDate: '2026-06-01',
  },
  {
    id: 'brand-film-noir',
    title: 'NOIR — BRAND FILM',
    subtitle: 'THE STORY BEHIND OUR SIGNATURE SILHOUETTE.',
    category: 'Brand Films',
    contentFormat: 'watch',
    runtime: '3 MIN',
    thumbnail: '/assets/NOIR/noir-thumb.png',
    heroImage: '/assets/NOIR/noir-thumb.png',
    previewVideo: videoForPack('brand-film-noir'),
    fullVideo: videoForPack('brand-film-noir'),
    exploreSectionId: 'brand-films',
    ticketCost: 0,
    isFreePreview: true,
    featuredPremiere: 'brand-film',
    host: 'PSA',
    featuredRows: ['members-favorites'],
    releaseDate: '2026-05-20',
  },
  {
    id: 'trend-report-summer',
    title: 'SUMMER TREND REPORT',
    subtitle: 'WHAT IS SLAYING THIS SEASON — LENGTH, PARTS, AND COLOR.',
    category: 'Trend Reports',
    contentFormat: 'read',
    readTime: '5 MIN',
    thumbnail: '/assets/NOIR/wave-thumb.png',
    heroImage: '/assets/NOIR/wave-thumb.png',
    exploreSectionId: 'trend-reports',
    featuredPremiere: 'seasonal-collection',
    ticketCost: 0,
    article: {
      intro: 'SUMMER CALLS FOR LIGHTER LAYERS, CENTER PARTS, AND GLOSSY FINISHES.',
      takeaways: ['SOFT LAYERS', 'MIDDLE PARTS', 'GLOSS WITHOUT GREASE'],
      steps: [{ title: 'TREND 01', body: 'SHOULDER-LENGTH WITH FACE-FRAMING LAYERS.' }],
    },
  },
  {
    id: 'slay-cam-client-01',
    title: 'SLAY CAM — CLIENT TRANSFORM',
    subtitle: 'REAL INSTALL, REAL RESULTS.',
    category: 'Slay Cam Stories',
    contentFormat: 'watch',
    runtime: '4 MIN',
    thumbnail: '/assets/NOIR/curl-thumb.png',
    heroImage: '/assets/NOIR/curl-thumb.png',
    previewVideo: videoForPack('slay-cam-client-01'),
    fullVideo: videoForPack('slay-cam-client-01'),
    exploreSectionId: 'slay-cam',
    ticketCost: 1,
  },
  {
    id: 'product-reveal-soft-wave',
    title: 'PRODUCT REVEAL — SOFT WAVE',
    subtitle: 'FIRST LOOK AT OUR SOFT WAVE TEXTURE.',
    category: 'Product Reveals',
    contentFormat: 'both',
    runtime: '2 MIN',
    readTime: '2 MIN',
    thumbnail: '/assets/NOIR/wave-thumb.png',
    heroImage: '/assets/NOIR/wave-thumb.png',
    previewVideo: videoForPack('product-reveal-soft-wave'),
    fullVideo: videoForPack('product-reveal-soft-wave'),
    exploreSectionId: 'product-reveals',
    ticketCost: 0,
    isFreePreview: true,
    featuredPremiere: 'product-premiere',
    host: 'PSA',
    justAdded: true,
    featuredRows: ['new', 'recently-added'],
    releaseDate: '2026-07-08',
    article: {
      intro: 'SOFT WAVE DELIVERS MOVEMENT WITHOUT WEIGHT.',
      takeaways: ['LIGHT BODY', 'EASY STYLING', 'HD-FRIENDLY SHEEN'],
      steps: [],
    },
  },
  {
    id: 'behind-brand-studio',
    title: 'BEHIND THE BRAND — STUDIO DAY',
    subtitle: 'A DAY ON SET WITH THE FRONTAL SLAYER TEAM.',
    category: 'Behind the Brand',
    contentFormat: 'watch',
    runtime: '6 MIN',
    thumbnail: '/assets/NOIR/blanco-thumb.png',
    heroImage: '/assets/NOIR/blanco-thumb.png',
    previewVideo: videoForPack('behind-brand-studio'),
    fullVideo: videoForPack('behind-brand-studio'),
    exploreSectionId: 'behind-brand',
    ticketCost: 0,
    isFreePreview: true,
  },
  {
    id: 'psa-session-lace-qa',
    title: 'PSA SESSION — LACE Q&A',
    subtitle: 'FOUNDER ANSWERS YOUR TOP LACE QUESTIONS.',
    category: 'PSA Sessions',
    contentFormat: 'both',
    runtime: '10 MIN',
    readTime: '6 MIN',
    thumbnail: '/assets/NOIR/noir-thumb.png',
    heroImage: '/assets/NOIR/noir-thumb.png',
    previewVideo: videoForPack('psa-session-lace-qa'),
    fullVideo: videoForPack('psa-session-lace-qa'),
    exploreSectionId: 'psa-sessions',
    ticketCost: 1,
    isPremium: true,
    article: {
      intro: 'YOUR MOST-ASKED LACE QUESTIONS — ANSWERED IN ONE SESSION.',
      takeaways: ['BUFFER LACE ON FIRST CUT', 'TINT BEFORE BLEACH WHEN POSSIBLE', 'MELT WITH PATIENCE'],
      steps: [],
    },
  },
  {
    id: 'transformation-diary-noir-install',
    title: 'TRANSFORMATION DIARY — NOIR INSTALL',
    subtitle: 'FROM CONSULT TO CAMERA-READY — A MEMBER JOURNEY.',
    category: 'Transformation Diaries',
    originalSeries: 'TRANSFORMATION DIARIES',
    host: 'PSA',
    contentFormat: 'both',
    runtime: '5 MIN',
    readTime: '3 MIN',
    thumbnail: '/assets/NOIR/noir-thumb.png',
    heroImage: '/assets/NOIR/noir-thumb.png',
    previewVideo: videoForPack('transformation-diary-noir-install'),
    fullVideo: videoForPack('transformation-diary-noir-install'),
    exploreSectionId: 'transformation-diaries',
    ticketCost: 0,
    isFreePreview: true,
    article: {
      intro: 'REAL TIMELINE — CONSULT, CUSTOM BUILD, INSTALL, AND REVEAL.',
      takeaways: ['DOCUMENT EACH STAGE', 'PROTECT YOUR LACE', 'CELEBRATE THE REVEAL'],
      steps: [{ title: 'CHAPTER 1', body: 'CONSULT AND UNIT SELECTION WITH PSA.' }],
    },
  },
  {
    id: 'founder-story-origin',
    title: 'FOUNDER STORY — WHY FRONTAL SLAYER',
    subtitle: 'THE MISSION BEHIND THE BRAND AND THE LOUNGE.',
    category: 'Founder Stories',
    originalSeries: 'FOUNDER SESSIONS',
    host: 'PSA',
    contentFormat: 'watch',
    runtime: '4 MIN',
    thumbnail: '/assets/NOIR/blanco-thumb.png',
    heroImage: '/assets/NOIR/blanco-thumb.png',
    previewVideo: videoForPack('founder-story-origin'),
    fullVideo: videoForPack('founder-story-origin'),
    exploreSectionId: 'founder-stories',
    ticketCost: 0,
    isFreePreview: true,
  },
  {
    id: 'texture-spotlight-ocean-curl',
    title: 'TEXTURE SPOTLIGHT — OCEAN CURL',
    subtitle: 'MOVEMENT, SHINE, AND INSTALL TIPS FOR OCEAN CURL.',
    category: 'Texture Spotlights',
    originalSeries: 'LUXURY HAIR SCIENCE',
    host: 'PSA',
    contentFormat: 'both',
    runtime: '3 MIN',
    readTime: '2 MIN',
    thumbnail: '/assets/NOIR/curl-thumb.png',
    heroImage: '/assets/NOIR/curl-thumb.png',
    previewVideo: videoForPack('texture-spotlight-ocean-curl'),
    fullVideo: videoForPack('texture-spotlight-ocean-curl'),
    exploreSectionId: 'texture-spotlights',
    ticketCost: 0,
    isFreePreview: true,
    article: {
      intro: 'OCEAN CURL BALANCES DEFINITION WITH SOFT BODY FOR EVERYDAY SLAY.',
      takeaways: ['DETANGLE WET', 'USE LIGHT HOLD', 'PROTECT OVERNIGHT'],
      steps: [],
    },
  },
  {
    id: 'customer-favorite-middle-part',
    title: 'CUSTOMER FAVORITE — MIDDLE PART NOIR',
    subtitle: 'THE LOOK MEMBERS REPLAY MOST THIS MONTH.',
    category: 'Customer Favorites',
    originalSeries: 'MEMBERS FAVORITES',
    host: 'PSA',
    contentFormat: 'watch',
    runtime: '3 MIN',
    thumbnail: '/assets/NOIR/noir-thumb.png',
    heroImage: '/assets/NOIR/noir-thumb.png',
    previewVideo: videoForPack('customer-favorite-middle-part'),
    fullVideo: videoForPack('customer-favorite-middle-part'),
    exploreSectionId: 'customer-favorites',
    ticketCost: 1,
    membersFavorite: true,
    featuredRows: ['members-favorites'],
    releaseDate: '2026-07-02',
  },
  {
    id: 'luxury-hair-science-fiber-care',
    title: 'LUXURY HAIR SCIENCE — FIBER CARE',
    subtitle: 'HOW PREMIUM FIBERS HOLD COLOR, SHINE, AND STRUCTURE.',
    category: 'Luxury Hair Science',
    originalSeries: 'LUXURY HAIR SCIENCE',
    host: 'PSA',
    contentFormat: 'read',
    readTime: '6 MIN',
    thumbnail: '/assets/NOIR/wave-thumb.png',
    heroImage: '/assets/NOIR/wave-thumb.png',
    exploreSectionId: 'luxury-hair-science',
    ticketCost: 0,
    isFreePreview: true,
    article: {
      intro: 'SCIENCE-FORWARD CARE WITHOUT STRIPPING YOUR INVESTMENT.',
      takeaways: ['PH-BALANCED CLEANSE', 'HEAT WITH BARRIER', 'STORE ON A STAND'],
      steps: [{ title: 'LAB NOTE 1', body: 'FIBER CUTICLE BEHAVIOR UNDER HEAT AND HUMIDITY.' }],
    },
  },
  {
    id: 'psa-answers-lace-faq',
    title: 'PSA ANSWERS — LACE FAQ',
    subtitle: 'YOUR TOP LACE QUESTIONS IN ONE LUXURY FAQ EPISODE.',
    category: 'PSA Answers',
    originalSeries: 'PSA ANSWERS',
    episode: 1,
    host: 'PSA',
    contentFormat: 'both',
    runtime: '4 MIN',
    readTime: '3 MIN',
    thumbnail: '/assets/NOIR/wave-thumb.png',
    heroImage: '/assets/NOIR/wave-thumb.png',
    previewVideo: videoForPack('psa-answers-lace-faq'),
    fullVideo: videoForPack('psa-answers-lace-faq'),
    exploreSectionId: 'psa-sessions',
    ticketCost: 0,
    isFreePreview: true,
    featuredPremiere: 'new-this-week',
    featuredRows: ['new', 'recently-added'],
    releaseDate: '2026-07-10',
    article: {
      intro: 'SHORT ANSWERS — NO GATEKEEPING.',
      takeaways: ['BUFFER LACE', 'TINT BEFORE BLEACH WHEN YOU CAN', 'MELT WITH PATIENCE'],
      steps: [],
    },
  },
  {
    id: 'slay-school-first-install',
    title: 'SLAY SCHOOL — YOUR FIRST INSTALL',
    subtitle: 'A QUICK BEGINNER EPISODE BEFORE YOU PRESS GO.',
    category: 'Slay School',
    originalSeries: 'SLAY SCHOOL',
    host: 'PSA',
    difficulty: 'BEGINNER',
    contentFormat: 'watch',
    runtime: '3 MIN',
    thumbnail: '/assets/NOIR/blanco-thumb.png',
    heroImage: '/assets/NOIR/blanco-thumb.png',
    previewVideo: videoForPack('slay-school-first-install'),
    fullVideo: videoForPack('slay-school-first-install'),
    learningPathId: 'beginner-essentials',
    learningPathOrder: 1,
    ticketCost: 0,
    isFreePreview: true,
    featuredRows: ['new'],
    releaseDate: '2026-07-04',
  },
];

export const LOUNGE_TV_CONTENT_PACKS: LoungeContentPack[] = hydrateAllContentPacks(LOUNGE_TV_CONTENT_PACKS_RAW);

const packById = new Map(LOUNGE_TV_CONTENT_PACKS.map((p) => [p.id, p]));

export function getContentPackById(id: string): LoungeContentPack | undefined {
  return packById.get(id);
}

export function resolveContentPackFormat(pack: LoungeContentPack): ContentPackFormatBadge {
  if (pack.contentFormat === 'watch') return 'WATCH';
  if (pack.contentFormat === 'read') return 'READ';
  if (pack.contentFormat === 'both') return 'BOTH';
  const hasVideo = Boolean(pack.fullVideo || pack.previewVideo);
  const hasArticle = Boolean(pack.article?.intro || pack.article?.steps?.length);
  if (hasVideo && hasArticle) return 'BOTH';
  if (hasVideo) return 'WATCH';
  return 'READ';
}

export function contentPacksForLearningPath(pathId: string): LoungeContentPack[] {
  return LOUNGE_TV_CONTENT_PACKS.filter((p) => p.learningPathId === pathId).sort((a, b) => {
    const ao = a.learningPathOrder ?? 999;
    const bo = b.learningPathOrder ?? 999;
    if (ao !== bo) return ao - bo;
    return (a.episode ?? 999) - (b.episode ?? 999);
  });
}

export function contentPacksForExploreSection(sectionId: string): LoungeContentPack[] {
  return LOUNGE_TV_CONTENT_PACKS.filter((p) => p.exploreSectionId === sectionId);
}

export function contentPacksForFeaturedRow(
  row: NonNullable<LoungeContentPack['featuredRows']>[number]
): LoungeContentPack[] {
  return LOUNGE_TV_CONTENT_PACKS.filter((p) => p.featuredRows?.includes(row));
}

export function contentPackPrimaryRuntimeForCard(pack: LoungeContentPack): string | null {
  const format = resolveContentPackFormat(pack);
  if (format === 'READ') return pack.readTime ?? null;
  if (pack.runtime) return pack.runtime;
  if (format === 'BOTH' && pack.readTime) return pack.readTime;
  return pack.readTime ?? pack.runtime ?? null;
}

export function contentPackRuntimeOrRead(pack: LoungeContentPack): string {
  const primary = contentPackPrimaryRuntimeForCard(pack);
  if (primary) return primary;
  const badge = resolveContentPackFormat(pack);
  if (badge === 'BOTH' && pack.runtime && pack.readTime) return `${pack.runtime} · ${pack.readTime}`;
  return pack.runtime ?? pack.readTime ?? '';
}

export function relatedContentPacks(pack: LoungeContentPack): LoungeContentPack[] {
  if (!pack.relatedLessons?.length) return [];
  return pack.relatedLessons
    .map((id) => getContentPackById(id))
    .filter((p): p is LoungeContentPack => Boolean(p));
}
