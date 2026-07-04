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
    title: 'WELCOME TO BUILD-A-WIG!',
    body: 'TRY THIS FEATURE FREE OF CHARGE AND EXPLORE OUR CUSTOMIZATION OPTIONS, NO SIGN-IN REQUIRED. FINISH WITH A SHAREABLE SLAY CARD.',
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

export const BAW_TUTORIAL_ROUTE = '/build-a-wig/view';

/** Legacy guest route before try → view rename; redirects in `App.tsx`. */
export const BAW_VIEW_LEGACY_TRY_ROUTE = '/build-a-wig/try';

/** Map legacy `/build-a-wig/try/…` URLs to `/build-a-wig/view/…`. */
export function normalizeBawViewPathname(pathname: string): string {
  const p = pathname.replace(/\/$/, '') || '/';
  if (p === BAW_VIEW_LEGACY_TRY_ROUTE || p.startsWith(`${BAW_VIEW_LEGACY_TRY_ROUTE}/`)) {
    return `${BAW_TUTORIAL_ROUTE}${p.slice(BAW_VIEW_LEGACY_TRY_ROUTE.length)}`;
  }
  return p;
}

/** URL slugs for product-specific guest view routes (`/build-a-wig/view/{slug}`). */
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

/** Menu + default view route is `/build-a-wig/view` (NOIR). Product PDPs use unit slugs. */
export function getBawTryRouteForUnitSlug(slug: BawTryUnitSlug | 'noir'): string {
  if (slug === 'noir') return BAW_TUTORIAL_ROUTE;
  return `${BAW_TUTORIAL_ROUTE}/${slug}`;
}

export function resolveBawTutorialUnitLabelFromPathname(pathname: string): string {
  const normalized = normalizeBawViewPathname(pathname);
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
  const p = normalizeBawViewPathname(pathname);
  return p === BAW_TUTORIAL_ROUTE || p.startsWith(`${BAW_TUTORIAL_ROUTE}/`);
}

/** View-mode option sub-page — `/build-a-wig/view/{unit}/{step}`, not hub landing. */
export function isBawTryOptionSubPagePath(pathname: string): boolean {
  const p = normalizeBawViewPathname(pathname);
  if (!isBawTutorialPath(p) || isBawTryHubLandingPath(p)) return false;
  const prefix = `${BAW_TUTORIAL_ROUTE}/`;
  if (!p.startsWith(prefix)) return false;
  const segments = p.slice(prefix.length).split('/').filter(Boolean);
  if (segments.length < 2) return false;
  return isBawTryUnitSlug(segments[0]) && isBawTryStepSegment(segments[1]);
}

/** View-mode hub only — `/build-a-wig/view` or `/build-a-wig/view/{unit}`, not option sub-pages. */
export function isBawTryHubLandingPath(pathname: string): boolean {
  const p = normalizeBawViewPathname(pathname);
  if (!isBawTutorialPath(p)) return false;
  if (p === BAW_TUTORIAL_ROUTE) return true;
  const prefix = `${BAW_TUTORIAL_ROUTE}/`;
  if (!p.startsWith(prefix)) return false;
  const segments = p.slice(prefix.length).split('/').filter(Boolean);
  return segments.length === 1 && isBawTryUnitSlug(segments[0]);
}

/** Option step URL segments under `/build-a-wig/view/{unit}/…`. */
export const BAW_TRY_STEP_SEGMENTS = [
  'cap',
  'cap-size',
  'length',
  'density',
  'lace',
  'texture',
  'color',
  'hairline',
  'styling',
  'addons',
] as const;

export function isBawTryStepSegment(segment: string): boolean {
  return (BAW_TRY_STEP_SEGMENTS as readonly string[]).includes(segment);
}

export function resolveBawTryUnitSlugFromPathname(pathname: string): BawTryUnitSlug {
  const normalized = normalizeBawViewPathname(pathname);
  if (normalized === BAW_TUTORIAL_ROUTE) return 'noir';
  const prefix = `${BAW_TUTORIAL_ROUTE}/`;
  if (!normalized.startsWith(prefix)) return 'noir';
  const first = normalized.slice(prefix.length).split('/').filter(Boolean)[0] ?? '';
  if (isBawTryUnitSlug(first)) return first;
  return 'noir';
}

/** e.g. `/build-a-wig/view/noir/color` */
export function getBawTryOptionSubPagePath(pathname: string, stepSegment: string): string {
  const slug = resolveBawTryUnitSlugFromPathname(pathname);
  const step = stepSegment === 'cap-size' ? 'cap' : stepSegment;
  return `${BAW_TUTORIAL_ROUTE}/${slug}/${step}`;
}

/** Try hub for BACK navigation from a try option sub-page. */
export function getBawTryFlowBasePath(pathname: string): string {
  const p = normalizeBawViewPathname(pathname);
  if (!isBawTutorialPath(p)) return BAW_TUTORIAL_ROUTE;
  if (p === BAW_TUTORIAL_ROUTE) return p;
  const prefix = `${BAW_TUTORIAL_ROUTE}/`;
  const segments = p.slice(prefix.length).split('/').filter(Boolean);
  const first = segments[0] ?? '';
  if (isBawTryUnitSlug(first)) {
    if (segments[1] && isBawTryStepSegment(segments[1])) {
      return first === 'noir' ? BAW_TUTORIAL_ROUTE : `${BAW_TUTORIAL_ROUTE}/${first}`;
    }
    return `${BAW_TUTORIAL_ROUTE}/${first}`;
  }
  return BAW_TUTORIAL_ROUTE;
}
