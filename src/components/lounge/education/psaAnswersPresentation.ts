import { getContentPackById } from '../loungeTvContentPack';
import { getPsaAnswersPacks } from '../loungeTvLearnFormats';
import type { LoungeContentPack } from '../loungeTvContentPack';

/** Category filters — final labels per sprint spec. */
export const PSA_ANSWER_CATEGORY_FILTERS = [
  'ALL',
  'LIKES',
  'CARE',
  'LACE',
  'COLOR',
  'INSTALL',
  'STYLING',
  'UPKEEP',
] as const;

export type PsaAnswerCategoryFilter = (typeof PSA_ANSWER_CATEGORY_FILTERS)[number];

export type PsaAnswerCategory = Exclude<PsaAnswerCategoryFilter, 'ALL' | 'LIKES'>;

export type PsaAnswerPresentationEntry = {
  /** Stable presentation id (not necessarily pack id). */
  id: string;
  packId: string;
  displayQuestion: string;
  category: PsaAnswerCategory;
  focusTeaser: string;
  /** Future question search hooks — lowercase tokens. */
  searchTerms: string[];
};

export const PSA_ANSWERS_SECTION_TAGLINE =
  'QUICK ANSWERS TO THE QUESTIONS YOU\'RE ACTUALLY ASKING.';

/** Presentation-only mapping — canonical pack ids/titles unchanged. */
const PSA_ANSWER_PRESENTATION_ENTRIES: PsaAnswerPresentationEntry[] = [
  {
    id: 'psa-answer-lace-lift',
    packId: 'psa-answers-lace-faq',
    displayQuestion: 'WHY DOES MY LACE LIFT AT THE SIDES?',
    category: 'LACE',
    focusTeaser: 'IT\'S USUALLY ONE OF THREE THINGS.',
    searchTerms: ['lace', 'lift', 'sides', 'frontal', 'melting'],
  },
  {
    id: 'psa-answer-lace-buffer',
    packId: 'psa-answers-lace-faq',
    displayQuestion: 'SHOULD I LEAVE A LACE BUFFER ON FIRST CUT?',
    category: 'LACE',
    focusTeaser: 'BUFFER LACE CHANGES HOW YOUR HAIRLINE SETTLES.',
    searchTerms: ['lace', 'buffer', 'cut', 'hairline', 'trim'],
  },
  {
    id: 'psa-answer-lace-tint',
    packId: 'psa-answers-lace-faq',
    displayQuestion: 'SHOULD I TINT LACE BEFORE BLEACHING KNOTS?',
    category: 'LACE',
    focusTeaser: 'ORDER MATTERS MORE THAN MOST PEOPLE THINK.',
    searchTerms: ['tint', 'bleach', 'knots', 'lace', 'color'],
  },
];

/** DEV-ONLY — expands FAQ wall for collection density QA (stripped in production). */
const PSA_ANSWER_DEV_DENSITY_ENTRIES: PsaAnswerPresentationEntry[] = import.meta.env.DEV
  ? [
      {
        id: 'psa-answer-dev-care-wash',
        packId: 'psa-answers-lace-faq',
        displayQuestion: 'HOW OFTEN SHOULD I WASH MY LACE UNIT?',
        category: 'CARE',
        focusTeaser: 'OVER-WASHING CAN STRIP LACE FASTER THAN PRODUCT BUILDUP.',
        searchTerms: ['wash', 'care', 'lace', 'frequency'],
      },
      {
        id: 'psa-answer-dev-install-glue',
        packId: 'psa-answers-lace-faq',
        displayQuestion: 'WHICH GLUE WORKS BEST IN HUMID WEATHER?',
        category: 'INSTALL',
        focusTeaser: 'HUMIDITY CHANGES CURE TIME AND HOLD.',
        searchTerms: ['glue', 'install', 'humidity', 'hold'],
      },
      {
        id: 'psa-answer-dev-color-tone',
        packId: 'psa-answers-lace-faq',
        displayQuestion: 'WHY DOES MY UNIT LOOK ASHY IN PHOTOS?',
        category: 'COLOR',
        focusTeaser: 'LIGHTING AND TONE MISMATCH READ DIFFERENT ON CAMERA.',
        searchTerms: ['color', 'ashy', 'tone', 'photos'],
      },
      {
        id: 'psa-answer-dev-style-edges',
        packId: 'psa-answers-lace-faq',
        displayQuestion: 'HOW DO I LAY EDGES WITHOUT CRUNCH?',
        category: 'STYLING',
        focusTeaser: 'PRODUCT AMOUNT AND DIRECTION CHANGE THE FINISH.',
        searchTerms: ['edges', 'styling', 'lay', 'crunch'],
      },
      {
        id: 'psa-answer-dev-after-sleep',
        packId: 'psa-answers-lace-faq',
        displayQuestion: 'CAN I SLEEP IN MY UNIT SAFELY?',
        category: 'UPKEEP',
        focusTeaser: 'NIGHT ROUTINE PROTECTS LACE AND DENSITY.',
        searchTerms: ['sleep', 'upkeep', 'night', 'bonnet'],
      },
      {
        id: 'psa-answer-dev-lace-ghost',
        packId: 'psa-answers-lace-faq',
        displayQuestion: 'WHY DOES MY LACE LOOK WHITE AT THE PART?',
        category: 'LACE',
        focusTeaser: 'KNOT BLEACH AND TINT BALANCE CREATE THE MELT.',
        searchTerms: ['lace', 'white', 'part', 'bleach'],
      },
    ]
  : [];

