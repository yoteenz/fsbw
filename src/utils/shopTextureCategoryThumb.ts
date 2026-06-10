import type { CSSProperties } from 'react';

/** Home/shop marbles, cart/bag/checkout, wishlist BCF lines — Supabase BCF PNGs (marble background). */
export type ShopTextureCategoryThumbTexture = 'straight' | 'wavy' | 'curly';
export type ShopTextureCategoryThumbCategory = 'bundles' | 'closures' | 'frontals';

/** Primary BCF marble thumbs (home/shop grid, cart, similar standard slots). */
const BCF_THUMB_SUPABASE_SRC: Record<
  ShopTextureCategoryThumbCategory,
  Record<ShopTextureCategoryThumbTexture, string>
> = {
  bundles: {
    straight:
      'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/BCF/image%20(43).png',
    wavy: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/BCF/image%20(44).png',
    curly:
      'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/BCF/image%20(45).png'
  },
  closures: {
    straight:
      'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/BCF/image%20(46).png',
    wavy: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/BCF/image%20(47).png',
    curly:
      'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/BCF/image%20(48).png'
  },
  frontals: {
    straight:
      'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/BCF/image%20(49).png',
    wavy: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/BCF/image%20(50).png',
    curly:
      'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/BCF/image%20(51).png'
  }
};

/** Legacy `public/assets` marble PNGs — `onError` fallback only. */
const BCF_THUMB_LEGACY_ASSET_SRC: Record<
  ShopTextureCategoryThumbCategory,
  Record<ShopTextureCategoryThumbTexture, string>
> = {
  bundles: {
    straight: '/assets/bundle-straight.png',
    wavy: '/assets/bundle-wavy.png',
    curly: '/assets/bundle-curly.png'
  },
  closures: {
    straight: '/assets/closure-straight.png',
    wavy: '/assets/closure-wavy.png',
    curly: '/assets/closure-curly.png'
  },
  frontals: {
    straight: '/assets/frontal-straight.png',
    wavy: '/assets/frontal-wavy.png',
    curly: '/assets/frontal-curly.png'
  }
};

export function shopTextureCategoryThumbSrc(
  texture: ShopTextureCategoryThumbTexture,
  category: ShopTextureCategoryThumbCategory
): string {
  return BCF_THUMB_SUPABASE_SRC[category][texture];
}

/** Legacy marble PNG for a BCF thumb (`onError` step before unit-style noir fallbacks). */
export function shopTextureCategoryThumbLegacySrc(
  texture: ShopTextureCategoryThumbTexture,
  category: ShopTextureCategoryThumbCategory
): string {
  return BCF_THUMB_LEGACY_ASSET_SRC[category][texture];
}

/** Same PNG marbles as `/products` grid — not BCF PDP hero JPG/Supabase URLs. */
export function shopTextureCategoryHeroPhotoSrc(
  texture: ShopTextureCategoryThumbTexture,
  category: ShopTextureCategoryThumbCategory
): string {
  return shopTextureCategoryThumbSrc(texture, category);
}

export const shopTextureCategoryThumbFallbackSrc: Record<ShopTextureCategoryThumbTexture, string> = {
  straight: '/assets/NOIR/noir-thumb.png',
  wavy: '/assets/NOIR/wave-thumb.png',
  curly: '/assets/NOIR/curl-thumb.png'
};

/** Curly vs straight/wavy: ×1.1 then ×0.95; all textures ×0.9 vs prior (home marbles, PDP hero, similar strip). */
export function shopTextureCategoryThumbDisplayScale(texture: ShopTextureCategoryThumbTexture): number {
  const relativeToStraight = texture === 'curly' ? 1.1 * 0.95 : 1;
  return relativeToStraight * 0.9;
}

/** BCF PDP (`/shop/bundles`, etc.): hero + in-page strips use half of marble/display scale. */
export function shopTextureCategoryProductPageDisplayScale(texture: ShopTextureCategoryThumbTexture): number {
  return shopTextureCategoryThumbDisplayScale(texture) * 0.5;
}

