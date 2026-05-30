/** BCF thumbnails for `/shop/*` PDP strips, `/products` shop grid, and related product-page surfaces. */
export type ShopTextureCategoryThumbTexture = 'straight' | 'wavy' | 'curly';
export type ShopTextureCategoryThumbCategory = 'bundles' | 'closures' | 'frontals';

/** BCF product-page thumbnails (shop grid, PDP similar strip, marble thumbs). Matches PDP hero photos. */
const BCF_THUMB_PHOTO_BY_TEXTURE: Record<
  ShopTextureCategoryThumbCategory,
  Record<ShopTextureCategoryThumbTexture, string>
> = {
  bundles: {
    straight:
      'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/3D%20images/_6biiXliVwiLZhD23zVMx_ikG2kkur.jpeg',
    wavy: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/3D%20images/8XBa-oP-wP7tmQSFYMN62_9tFh7bo7.jpeg',
    curly:
      'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/3D%20images/opLZf4GQ8_KuizHCa_5gZ_QGYh1ZNb.jpeg',
  },
  closures: {
    straight:
      'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/3D%20images/eJn5HaBZjFrYSylTtbb0M_5rpwUenT.jpeg',
    wavy: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/3D%20images/1Oxkel3HVLOhgB9JoyTEf_lqIBqIf9.jpeg',
    curly:
      'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/3D%20images/uzxxkL1smy3pZ2ObGuiEx_nuxYnKn5.jpeg',
  },
  frontals: {
    straight:
      'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/3D%20images/cq8RwLDCRxEgXU2ypqQru_E0ie561k.jpeg',
    wavy: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/3D%20images/soEIhbMX-172lkCFRci45_QRbCqwEV.jpeg',
    curly:
      'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/3D%20images/_8voCgZgm-dyEMhxvP3kU_vNtnWVLA.jpeg',
  },
};

export function shopTextureCategoryThumbSrc(
  texture: ShopTextureCategoryThumbTexture,
  category: ShopTextureCategoryThumbCategory
): string {
  return BCF_THUMB_PHOTO_BY_TEXTURE[category][texture];
}

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
