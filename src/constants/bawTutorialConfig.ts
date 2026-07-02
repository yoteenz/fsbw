/** Guest Build-A-Wig tutorial — limited palette, static preview, shareable slay card. */

export type BawTutorialStepId = 'intro' | 'length' | 'density' | 'color' | 'styling' | 'card';

export const BAW_TUTORIAL_STEPS: BawTutorialStepId[] = [
  'intro',
  'length',
  'density',
  'color',
  'styling',
  'card',
];

export type BawTutorialSelections = {
  unit: string;
  capSize: string;
  length: string;
  density: string;
  color: string;
  styling: string;
};

export const BAW_TUTORIAL_DEFAULT_SELECTIONS: BawTutorialSelections = {
  unit: 'NOIR',
  capSize: 'M',
  length: '24"',
  density: '200%',
  color: 'OFF BLACK',
  styling: 'NONE',
};

export const BAW_TUTORIAL_OPTIONS = {
  length: ['22"', '24"', '26"'] as const,
  density: ['200%', '250%'] as const,
  color: ['OFF BLACK', 'JET BLACK', 'CHOCOLATE BROWN'] as const,
  styling: ['NONE', 'LAYERS'] as const,
};

/** Generic in-flow guide copy — not PSA / founder branded. */
export const BAW_TUTORIAL_GUIDE_COPY: Record<BawTutorialStepId, { title: string; body: string }> = {
  intro: {
    title: 'WELCOME TO THE BUILDER',
    body: 'TRY A FEW CHOICES FREE — NO SIGN-IN. FINISH WITH A SHAREABLE SLAY CARD.',
  },
  length: {
    title: 'PICK YOUR LENGTH',
    body: 'LENGTH SETS THE SILHOUETTE. MOST START AROUND 24".',
  },
  density: {
    title: 'PICK YOUR DENSITY',
    body: 'HIGHER DENSITY = FULLER HAIR. 200% IS THE EVERYDAY SWEET SPOT.',
  },
  color: {
    title: 'PICK YOUR COLOR',
    body: 'COLOR IS PREMIUM IN THE FULL BUILDER — TRY IT HERE FIRST.',
  },
  styling: {
    title: 'PICK YOUR STYLING',
    body: 'LAYERS ADD MOVEMENT. SALON STYLES AND BANGS UNLOCK IN THE FULL FLOW.',
  },
  card: {
    title: 'YOUR SLAY CARD',
    body: 'SAVE OR SHARE YOUR LOOK. SIGN IN TO OPEN THE FULL BUILD-A-WIG.',
  },
};

export const BAW_TUTORIAL_ROUTE = '/build-a-wig/try';

/** URL slugs for product-specific guest try routes (`/build-a-wig/try/{slug}`). */
export const BAW_TRY_UNIT_SLUGS = [
  'noir',
  'blanco',
  'soft-wave',
  'beach-wave',
  'soft-curl',
  'ocean-curl',
] as const;

export type BawTryUnitSlug = (typeof BAW_TRY_UNIT_SLUGS)[number];

const BAW_TRY_SLUG_TO_UNIT_LABEL: Record<BawTryUnitSlug, string> = {
  noir: 'NOIR',
  blanco: 'BLANCO',
  'soft-wave': 'SOFT WAVE',
  'beach-wave': 'BEACH WAVE',
  'soft-curl': 'SOFT CURL',
  'ocean-curl': 'OCEAN CURL',
};

export function isBawTryUnitSlug(value: string): value is BawTryUnitSlug {
  return (BAW_TRY_UNIT_SLUGS as readonly string[]).includes(value);
}

/** Menu + default try route is `/build-a-wig/try` (NOIR). Product PDPs use unit slugs. */
export function getBawTryRouteForUnitSlug(slug: BawTryUnitSlug | 'noir'): string {
  if (slug === 'noir') return BAW_TUTORIAL_ROUTE;
  return `${BAW_TUTORIAL_ROUTE}/${slug}`;
}

export function resolveBawTutorialUnitLabelFromPathname(pathname: string): string {
  const normalized = pathname.replace(/\/$/, '') || '/';
  if (normalized === BAW_TUTORIAL_ROUTE) return BAW_TRY_SLUG_TO_UNIT_LABEL.noir;
  const prefix = `${BAW_TUTORIAL_ROUTE}/`;
  if (!normalized.startsWith(prefix)) return BAW_TUTORIAL_DEFAULT_SELECTIONS.unit;
  const slug = normalized.slice(prefix.length).split('/')[0] ?? '';
  if (isBawTryUnitSlug(slug)) return BAW_TRY_SLUG_TO_UNIT_LABEL[slug];
  return BAW_TUTORIAL_DEFAULT_SELECTIONS.unit;
}

export function getBawCustomizePathForTutorialUnit(unitLabel: string): string {
  switch (unitLabel) {
    case 'BLANCO':
      return '/build-a-wig/blanco/customize';
    case 'SOFT WAVE':
      return '/build-a-wig/soft-wave/customize';
    case 'BEACH WAVE':
      return '/build-a-wig/beach-wave/customize';
    case 'SOFT CURL':
      return '/build-a-wig/soft-curl/customize';
    case 'OCEAN CURL':
      return '/build-a-wig/ocean-curl/customize';
    case 'NOIR':
    default:
      return '/build-a-wig/noir/customize';
  }
}

export function isBawTutorialPath(pathname: string): boolean {
  const p = pathname.replace(/\/$/, '') || '/';
  return p === BAW_TUTORIAL_ROUTE || p.startsWith(`${BAW_TUTORIAL_ROUTE}/`);
}
