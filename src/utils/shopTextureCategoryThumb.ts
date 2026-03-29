/** `/straight/bundles`, `/wavy/closures`, etc. — hero + home/shop marbles share these `public/assets` PNGs. */
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

/** Curly bundles / closures / frontals thumbnails render 10% larger than straight / wavy (home marbles + PDP). */
export function shopTextureCategoryThumbDisplayScale(texture: ShopTextureCategoryThumbTexture): number {
  return texture === 'curly' ? 1.1 : 1;
}
