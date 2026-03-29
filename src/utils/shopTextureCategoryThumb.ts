/** `/straight/bundles`, `/wavy/closures`, etc. — hero + home/shop marbles share these `public/assets` PNGs. */
export type ShopTextureCategoryThumbTexture = 'straight' | 'wavy' | 'curly';
export type ShopTextureCategoryThumbCategory = 'bundles' | 'closures' | 'frontals';

export function shopTextureCategoryThumbSrc(
  texture: ShopTextureCategoryThumbTexture,
  category: ShopTextureCategoryThumbCategory
): string {
  const suffix =
    category === 'bundles' ? 'bundle' : category === 'closures' ? 'closure' : 'frontal';
  return `/assets/${texture}-${suffix}.png`;
}

export const shopTextureCategoryThumbFallbackSrc: Record<ShopTextureCategoryThumbTexture, string> = {
  straight: '/assets/NOIR/noir-thumb.png',
  wavy: '/assets/NOIR/wave-thumb.png',
  curly: '/assets/NOIR/curl-thumb.png'
};
