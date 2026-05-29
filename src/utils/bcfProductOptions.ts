/**
 * Bundles / closures / frontals PDP (`/shop/bundles?texture=…`, etc.) — shared option lists aligned with build-a-wig.
 */

import type { CSSProperties } from 'react';
import {
  shopTextureCategoryThumbSrc,
  type ShopTextureCategoryThumbCategory,
  type ShopTextureCategoryThumbTexture
} from './shopTextureCategoryThumb';

/** Brand red for selected PDP option chips (BCF + six unit PDPs). */
export const BCF_OPTION_RED = '#EB1C24';

export function bcfOptionSelectedChrome(selected: boolean): Pick<CSSProperties, 'border' | 'color'> {
  return {
    border: selected ? `1.3px solid ${BCF_OPTION_RED}` : '1.3px solid #000000',
    color: selected ? BCF_OPTION_RED : '#000000'
  };
}

export type BcfOriginId =
  | 'CAMBODIAN'
  | 'RUSSIAN'
  | 'INDIAN'
  | 'INDONESIAN'
  | 'FILIPINO'
  | 'VIETNAMESE';

export const BCF_ORIGIN_OPTIONS: { id: BcfOriginId; label: string }[] = [
  { id: 'CAMBODIAN', label: 'CAMBODIAN' },
  { id: 'RUSSIAN', label: 'RUSSIAN' },
  { id: 'INDIAN', label: 'INDIAN' },
  { id: 'INDONESIAN', label: 'INDONESIAN' },
  { id: 'FILIPINO', label: 'FILIPINO' },
  { id: 'VIETNAMESE', label: 'VIETNAMESE' }
];

/** Textures allowed for each origin (straight-only / wavy-only / curly-only). */
export function bcfTexturesForOrigin(origin: BcfOriginId): ShopTextureCategoryThumbTexture[] {
  if (origin === 'CAMBODIAN' || origin === 'RUSSIAN') return ['straight'];
  if (origin === 'INDIAN' || origin === 'INDONESIAN') return ['wavy'];
  return ['curly'];
}

export function bcfDefaultOriginForRouteTexture(t: ShopTextureCategoryThumbTexture): BcfOriginId {
  if (t === 'straight') return 'CAMBODIAN';
  if (t === 'wavy') return 'INDIAN';
  return 'FILIPINO';
}

/** Blanco-style tones — only offered when origin is Russian. */
export const BCF_RUSSIAN_ONLY_COLOR_IDS = new Set<string>(['GOLDEN', 'PLATINUM', 'ASH']);

/** Russian → Blanco only (GOLDEN / PLATINUM / ASH). Other origins → noir palette only (no Blanco). */
export function bcfColorOptionsForOrigin(origin: BcfOriginId): BcfColorOption[] {
  if (origin === 'RUSSIAN') {
    return BCF_COLOR_OPTIONS.filter((c) => BCF_RUSSIAN_ONLY_COLOR_IDS.has(c.id));
  }
  return BCF_COLOR_OPTIONS.filter((c) => !BCF_RUSSIAN_ONLY_COLOR_IDS.has(c.id));
}

/** Default BCF hair color: noir **OFF BLACK**; Russian (Blanco trio) **PLATINUM** (not GOLDEN). */
export function bcfDefaultColorIdForOrigin(origin: BcfOriginId): string {
  return origin === 'RUSSIAN' ? 'PLATINUM' : 'OFF BLACK';
}

const BCF_FRONTAL_LACE_IDS = new Set(['13X4', '13X6']);
/** Closures: closure lace grid only — no frontals sizes or 360 / FULL. */
const BCF_CLOSURE_EXCLUDED_LACE_IDS = new Set(['13X4', '13X6', '360', 'FULL']);

/** Frontals: 13×4 and 13×6 only. Closures: 2×6 through 7×7 (six sizes). */
export function bcfLaceOptionsForCategory(category: 'closures' | 'frontals'): BcfLaceOption[] {
  if (category === 'frontals') {
    return BCF_LACE_OPTIONS.filter((l) => BCF_FRONTAL_LACE_IDS.has(l.id));
  }
  return BCF_LACE_OPTIONS.filter((l) => !BCF_CLOSURE_EXCLUDED_LACE_IDS.has(l.id));
}