const PACK_CATEGORY_OVERRIDES: Partial<Record<string, PsaAnswerCategory>> = {
  'psa-answers-lace-faq': 'LACE',
};

function inferCategoryFromPack(pack: LoungeContentPack): PsaAnswerCategory {
  if (PACK_CATEGORY_OVERRIDES[pack.id]) return PACK_CATEGORY_OVERRIDES[pack.id]!;

  const haystack = [
    pack.category,
    pack.series,
    pack.originalSeries,
    pack.title,
    pack.subtitle,
    ...(pack.tags ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toUpperCase();

  if (haystack.includes('LACE')) return 'LACE';
  if (haystack.includes('UPKEEP') || haystack.includes('AFTER CARE') || haystack.includes('AFTERCARE')) {
    return 'UPKEEP';
  }
  if (haystack.includes('CARE')) return 'CARE';
  if (haystack.includes('COLOR')) return 'COLOR';
  if (haystack.includes('INSTALL')) return 'INSTALL';
  if (haystack.includes('STYL')) return 'STYLING';
  return 'LACE';
}

function questionFromPack(pack: LoungeContentPack): string {
  const subtitle = pack.subtitle?.trim();
  if (subtitle && subtitle.endsWith('?')) return subtitle.toUpperCase();
  if (subtitle && subtitle.length <= 72) return subtitle.toUpperCase();
  const cleaned = pack.title.replace(/^PSA ANSWERS\s*[—–-]\s*/i, '').trim();
  if (cleaned.endsWith('?')) return cleaned.toUpperCase();
  return `${cleaned.toUpperCase()}?`;
}

function teaserFromPack(pack: LoungeContentPack): string {
  const takeaway = pack.article?.takeaways?.[0];
  if (takeaway) return `${takeaway.toUpperCase()} — PSA BREAKS IT DOWN.`;
  if (pack.article?.intro) return pack.article.intro.toUpperCase();
  return 'PSA ANSWERS IN MINUTES — NOT A FULL LESSON.';
}

function searchTermsFromEntry(entry: Pick<PsaAnswerPresentationEntry, 'displayQuestion' | 'category'>): string[] {
  return [
    entry.category.toLowerCase(),
    ...entry.displayQuestion.toLowerCase().replace(/[?]/g, '').split(/\s+/).filter((w) => w.length > 3),
  ];
}

/** Build browse entries from canonical packs + presentation overrides. */
export function listPsaAnswerPresentationEntries(): PsaAnswerPresentationEntry[] {
  const packs = getPsaAnswersPacks();
  const mappedPackIds = new Set(
    [...PSA_ANSWER_PRESENTATION_ENTRIES, ...PSA_ANSWER_DEV_DENSITY_ENTRIES].map((e) => e.packId),
  );

  const fromPresentation = [...PSA_ANSWER_PRESENTATION_ENTRIES, ...PSA_ANSWER_DEV_DENSITY_ENTRIES].filter(
    (entry) => Boolean(getContentPackById(entry.packId)),
  );

  const fallbackEntries = packs
    .filter((pack) => !mappedPackIds.has(pack.id))
    .map((pack) => {
      const category = inferCategoryFromPack(pack);
      const displayQuestion = questionFromPack(pack);
      return {
        id: `psa-answer-${pack.id}`,
        packId: pack.id,
        displayQuestion,
        category,
        focusTeaser: teaserFromPack(pack),
        searchTerms: searchTermsFromEntry({ displayQuestion, category }),
      } satisfies PsaAnswerPresentationEntry;
    });

  return [...fromPresentation, ...fallbackEntries];
}

export function filterPsaAnswerEntries(
  entries: PsaAnswerPresentationEntry[],
  category: PsaAnswerCategoryFilter,
  context?: { isPackLiked?: (packId: string) => boolean },
): PsaAnswerPresentationEntry[] {
  if (category === 'ALL') return entries;
  if (category === 'LIKES') {
    return entries.filter((entry) => Boolean(context?.isPackLiked?.(entry.packId)));
  }
  return entries.filter((entry) => entry.category === category);
}

export function resolvePsaAnswerPack(entry: PsaAnswerPresentationEntry): LoungeContentPack | undefined {
  return getContentPackById(entry.packId);
}
