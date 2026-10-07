/**
 * IFTA family — media + brand asset manifest.
 * Footer lockup: the founder full logo (mark + ALL IN ONE + ENTERPRISES INC. + WHERE BUSINESS MEETS THE ROAD).
 * Photographic plates: isolated OpenArt HQ masters. Board crops, Telea inpaint, and upscales of authority JPEGs are forbidden.
 * Nav marks stay emblem-only.
 */
export const IFTA_BRAND = {
  markOnLight: '/brand/ifta/aio-mark-on-light.png',
  markOnDark: '/brand/ifta/aio-mark-on-dark.png',
  lockupOnLight: '/brand/ifta/aio-lockup-on-light.png',
  lockupOnDark: '/brand/ifta/aio-lockup-on-dark.png',
} as const;

const PLATE = (name: string) => `/brand/ifta/plates/${name}.jpg`;

/**
 * Isolated OpenArt masters. One HQ file is shared across breakpoints; the live layout frames it.
 * Desktop and compact map/footer pairs that differ are two generations, not crops of one board.
 */
export const IFTA_PLATES = {
  client: { desktop: PLATE('client-hero'), tablet: PLATE('client-hero'), mobile: PLATE('client-hero') },
  staff: { desktop: PLATE('staff-hero'), tablet: PLATE('staff-hero'), mobile: PLATE('staff-hero') },
  public: { desktop: PLATE('public-hero'), tablet: PLATE('public-hero'), mobile: PLATE('public-hero') },
  publicRoad: PLATE('public-road'),
  publicMap: { desktop: PLATE('public-map'), compact: PLATE('public-map') },
  publicFooter: { desktop: PLATE('public-footer-desktop'), compact: PLATE('public-footer-tablet') },
  clientInsights: PLATE('client-insights'),
} as const;

const OA = 'OpenArt Nano Banana 2.1 text-to-image, founder-approved isolated master';
const HQ = 'isolated HQ generation · no board crop · no inpaint · no upscale of an authority JPEG';

export type IftaAssetRecord = {
  asset: string;
  source: string;
  derivation: string;
  actor: 'PUBLIC' | 'CLIENT' | 'STAFF' | 'ALL';
  region: string;
  crop: string;
  focal: string;
  viewport: string;
  overlay: string;
  text: string;
};

/** Media ownership (sprint §30): source · crop · focal point · viewport behaviour · overlay · text relationship. */
export const IFTA_ASSET_MANIFEST: IftaAssetRecord[] = [
  {
    asset: IFTA_BRAND.markOnLight,
    source: 'public/brand/aio-logo-lockup.png (approved lockup) · emblem',
    derivation: 'emblem crop · black → alpha · white strokes → CHARCOAL #1A1A1A (reference light nav)',
    actor: 'ALL',
    region: 'top operational chrome (client / staff light)',
    crop: 'emblem only',
    focal: 'n/a',
    viewport: '32px mobile · 36px tablet / desktop',
    overlay: 'none',
    text: 'never beside a wordmark in the top nav',
  },
  {
    asset: IFTA_BRAND.markOnDark,
    source: '00_BRAND/AIO_SIMPLE_NAV_MARK.jpeg (approved app / nav mark)',
    derivation: 'emblem crop inside the tile · black → alpha (metallic gold / platinum kept)',
    actor: 'PUBLIC',
    region: 'public top nav',
    crop: 'emblem only',
    focal: 'n/a',
    viewport: '34px mobile · 40px desktop',
    overlay: 'none',
    text: 'never beside a wordmark in the top nav',
  },
  {
    asset: IFTA_BRAND.lockupOnLight,
    source: 'founder-approved full lockup (mark · ALL IN ONE · ENTERPRISES INC. · WHERE BUSINESS MEETS THE ROAD.)',
    derivation: 'supplied logo · near-black keyed to alpha · same master as the dark footer, on a dark plate so the metal reads',
    actor: 'CLIENT',
    region: 'client / staff footer',
    crop: 'full lockup, not a wordmark crop',
    focal: 'n/a',
    viewport: 'centred between gold rules',
    overlay: 'dark plate behind the transparent lockup',
    text: 'tagline is inside the lockup; page line below (DATA · COMPLIANCE · REAL PROGRESS / OPERATIONS · COMPLIANCE · CLIENT SUCCESS)',
  },
  {
    asset: IFTA_BRAND.lockupOnDark,
    source: 'founder-approved full lockup (mark · ALL IN ONE · ENTERPRISES INC. · WHERE BUSINESS MEETS THE ROAD.)',
    derivation: 'supplied logo · near-black keyed to alpha · no redraw',
    actor: 'PUBLIC',
    region: 'public footer over the mountain range',
    crop: 'full lockup, not a wordmark crop',
    focal: 'n/a',
    viewport: 'stacked lockup, sized to stay legible',
    overlay: 'sits on the dark range band',
    text: 'DRIVEN BY COMPLIANCE. BUILT FOR WHAT MOVES YOU.',
  },
  ...plateRecords(),
];

