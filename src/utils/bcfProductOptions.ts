/**
 * Bundles / closures / frontals PDP (`/shop/bundles?texture=…`, etc.) — shared option lists aligned with build-a-wig.
 */

import type { CSSProperties } from 'react';
import type { ShopTextureCategoryThumbTexture } from './shopTextureCategoryThumb';

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

/** Frontals: 13×4, 13×6, 360, FULL. Closures: lace sizes excluding those four. */
export function bcfLaceOptionsForCategory(category: 'closures' | 'frontals'): BcfLaceOption[] {
  const frontalOnly = new Set(['13X4', '13X6', '360', 'FULL']);
  if (category === 'frontals') {
    return BCF_LACE_OPTIONS.filter((l) => frontalOnly.has(l.id));
  }
  return BCF_LACE_OPTIONS.filter((l) => !frontalOnly.has(l.id));
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

/** Noir build-a-wig palette + Blanco trio (GOLDEN / PLATINUM / ASH). */
export const BCF_COLOR_OPTIONS: BcfColorOption[] = [
  { id: 'JET BLACK', label: 'JET BLACK', price: 80, swatch: '#000000' },
  { id: 'OFF BLACK', label: 'OFF BLACK', price: 0, swatch: '#2A2424' },
  { id: 'ESPRESSO', label: 'ESPRESSO', price: 80, swatch: '#3B1301' },
  { id: 'CHESTNUT', label: 'CHESTNUT', price: 80, swatch: '#6C2D11' },
  { id: 'HONEY', label: 'HONEY', price: 80, swatch: '#C58628' },
  { id: 'AUBURN', label: 'AUBURN', price: 80, swatch: '#9C5617' },
  { id: 'COPPER', label: 'COPPER', price: 80, swatch: '#802F02' },
  { id: 'GINGER', label: 'GINGER', price: 80, swatch: '#F64F07' },
  { id: 'SANGRIA', label: 'SANGRIA', price: 80, swatch: '#7E0A1E' },
  { id: 'CHERRY', label: 'CHERRY', price: 80, swatch: '#D70808' },
  { id: 'RASPBERRY', label: 'RASPBERRY', price: 80, swatch: '#EF0461' },
  { id: 'PLUM', label: 'PLUM', price: 80, swatch: '#640E82' },
  { id: 'COBALT', label: 'COBALT', price: 80, swatch: '#290481' },
  { id: 'TEAL', label: 'TEAL', price: 80, swatch: '#46EBCA' },
  { id: 'SLIME', label: 'SLIME', price: 80, swatch: '#03D92A' },
  { id: 'CITRINE', label: 'CITRINE', price: 80, swatch: '#E2E91C' },
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

/** PDP hero assets — same paths as `texture-category-product` (not marble PNG thumbs). */
const BCF_CART_BUNDLE_IMG: Record<ShopTextureCategoryThumbTexture, string> = {
  straight: '/assets/straight-bundle-product.JPG',
  wavy: '/assets/wavy-bundle-product.JPG',
  curly: '/assets/curly-bundle-product.JPG'
};

const BCF_CART_CLOSURE_IMG: Record<ShopTextureCategoryThumbTexture, string> = {
  straight: '/assets/straight-closure-product.JPG',
  wavy: '/assets/wavy-closure-product.JPG',
  curly: '/assets/curly-closure-product.JPG'
};

const BCF_CART_FRONTAL_IMG: Record<ShopTextureCategoryThumbTexture, string> = {
  straight: '/assets/straight-frontal-product.JPG',
  wavy: '/assets/wavy-frontal-product.JPG',
  curly: '/assets/curly-frontal-product.JPG'
};

/**
 * BCF shop cart thumbnail: prefer stored `image` (PDP hero), else category+texture → same asset as bundles PDP.
 */
export function shopBcfCartLineThumbnailSrc(item: {
  type?: string;
  category?: string;
  texture?: string;
  image?: string;
}): string | null {
  if (item.type !== 'shop-texture-category') return null;
  if (item.image && String(item.image).trim()) return String(item.image).trim();
  const t = item.texture as ShopTextureCategoryThumbTexture | undefined;
  const c = item.category;
  if (!t || (t !== 'straight' && t !== 'wavy' && t !== 'curly')) return null;
  if (c === 'bundles') return BCF_CART_BUNDLE_IMG[t];
  if (c === 'closures') return BCF_CART_CLOSURE_IMG[t];
  if (c === 'frontals') return BCF_CART_FRONTAL_IMG[t];
  return null;
}

/** Known bundle-deal discount (USD) for inferring list subtotal on legacy cart lines. */
export const BCF_BUNDLE_DEAL_DISCOUNT_USD = 40;

/** List (pre-deal) line total for strikethrough; uses stored value or infers from discounted line + fixed $40 off. */
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