/** Match PDP URL so first paint uses an origin that allows the selected texture (avoids redirect flash). */
export function bcfInitialOriginFromPathname(pathname: string, search: string = ''): BcfOriginId {
  const shop = pathname.match(/^\/shop\/(bundles|closures|frontals)$/);
  if (!shop) return 'CAMBODIAN';
  const q = search.startsWith('?') ? search.slice(1) : search;
  const t = new URLSearchParams(q).get('texture');
  if (t === 'straight' || t === 'wavy' || t === 'curly') {
    return bcfDefaultOriginForRouteTexture(t as ShopTextureCategoryThumbTexture);
  }
  return 'CAMBODIAN';
}

export const BCF_TEXTURE_LABELS: Record<ShopTextureCategoryThumbTexture, string> = {
  straight: 'STRAIGHT',
  wavy: 'WAVY',
  curly: 'CURLY'
};

export interface BcfLengthOption {
  id: string;
  label: string;
  price: number;
}

/** Matches build-a-wig length page (`/build-a-wig/length`) — 16"–40". */
export const BCF_LENGTH_OPTIONS: BcfLengthOption[] = [
  { id: '16"', label: '16"', price: -50 },
  { id: '18"', label: '18"', price: -25 },
  { id: '20"', label: '20"', price: -10 },
  { id: '22"', label: '22"', price: -5 },
  { id: '24"', label: '24"', price: 0 },
  { id: '26"', label: '26"', price: 50 },
  { id: '28"', label: '28"', price: 100 },
  { id: '30"', label: '30"', price: 150 },
  { id: '32"', label: '32"', price: 200 },
  { id: '34"', label: '34"', price: 250 },
  { id: '36"', label: '36"', price: 300 },
  { id: '40"', label: '40"', price: 400 }
];

export interface BcfColorOption {
  id: string;
  label: string;
  price: number;
  swatch: string;
}

/**
 * Premium hair-color upcharge on BCF PDPs (bundles / closures / frontals).
 * Build-a-wig unit color sub-page uses $120 separately — do not conflate.
 */
export const BCF_PREMIUM_COLOR_UPCHARGE_USD = 80;

/** Noir build-a-wig palette + Blanco trio (GOLDEN / PLATINUM / ASH). */
export const BCF_COLOR_OPTIONS: BcfColorOption[] = [
  { id: 'JET BLACK', label: 'JET BLACK', price: BCF_PREMIUM_COLOR_UPCHARGE_USD, swatch: '#000000' },
  { id: 'OFF BLACK', label: 'OFF BLACK', price: 0, swatch: '#160604' },
  { id: 'ESPRESSO', label: 'ESPRESSO', price: BCF_PREMIUM_COLOR_UPCHARGE_USD, swatch: '#3B1301' },
  { id: 'CHESTNUT', label: 'CHESTNUT', price: BCF_PREMIUM_COLOR_UPCHARGE_USD, swatch: '#6C2D11' },
  { id: 'HONEY', label: 'HONEY', price: BCF_PREMIUM_COLOR_UPCHARGE_USD, swatch: '#C58628' },
  { id: 'AUBURN', label: 'AUBURN', price: BCF_PREMIUM_COLOR_UPCHARGE_USD, swatch: '#9C5617' },
  { id: 'COPPER', label: 'COPPER', price: BCF_PREMIUM_COLOR_UPCHARGE_USD, swatch: '#802F02' },
  { id: 'GINGER', label: 'GINGER', price: BCF_PREMIUM_COLOR_UPCHARGE_USD, swatch: '#F64F07' },
  { id: 'SANGRIA', label: 'SANGRIA', price: BCF_PREMIUM_COLOR_UPCHARGE_USD, swatch: '#7E0A1E' },
  { id: 'CHERRY', label: 'CHERRY', price: BCF_PREMIUM_COLOR_UPCHARGE_USD, swatch: '#FF1400' },
  { id: 'RASPBERRY', label: 'RASPBERRY', price: BCF_PREMIUM_COLOR_UPCHARGE_USD, swatch: '#DA3063' },
  { id: 'PLUM', label: 'PLUM', price: BCF_PREMIUM_COLOR_UPCHARGE_USD, swatch: '#640E82' },
  { id: 'COBALT', label: 'COBALT', price: BCF_PREMIUM_COLOR_UPCHARGE_USD, swatch: '#290481' },
  { id: 'TEAL', label: 'TEAL', price: BCF_PREMIUM_COLOR_UPCHARGE_USD, swatch: '#46EBCA' },
  { id: 'SLIME', label: 'SLIME', price: BCF_PREMIUM_COLOR_UPCHARGE_USD, swatch: '#03D92A' },
  { id: 'CITRINE', label: 'CITRINE', price: BCF_PREMIUM_COLOR_UPCHARGE_USD, swatch: '#E2E91C' },
  { id: 'GOLDEN', label: 'GOLDEN', price: -20, swatch: '#FBF08B' },
  { id: 'PLATINUM', label: 'PLATINUM', price: 0, swatch: '#F6F3D2' },
  { id: 'ASH', label: 'ASH', price: 20, swatch: '#E5E3CB' }
];