export function isShopTextureCurlyFrontals(
  texture: ShopTextureCategoryThumbTexture,
  category: ShopTextureCategoryThumbCategory
): boolean {
  return texture === 'curly' && category === 'frontals';
}

/** Extra hero-thumb translateY (px); `null` = no img-level nudge. Matches shop marble grid (`products/page.tsx`). */
export function shopTextureCategoryCurlyThumbTranslateYPx(
  texture: ShopTextureCategoryThumbTexture,
  category: ShopTextureCategoryThumbCategory
): number | null {
  return isShopTextureCurlyFrontals(texture, category) ? -2 : null;
}

/** `object-fit: contain` inside fixed slots so new BCF art keeps prior thumb footprint. */
export const bcfThumbContainImgStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  display: 'block',
  margin: 0
};

/** Home/shop BCF grid only — +44% vs base marble thumb width (similar/cart unchanged). */
export const BCF_THUMB_GRID_WIDTH_SCALE = 1.44;

/** Home/shop BCF grid only — nudge thumb art toward product copy below. */
export const BCF_THUMB_GRID_TRANSLATE_Y_PX = 6;

/** Home/shop BCF grid — width % band for contain slot (`49.5 × texture scale × grid scale`). */
export function bcfThumbGridContainSlotStyle(
  texture: ShopTextureCategoryThumbTexture,
  category: ShopTextureCategoryThumbCategory
): CSSProperties {
  const w = `${49.5 * shopTextureCategoryThumbDisplayScale(texture) * BCF_THUMB_GRID_WIDTH_SCALE}%`;
  const curlyNudgePx = shopTextureCategoryCurlyThumbTranslateYPx(texture, category) ?? 0;
  const translateY = BCF_THUMB_GRID_TRANSLATE_Y_PX + curlyNudgePx;
  return {
    width: w,
    maxWidth: '100%',
    aspectRatio: '4 / 5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transform: `translateY(${translateY}px)`
  };
}

const BCF_PLATINUM_SIMILAR_STORAGE_BASE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Platinum%20Blonde';

/** BCF similar strip — platinum cross-category thumbs (closures / frontals only). */
export const BCF_PLATINUM_CROSS_SIMILAR_THUMB_SRC: Record<
  'closures' | 'frontals',
  Record<'wavy' | 'curly', string>
> = {
  closures: {
    wavy: `${BCF_PLATINUM_SIMILAR_STORAGE_BASE}/IMG_2112.png`,
    curly: `${BCF_PLATINUM_SIMILAR_STORAGE_BASE}/IMG_2118.png`
  },
  frontals: {
    wavy: `${BCF_PLATINUM_SIMILAR_STORAGE_BASE}/IMG_2114.png`,
    curly: `${BCF_PLATINUM_SIMILAR_STORAGE_BASE}/IMG_2121.png`
  }
};

export function bcfPlatinumCrossSimilarThumbSrc(
  category: 'closures' | 'frontals',
  texture: 'wavy' | 'curly'
): string {
  return BCF_PLATINUM_CROSS_SIMILAR_THUMB_SRC[category][texture];
}

/** BCF similar strip (2D marble) — same 79.2% width band as `marbleStripThumbImg(false)`. */
export function bcfThumbMarbleStripContainSlotStyle(): CSSProperties {
  return {
    width: '79.2%',
    maxWidth: '100%',
    aspectRatio: '4 / 5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  };
}

/** BCF PDP similar strip — smaller thumbs so the bordered card matches main card width (no bleed). */
export function bcfThumbSimilarStripContainSlotStyle(): CSSProperties {
  return {
    width: '62%',
    maxWidth: '100%',
    aspectRatio: '4 / 5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  };
}

/** Cart / bag / checkout — square slot; image scales with `object-fit: contain`. */
export function bcfThumbCartContainSlotStyle(boxPx: number): CSSProperties {
  return {
    width: `${boxPx}px`,
    height: `${boxPx}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  };
}
