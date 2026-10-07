/**
 * IFTA family — media + brand asset manifest (authority → runtime binding). Every runtime asset is an APPROVED project
 * asset or a crop / alpha extraction of one (scripts/ifta/derive-ifta-brand-assets.py). No generation, no stock.
 * Authority bundle: SITE00 docs/aio/ifta/authority-bundle/source/AIO_IFTA_AUTHORITY_BUNDLE.
 */
export const IFTA_BRAND = {
  markOnLight: '/brand/ifta/aio-mark-on-light.png',
  markOnDark: '/brand/ifta/aio-mark-on-dark.png',
  lockupOnLight: '/brand/ifta/aio-lockup-on-light.png',
  lockupOnDark: '/brand/ifta/aio-lockup-on-dark.png',
} as const;

const PLATE = (name: string) => `/brand/ifta/plates/${name}.jpg`;

/**
 * Authority plates — the photographic region of each approved screen with its baked UI inpainted out
 * (scripts/ifta/derive-ifta-authority-plates.py). The live UI is laid over the same geometry.
 */
export const IFTA_PLATES = {
  client: { desktop: PLATE('client-hero-desktop'), tablet: PLATE('client-hero-tablet'), mobile: PLATE('client-hero-mobile') },
  staff: { desktop: PLATE('staff-hero-desktop'), tablet: PLATE('staff-hero-tablet'), mobile: PLATE('staff-hero-mobile') },
  public: { desktop: PLATE('public-hero-desktop'), tablet: PLATE('public-hero-tablet'), mobile: PLATE('public-hero-mobile') },
  publicRoad: PLATE('public-road'),
  publicMap: { desktop: PLATE('public-map-desktop'), compact: PLATE('public-map') },
  publicFooter: { desktop: PLATE('public-footer-desktop'), compact: PLATE('public-footer-tablet') },
  clientInsights: PLATE('client-insights'),
} as const;

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
    source: 'public/brand/aio-logo-lockup.png (approved lockup)',
    derivation: 'black → alpha · ALL IN ONE white → CHARCOAL · ENTERPRISES INC. gold kept',
    actor: 'CLIENT',
    region: 'client / staff footer',
    crop: 'full lockup',
    focal: 'n/a',
    viewport: '200px mobile · 240px desktop, centred between gold rules',
    overlay: 'none',
    text: 'tagline line below (DATA · COMPLIANCE · REAL PROGRESS / OPERATIONS · COMPLIANCE · CLIENT SUCCESS)',
  },
  {
    asset: IFTA_BRAND.lockupOnDark,
    source: 'public/brand/aio-logo-lockup.png (approved lockup)',
    derivation: 'black → alpha',
    actor: 'PUBLIC',
    region: 'public footer over the mountain range',
    crop: 'full lockup',
    focal: 'n/a',
    viewport: '210px mobile · 260px desktop',
    overlay: 'sits on the obsidian fade of the range band',
    text: 'DRIVEN BY COMPLIANCE. BUILT FOR WHAT MOVES YOU.',
  },
  ...plateRecords(),
];