export interface BcfLaceOption {
  id: string;
  label: string;
  price: number;
}

/** Matches build-a-wig lace page order and pricing. */
export const BCF_LACE_OPTIONS: BcfLaceOption[] = [
  { id: '2X6', label: '2X6', price: -40 },
  { id: '4X4', label: '4X4', price: -40 },
  { id: '5X5', label: '5X5', price: -20 },
  { id: '6X6', label: '6X6', price: 60 },
  { id: '9X6', label: '9X6', price: 80 },
  { id: '7X7', label: '7X7', price: 100 },
  { id: '13X4', label: '13X4', price: -20 },
  { id: '13X6', label: '13X6', price: 0 },
  { id: '360', label: '360', price: 160 },
  { id: 'FULL', label: 'FULL', price: 240 }
];

export function bcfPriceAdjustments(
  lengthId: string,
  colorId: string,
  laceId: string | null
): number {
  const len = BCF_LENGTH_OPTIONS.find((o) => o.id === lengthId);
  const col = BCF_COLOR_OPTIONS.find((o) => o.id === colorId);
  const lace = laceId ? BCF_LACE_OPTIONS.find((o) => o.id === laceId) : null;
  return (len?.price ?? 0) + (col?.price ?? 0) + (lace?.price ?? 0);
}

/** Straight-texture base (USD) before length / color / lace. Bundles −$200; closures & frontals −$120 vs prior list. */
export const BCF_STRAIGHT_BASE_PRICE_USD: Record<ShopTextureCategoryThumbCategory, number> = {
  bundles: 330,
  closures: 245,
  frontals: 365
};

const BCF_TEXTURE_PRICE_DELTA_USD: Record<ShopTextureCategoryThumbTexture, number> = {
  straight: 0,
  wavy: 20,
  curly: 40
};

/** PDP base at route texture (add `bcfPriceAdjustments` for length / color / lace). */
export function bcfBasePriceUsd(
  category: ShopTextureCategoryThumbCategory,
  texture: ShopTextureCategoryThumbTexture
): number {
  return BCF_STRAIGHT_BASE_PRICE_USD[category] + BCF_TEXTURE_PRICE_DELTA_USD[texture];
}

/** Min/max PDP total for shop grid price ranges (all length / color / lace combos). */
export function bcfPdpPriceRangeUsd(
  category: ShopTextureCategoryThumbCategory,
  texture: ShopTextureCategoryThumbTexture
): { minUsd: number; maxUsd: number } {
  const base = bcfBasePriceUsd(category, texture);
  const lenPrices = BCF_LENGTH_OPTIONS.map((o) => o.price);
  const colPrices = BCF_COLOR_OPTIONS.map((o) => o.price);
  const lenMin = Math.min(...lenPrices);
  const lenMax = Math.max(...lenPrices);
  const colMin = Math.min(...colPrices);
  const colMax = Math.max(...colPrices);
  if (category === 'bundles') {
    return { minUsd: base + lenMin + colMin, maxUsd: base + lenMax + colMax };
  }
  const lacePrices = bcfLaceOptionsForCategory(category).map((o) => o.price);
  const laceMin = Math.min(...lacePrices);
  const laceMax = Math.max(...lacePrices);
  return {
    minUsd: base + lenMin + colMin + laceMin,
    maxUsd: base + lenMax + colMax + laceMax
  };
}

/** PDP URL for `/shop/bundles|closures|frontals?texture=…`. */
export function shopBcfPdpHref(category: string, texture: string): string {
  return `/shop/${category}?texture=${texture}`;
}

