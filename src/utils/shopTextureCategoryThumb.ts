/** `/shop/bundles?texture=…` PDP + home/shop marbles share these `public/assets` PNGs. */
export type ShopTextureCategoryThumbTexture = 'straight' | 'wavy' | 'curly';
export type ShopTextureCategoryThumbCategory = 'bundles' | 'closures' | 'frontals';

export function shopTextureCategoryThumbSrc(
  texture: ShopTextureCategoryThumbTexture,
  category: ShopTextureCategoryThumbCategory
): string {
  if (texture === 'straight' && category === 'bundles') {
    return '/assets/bundle-straight.png';
  }
  if (texture === 'wavy' && category === 'bundles') {
    return '/assets/bundle-wavy.png';
  }
  if (texture === 'curly' && category === 'bundles') {
    return '/assets/bundle-curly.png';
  }
  if (texture === 'straight' && category === 'closures') {
    return '/assets/closure-straight.png';
  }
  if (texture === 'wavy' && category === 'closures') {
    return '/assets/closure-wavy.png';
  }
  if (texture === 'curly' && category === 'closures') {
    return '/assets/closure-curly.png';
  }
  if (texture === 'straight' && category === 'frontals') {
    return '/assets/frontal-straight.png';
  }
  if (texture === 'wavy' && category === 'frontals') {
    return '/assets/frontal-wavy.png';
  }
  if (texture === 'curly' && category === 'frontals') {
    return '/assets/frontal-curly.png';
  }
  const suffix =
    category === 'bundles' ? 'bundle' : category === 'closures' ? 'closure' : 'frontal';
  return `/assets/${texture}-${suffix}.png`;
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