function plateRecords(): IftaAssetRecord[] {
  const B = 'AIO_IFTA_AUTHORITY_BUNDLE';
  const hero = (actor: 'CLIENT' | 'STAFF' | 'PUBLIC', band: 'desktop' | 'tablet' | 'mobile', source: string, box: string): IftaAssetRecord => ({
    asset: IFTA_PLATES[actor === 'CLIENT' ? 'client' : actor === 'STAFF' ? 'staff' : 'public'][band],
    source: `${B}/${source} (approved)`,
    derivation: `board crop ${box} · baked headline / pill / panel / rail inpainted (OpenCV Telea) · Lanczos upscale + light unsharp`,
    actor,
    region: `${actor.toLowerCase()} hero · ${band}`,
    crop: 'the authority screen hero, edge to edge',
    focal: 'as drawn (truck right of the headline)',
    viewport: band === 'desktop' ? '≥ 1200 px' : band === 'tablet' ? '700 – 1199 px' : '< 700 px',
    overlay: actor === 'STAFF' ? 'live CLIENT HEALTH panel over the right' : actor === 'CLIENT' && band === 'desktop' ? 'live quarter card over the right' : 'none',
    text: 'live headline, status pill and metrics rail at the drawn positions',
  });
  return [
    hero('CLIENT', 'desktop', '02_CLIENT_MODE/AIO_IFTA_CLIENT_TABLET_DESKTOP.jpeg', 'x522–1411 · y161–371'),
    hero('CLIENT', 'tablet', '02_CLIENT_MODE/AIO_IFTA_CLIENT_TABLET_DESKTOP.jpeg', 'x44–477 · y155–371'),
    hero('CLIENT', 'mobile', '02_CLIENT_MODE/AIO_IFTA_CLIENT_MOBILE_PARENT_AUTHORITY.jpeg', 'x0–1206 · y0–645 (native 3×)'),
    hero('STAFF', 'desktop', '03_FOUNDER_STAFF_MODE/AIO_IFTA_FOUNDER_STAFF_TABLET_DESKTOP.jpeg', 'x608–1411 · y226–401'),
    hero('STAFF', 'tablet', '03_FOUNDER_STAFF_MODE/AIO_IFTA_FOUNDER_STAFF_TABLET_DESKTOP.jpeg', 'x39–556 · y229–406'),
    hero('STAFF', 'mobile', '01_TERRITORY_SELECTION/AIO_IFTA_3_ACTOR_MODES_MOBILE.jpeg', 'staff column x514–1023 · y56–271'),
    hero('PUBLIC', 'desktop', '04_PUBLIC_CUSTOMER_MODE/AIO_IFTA_PUBLIC_TABLET_DESKTOP.jpeg', 'x516–1433 · y73–335'),
    hero('PUBLIC', 'tablet', '04_PUBLIC_CUSTOMER_MODE/AIO_IFTA_PUBLIC_TABLET_DESKTOP.jpeg', 'x27–486 · y97–319'),
    hero('PUBLIC', 'mobile', '01_TERRITORY_SELECTION/AIO_IFTA_3_ACTOR_MODES_MOBILE.jpeg', 'public column x1032–1536 · y55–307'),
    {
      asset: IFTA_PLATES.publicRoad,
      source: `${B}/04_PUBLIC_CUSTOMER_MODE/AIO_IFTA_PUBLIC_TABLET_DESKTOP.jpeg (approved)`,
      derivation: 'board crop x931–1431 · y418–595 · baked statement + rule inpainted',
      actor: 'PUBLIC',
      region: '“REAL DRIVERS. REAL ROADS. REAL COMPLIANCE.” panel (desktop)',
      crop: 'winding road at dusk',
      focal: 'road bend (≈ 55% x)',
      viewport: '≥ 1200 px (tablet / mobile authority omit the panel)',
      overlay: 'none',
      text: 'live three-line statement + gold rule at the drawn position',
    },
    {
      asset: IFTA_PLATES.publicMap.desktop,
      source: `${B}/04_PUBLIC_CUSTOMER_MODE/AIO_IFTA_PUBLIC_TABLET_DESKTOP.jpeg (approved)`,
      derivation: 'board crop x547–789 · y784–904 (glowing jurisdiction map, no text)',
      actor: 'PUBLIC',
      region: '8 JURISDICTIONS · ONE RETURN (desktop) — sample illustration',
      crop: 'map card',
      focal: 'centre',
      viewport: '≥ 1200 px',
      overlay: 'none',
      text: 'live count + copy beside it',
    },
    {
      asset: IFTA_PLATES.publicMap.compact,
      source: `${B}/04_PUBLIC_CUSTOMER_MODE/AIO_IFTA_PUBLIC_TABLET_DESKTOP.jpeg (approved)`,
      derivation: 'board crop x37–310 · y633–766 (tablet map card, no text)',
      actor: 'PUBLIC',
      region: '8 JURISDICTIONS · ONE RETURN (tablet / mobile) — sample illustration',
      crop: 'map card',
      focal: 'centre',
      viewport: '< 1200 px',
      overlay: 'none',
      text: 'live count + copy beside it',
    },
    {
      asset: IFTA_PLATES.publicFooter.desktop,
      source: `${B}/04_PUBLIC_CUSTOMER_MODE/AIO_IFTA_PUBLIC_TABLET_DESKTOP.jpeg (approved)`,
      derivation: 'board crop x517–1431 · y917–1011 · baked lockup + taglines inpainted',
      actor: 'PUBLIC',
      region: 'public footer band (desktop)',
      crop: 'mountain range at dusk',
      focal: 'ridge line',
      viewport: '≥ 1200 px',
      overlay: 'none',
      text: 'live lockup + DRIVEN BY COMPLIANCE line + DATA | COMPLIANCE | REAL PROGRESS',
    },
    {
      asset: IFTA_PLATES.publicFooter.compact,
      source: `${B}/04_PUBLIC_CUSTOMER_MODE/AIO_IFTA_PUBLIC_TABLET_DESKTOP.jpeg (approved)`,
      derivation: 'board crop x29–484 · y893–1002 · baked lockup + tagline inpainted',
      actor: 'PUBLIC',
      region: 'public footer band (tablet / mobile)',
      crop: 'range + light-trail road',
      focal: 'centre',
      viewport: '< 1200 px',
      overlay: 'none',
      text: 'live lockup centred + DRIVEN BY COMPLIANCE line',
    },
    {
      asset: IFTA_PLATES.clientInsights,
      source: `${B}/02_CLIENT_MODE/AIO_IFTA_CLIENT_TABLET_DESKTOP.jpeg (approved)`,
      derivation: 'board crop x1160–1395 · y887–952 (AIO INSIGHTS card foot) · baked copy inpainted',
      actor: 'CLIENT',
      region: 'AIO INSIGHTS card foot (client desktop)',
      crop: 'snow range',
      focal: 'right peaks',
      viewport: '≥ 1200 px',
      overlay: 'fades into the white card',
      text: 'live insight copy above',
    },
  ];
}
