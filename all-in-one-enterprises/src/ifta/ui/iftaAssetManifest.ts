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

export const IFTA_MEDIA = {
  filingRoomHero: '/brand/ifta/ifta-filing-room-hero.jpg',
  publicHero: '/brand/aio-login-hero.png',
  publicRoad: '/brand/all-in-one-hero-truck.png',
  publicRange: '/brand/ifta/ifta-public-range.jpg',
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
  {
    asset: IFTA_MEDIA.filingRoomHero,
    source: '02_CLIENT_MODE/AIO_IFTA_CLIENT_MOBILE_PARENT_AUTHORITY.jpeg (approved client parent) · hero photograph',
    derivation: 'photographic region only (x 520–1206, y 88–505: right of the baked headline, below the baked nav icons, above the baked metrics card) · 2× Lanczos',
    actor: 'CLIENT',
    region: 'Filing Room hero (client) · case hero + queue band (staff)',
    crop: 'truck + range, right-weighted',
    focal: 'truck cab (≈ 70% x · 60% y)',
    viewport: 'mobile: full-bleed, focal right · tablet / desktop: right 72% of the hero',
    overlay: 'STONE WHITE wash from the left (the reference hero washes the sky behind the headline)',
    text: 'quarter identity left on the wash; metrics rail overlaps the hero foot',
  },
  {
    asset: IFTA_MEDIA.publicHero,
    source: 'public/brand/aio-login-hero.png (approved AIO hero — black truck, range, gold dusk)',
    derivation: 'mounted as-is',
    actor: 'PUBLIC',
    region: 'public hero',
    crop: 'cover',
    focal: 'truck cab (≈ 68% x · 62% y)',
    viewport: 'mobile: focal right, darker wash · desktop: full-bleed',
    overlay: 'OBSIDIAN gradient from the left + foot fade into the metrics rail',
    text: 'IFTA FILING ROOM · SAMPLE QUARTER headline left',
  },
  {
    asset: IFTA_MEDIA.publicRoad,
    source: 'public/brand/all-in-one-hero-truck.png (approved AIO truck on the road)',
    derivation: 'mounted as-is',
    actor: 'PUBLIC',
    region: '“REAL DRIVERS. REAL ROADS. REAL COMPLIANCE.” panel',
    crop: 'cover',
    focal: 'road + truck (≈ 60% x · 55% y)',
    viewport: 'tablet / desktop only (the mobile reference omits this panel)',
    overlay: 'OBSIDIAN gradient from the left',
    text: 'three-line statement left with a gold rule',
  },
  {
    asset: IFTA_MEDIA.publicRange,
    source: 'public/brand/aio-login-hero.png (approved) · mountain band',
    derivation: 'crop x 0–760 · y 400–640 (range + dusk sky, left of the truck)',
    actor: 'PUBLIC',
    region: 'public footer panorama',
    crop: 'wide band',
    focal: 'ridge line centre',
    viewport: 'full-bleed band at every width',
    overlay: 'OBSIDIAN fade top and bottom',
    text: 'full lockup + tagline',
  },
];