/** Cart line from BCF PDP (`type: 'shop-texture-category'`) → reopen that PDP with saved texture. */
export function shopBcfPdpHrefFromCartItem(item: {
  type?: string;
  category?: string;
  texture?: string;
}): string | null {
  if (item.type !== 'shop-texture-category') return null;
  const c = item.category;
  const t = item.texture;
  if (c !== 'bundles' && c !== 'closures' && c !== 'frontals') return null;
  if (t !== 'straight' && t !== 'wavy' && t !== 'curly') return null;
  return shopBcfPdpHref(c, t);
}

function normalizeBcfCartTexture(raw?: string): ShopTextureCategoryThumbTexture | null {
  if (raw == null) return null;
  const t = String(raw).toLowerCase().trim();
  if (t === 'straight' || t === 'wavy' || t === 'curly') return t;
  return null;
}

function bcfCartTextureFromShopId(id?: string): ShopTextureCategoryThumbTexture | null {
  if (!id) return null;
  const m = String(id).match(/^shop-(straight|wavy|curly)-/);
  return (m?.[1] as ShopTextureCategoryThumbTexture) ?? null;
}

/** Legacy / partial rows: infer STRAIGHT|WAVY|CURLY from cart line title (e.g. `BUNDLES · WAVY`). */
function bcfCartTextureFromName(name?: string): ShopTextureCategoryThumbTexture | null {
  if (!name) return null;
  const u = name.toUpperCase();
  if (/\bCURLY\b/.test(u)) return 'curly';
  if (/\bWAVY\b/.test(u)) return 'wavy';
  if (/\bSTRAIGHT\b/.test(u)) return 'straight';
  return null;
}

function bcfCartCategoryFromShopId(id?: string): ShopTextureCategoryThumbCategory | null {
  if (!id) return null;
  const s = String(id);
  if (/^shop-(straight|wavy|curly)-bundles/.test(s)) return 'bundles';
  if (/^shop-(straight|wavy|curly)-closures-/.test(s)) return 'closures';
  if (/^shop-(straight|wavy|curly)-frontals-/.test(s)) return 'frontals';
  return null;
}

/**
 * BCF shop cart thumbnail: **bundles**, **closures**, and **frontals** all use the same marble PNGs as the home/shop
 * grid (`shopTextureCategoryThumbSrc`) — not PDP hero photos or any stored `image` on the line.
 */
export function shopBcfCartLineThumbnailSrc(item: {
  type?: string;
  id?: string;
  category?: string;
  texture?: string;
  image?: string;
  name?: string;
  bcfBundleDeal?: boolean;
}): string | null {
  if (item.type !== 'shop-texture-category') return null;
  const t =
    normalizeBcfCartTexture(item.texture) ??
    bcfCartTextureFromShopId(item.id) ??
    bcfCartTextureFromName(item.name);
  if (!t) return null;

  const cRaw = item.category;
  const c: ShopTextureCategoryThumbCategory | null =
    cRaw === 'bundles' || cRaw === 'closures' || cRaw === 'frontals'
      ? cRaw
      : bcfCartCategoryFromShopId(item.id);

  const isBundleLine = c === 'bundles' || Boolean(item.bcfBundleDeal);
  if (isBundleLine) {
    return shopTextureCategoryThumbSrc(t, 'bundles');
  }

  if (c !== 'closures' && c !== 'frontals') return null;

  return shopTextureCategoryThumbSrc(t, c);
}

/** Known bundle-deal discount (USD) for inferring list subtotal on legacy cart lines. */
export const BCF_BUNDLE_DEAL_DISCOUNT_USD = 60;

/** List (pre-deal) line total for strikethrough; uses stored value or infers from discounted line + fixed $60 off. */
export function bcfBundleDealResolvedListSubtotal(item: {
  bcfBundleDeal?: boolean;
  bcfBundleDealListSubtotal?: number;
  price?: number;
  quantity?: number;
}): number | null {
  if (!item.bcfBundleDeal) return null;
  const stored = item.bcfBundleDealListSubtotal;
  if (stored != null && stored > 0) return stored;
  const q = item.quantity ?? 1;
  const p = item.price ?? 0;
  if (q <= 0 || p < 0) return null;
  return p * q + BCF_BUNDLE_DEAL_DISCOUNT_USD;
}