function plateRecords(): IftaAssetRecord[] {
  const hero = (actor: 'CLIENT' | 'STAFF' | 'PUBLIC', subject: string): IftaAssetRecord => ({
    asset: IFTA_PLATES[actor === 'CLIENT' ? 'client' : actor === 'STAFF' ? 'staff' : 'public'].desktop,
    source: OA,
    derivation: `${HQ} · 4K 16:9 · ${subject}`,
    actor,
    region: `${actor.toLowerCase()} hero · all breakpoints`,
    crop: 'none — one generated master, framed by the live layout',
    focal: actor === 'STAFF' ? 'fleet row, left' : 'truck on the right',
    viewport: 'same master at desktop, tablet, and phone',
    overlay: actor === 'STAFF' ? 'live CLIENT HEALTH panel over the right' : actor === 'CLIENT' ? 'live quarter card over the right on desktop' : 'none',
    text: 'live headline, status pill and metrics rail',
  });
  return [
    hero('CLIENT', 'golden-hour unbranded semi on an open highway'),
    hero('STAFF', 'night fleet yard, continuous photograph'),
    hero('PUBLIC', 'night interstate, unbranded semi, open left for the headline'),
    {
      asset: IFTA_PLATES.publicRoad,
      source: OA,
      derivation: `${HQ} · 4K 16:9 · winding mountain highway at dusk`,
      actor: 'PUBLIC',
      region: '“REAL DRIVERS. REAL ROADS. REAL COMPLIANCE.” panel (desktop)',
      crop: 'none',
      focal: 'road bend',
      viewport: '≥ 1200 px (tablet / mobile omit the panel)',
      overlay: 'none',
      text: 'live three-line statement + gold rule',
    },
    {
      asset: IFTA_PLATES.publicMap.desktop,
      source: OA,
      derivation: `${HQ} · 4K 16:9 · gold city-light map of the lower 48 on pure black`,
      actor: 'PUBLIC',
      region: '8 JURISDICTIONS · ONE RETURN — sample illustration',
      crop: 'none',
      focal: 'centre',
      viewport: 'same master at every width',
      overlay: 'none',
      text: 'live count + copy beside it',
    },
    {
      asset: IFTA_PLATES.publicFooter.desktop,
      source: OA,
      derivation: `${HQ} · 4K 21:9 · blue-hour ridgeline, no baked logo`,
      actor: 'PUBLIC',
      region: 'public footer band (desktop)',
      crop: 'none',
      focal: 'ridge line',
      viewport: '≥ 1200 px',
      overlay: 'none',
      text: 'live full lockup + DRIVEN BY COMPLIANCE line + DATA | COMPLIANCE | REAL PROGRESS',
    },
    {
      asset: IFTA_PLATES.publicFooter.compact,
      source: OA,
      derivation: `${HQ} · 4K 16:9 · range and gold light-trail highway, no baked logo`,
      actor: 'PUBLIC',
      region: 'public footer band (tablet / mobile)',
      crop: 'none',
      focal: 'light trail',
      viewport: '< 1200 px',
      overlay: 'none',
      text: 'live full lockup centred + DRIVEN BY COMPLIANCE line',
    },
    {
      asset: IFTA_PLATES.clientInsights,
      source: OA,
      derivation: `${HQ} · 2K 21:9 · snow peaks at dawn`,
      actor: 'CLIENT',
      region: 'AIO INSIGHTS card foot (client desktop)',
      crop: 'none',
      focal: 'right peaks',
      viewport: '≥ 1200 px',
      overlay: 'fades into the white card',
      text: 'live insight copy above',
    },
  ];
}
