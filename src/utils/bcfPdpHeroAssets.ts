/**
 * BCF PDP hero product images — shared by mobile PDP and desktop Extensions Boutique panel.
 */

import type { ShopTextureCategoryThumbCategory, ShopTextureCategoryThumbTexture } from './shopTextureCategoryThumb';
import { BCF_PDP_CF_HERO_PHOTOS } from './bcfPdpCfHeroPhotos.generated';

export type BcfPdpCategory = ShopTextureCategoryThumbCategory;
export type BcfPdpTexture = ShopTextureCategoryThumbTexture;

function slugifyColorId(colorId: string): string {
  return String(colorId || 'DEFAULT')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildCfPhotoProductKey(
  category: 'closures' | 'frontals',
  texture: BcfPdpTexture,
  colorId: string,
): string {
  return `${category}-${texture}-${slugifyColorId(colorId)}`;
}

function cfManifestPhotoUrl(
  category: 'closures' | 'frontals',
  texture: BcfPdpTexture,
  colorId: string,
): string | null {
  const productKey = buildCfPhotoProductKey(category, texture, colorId);
  const photos = BCF_PDP_CF_HERO_PHOTOS as Record<
    string,
    { photoStoragePath?: string | null; generatedAt?: string | null }
  >;
  const hit = photos[productKey];
  const storagePath = hit?.photoStoragePath;
  if (!storagePath) return null;
  const sample = BUNDLE_PHOTO_BY_TEXTURE.straight;
  const marker = '/storage/v1/object/public/live-preview/';
  const idx = sample.indexOf(marker);
  if (idx === -1) return null;
  const base = sample.slice(0, idx + marker.length);
  const url = `${base}${storagePath
    .split('/')
    .map((part: string) => encodeURIComponent(part))
    .join('/')}`;
  const version = hit.generatedAt?.trim();
  return version ? `${url}?v=${encodeURIComponent(version)}` : url;
}

/** Bundles PDP photo URLs (video files remain on mobile PDP). */
export const BUNDLE_PHOTO_BY_TEXTURE: Record<BcfPdpTexture, string> = {
  straight:
    'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/3D%20images/bJSeVXN5LlWhbDAM5Vc6A_WV70Nuqw.jpeg',
  wavy: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/3D%20images/8XBa-oP-wP7tmQSFYMN62_9tFh7bo7.jpeg',
  curly:
    'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/3D%20images/opLZf4GQ8_KuizHCa_5gZ_QGYh1ZNb.jpeg',
};

const BUNDLE_STRAIGHT_COLOR_PHOTO_BASE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Bundles%20Color/Straight';

const BUNDLE_PLATINUM_COLOR_PHOTO_BASE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Bundles%20Color/Platinum';

const BUNDLE_STRAIGHT_COLOR_PHOTO: Partial<Record<string, string>> = {
  'JET BLACK': `${BUNDLE_STRAIGHT_COLOR_PHOTO_BASE}/IMG_2147.png`,
  ESPRESSO: `${BUNDLE_STRAIGHT_COLOR_PHOTO_BASE}/IMG_2150.png`,
  CHESTNUT: `${BUNDLE_STRAIGHT_COLOR_PHOTO_BASE}/IMG_2151.png`,
  HONEY: `${BUNDLE_STRAIGHT_COLOR_PHOTO_BASE}/IMG_2148.png`,
  AUBURN: `${BUNDLE_STRAIGHT_COLOR_PHOTO_BASE}/IMG_2153.png`,
  COPPER: `${BUNDLE_STRAIGHT_COLOR_PHOTO_BASE}/IMG_2154.png`,
  GINGER: `${BUNDLE_STRAIGHT_COLOR_PHOTO_BASE}/IMG_2155.png`,
  SANGRIA: `${BUNDLE_STRAIGHT_COLOR_PHOTO_BASE}/IMG_2156.png`,
  CHERRY: `${BUNDLE_STRAIGHT_COLOR_PHOTO_BASE}/IMG_2157.png`,
  RASPBERRY: `${BUNDLE_STRAIGHT_COLOR_PHOTO_BASE}/IMG_2158.png`,
  PLUM: `${BUNDLE_STRAIGHT_COLOR_PHOTO_BASE}/IMG_2159.png`,
  COBALT: `${BUNDLE_STRAIGHT_COLOR_PHOTO_BASE}/IMG_2160.png`,
  TEAL: `${BUNDLE_STRAIGHT_COLOR_PHOTO_BASE}/IMG_2161.png`,
  SLIME: `${BUNDLE_STRAIGHT_COLOR_PHOTO_BASE}/IMG_2162.png`,
  CITRINE: `${BUNDLE_STRAIGHT_COLOR_PHOTO_BASE}/IMG_2163.png`,
  GOLDEN: `${BUNDLE_PLATINUM_COLOR_PHOTO_BASE}/IMG_2041.png`,
  PLATINUM: `${BUNDLE_PLATINUM_COLOR_PHOTO_BASE}/IMG_2042.png`,
  ASH: `${BUNDLE_PLATINUM_COLOR_PHOTO_BASE}/IMG_2043.png`,
};

const BUNDLE_WAVY_COLOR_PHOTO_BASE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Bundles%20Color/Wavy';

const BUNDLE_WAVY_COLOR_PHOTO: Partial<Record<string, string>> = {
  'JET BLACK': `${BUNDLE_WAVY_COLOR_PHOTO_BASE}/IMG_2171.png`,
  ESPRESSO: `${BUNDLE_WAVY_COLOR_PHOTO_BASE}/IMG_2181.png`,
  CHESTNUT: `${BUNDLE_WAVY_COLOR_PHOTO_BASE}/IMG_2182.png`,
  HONEY: `${BUNDLE_WAVY_COLOR_PHOTO_BASE}/IMG_2183.png`,
  AUBURN: `${BUNDLE_WAVY_COLOR_PHOTO_BASE}/IMG_2184.png`,
  COPPER: `${BUNDLE_WAVY_COLOR_PHOTO_BASE}/IMG_2185.png`,
  GINGER: `${BUNDLE_WAVY_COLOR_PHOTO_BASE}/IMG_2186.png`,
  SANGRIA: `${BUNDLE_WAVY_COLOR_PHOTO_BASE}/IMG_2187.png`,
  CHERRY: `${BUNDLE_WAVY_COLOR_PHOTO_BASE}/IMG_2188.png`,
  RASPBERRY: `${BUNDLE_WAVY_COLOR_PHOTO_BASE}/IMG_2189.png`,
  PLUM: `${BUNDLE_WAVY_COLOR_PHOTO_BASE}/IMG_2190.png`,
  COBALT: `${BUNDLE_WAVY_COLOR_PHOTO_BASE}/IMG_2191.png`,
  TEAL: `${BUNDLE_WAVY_COLOR_PHOTO_BASE}/IMG_2193.png`,
  SLIME: `${BUNDLE_WAVY_COLOR_PHOTO_BASE}/IMG_2194.png`,
  CITRINE: `${BUNDLE_WAVY_COLOR_PHOTO_BASE}/IMG_2195.png`,
  GOLDEN: `${BUNDLE_PLATINUM_COLOR_PHOTO_BASE}/IMG_2044.png`,
  PLATINUM: `${BUNDLE_PLATINUM_COLOR_PHOTO_BASE}/IMG_2045.png`,
  ASH: `${BUNDLE_PLATINUM_COLOR_PHOTO_BASE}/IMG_2046.png`,
};

const BUNDLE_CURLY_COLOR_PHOTO_BASE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Bundles%20Color/Curly';

const BUNDLE_CURLY_COLOR_PHOTO: Partial<Record<string, string>> = {
  'JET BLACK': `${BUNDLE_CURLY_COLOR_PHOTO_BASE}/IMG_2196.png`,
  ESPRESSO: `${BUNDLE_CURLY_COLOR_PHOTO_BASE}/IMG_2197.png`,
  CHESTNUT: `${BUNDLE_CURLY_COLOR_PHOTO_BASE}/IMG_2198.png`,
  HONEY: `${BUNDLE_CURLY_COLOR_PHOTO_BASE}/IMG_2199.png`,
  AUBURN: `${BUNDLE_CURLY_COLOR_PHOTO_BASE}/IMG_2200.png`,
  COPPER: `${BUNDLE_CURLY_COLOR_PHOTO_BASE}/gpt-image-2-edit-1%20(2).png`,
  GINGER: `${BUNDLE_CURLY_COLOR_PHOTO_BASE}/IMG_2202.png`,
  SANGRIA: `${BUNDLE_CURLY_COLOR_PHOTO_BASE}/IMG_2203.png`,
  CHERRY: `${BUNDLE_CURLY_COLOR_PHOTO_BASE}/IMG_2204.png`,
  RASPBERRY: `${BUNDLE_CURLY_COLOR_PHOTO_BASE}/IMG_2205.png`,
  PLUM: `${BUNDLE_CURLY_COLOR_PHOTO_BASE}/IMG_2206.png`,
  COBALT: `${BUNDLE_CURLY_COLOR_PHOTO_BASE}/IMG_2207.png`,
  TEAL: `${BUNDLE_CURLY_COLOR_PHOTO_BASE}/IMG_2176.png`,
  SLIME: `${BUNDLE_CURLY_COLOR_PHOTO_BASE}/IMG_2209.png`,
  CITRINE: `${BUNDLE_CURLY_COLOR_PHOTO_BASE}/IMG_2210.png`,
  GOLDEN: `${BUNDLE_PLATINUM_COLOR_PHOTO_BASE}/IMG_2047.png`,
  PLATINUM: `${BUNDLE_PLATINUM_COLOR_PHOTO_BASE}/IMG_2048.png`,
  ASH: `${BUNDLE_PLATINUM_COLOR_PHOTO_BASE}/IMG_2049.png`,
};

const CLOSURES_COLOR_PHOTO_BASE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Closures%20Color/Platinum';

const CLOSURES_COLOR_PHOTO: Record<BcfPdpTexture, Partial<Record<string, string>>> = {
  straight: {
    GOLDEN: `${CLOSURES_COLOR_PHOTO_BASE}/IMG_2029.png`,
    PLATINUM: `${CLOSURES_COLOR_PHOTO_BASE}/IMG_2030.png`,
    ASH: `${CLOSURES_COLOR_PHOTO_BASE}/IMG_2031.png`,
  },
  wavy: {
    GOLDEN: `${CLOSURES_COLOR_PHOTO_BASE}/IMG_2032.png`,
    PLATINUM: `${CLOSURES_COLOR_PHOTO_BASE}/IMG_2033.png`,
    ASH: `${CLOSURES_COLOR_PHOTO_BASE}/IMG_2034.png`,
  },
  curly: {
    GOLDEN: `${CLOSURES_COLOR_PHOTO_BASE}/IMG_2035.png`,
    PLATINUM: `${CLOSURES_COLOR_PHOTO_BASE}/IMG_2036.png`,
    ASH: `${CLOSURES_COLOR_PHOTO_BASE}/IMG_2037.png`,
  },
};

const FRONTALS_COLOR_PHOTO_BASE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Frontals%20Color/Platinum';

const FRONTALS_COLOR_PHOTO: Record<BcfPdpTexture, Partial<Record<string, string>>> = {
  straight: {
    GOLDEN: `${FRONTALS_COLOR_PHOTO_BASE}/IMG_2014.png`,
    PLATINUM: `${FRONTALS_COLOR_PHOTO_BASE}/IMG_2016.png`,
    ASH: `${FRONTALS_COLOR_PHOTO_BASE}/IMG_2017.png`,
  },
  wavy: {
    GOLDEN: `${FRONTALS_COLOR_PHOTO_BASE}/IMG_2023.png`,
    PLATINUM: `${FRONTALS_COLOR_PHOTO_BASE}/IMG_2024.png`,
    ASH: `${FRONTALS_COLOR_PHOTO_BASE}/IMG_2025.png`,
  },
  curly: {
    GOLDEN: `${FRONTALS_COLOR_PHOTO_BASE}/IMG_2026.png`,
    PLATINUM: `${FRONTALS_COLOR_PHOTO_BASE}/IMG_2027.png`,
    ASH: `${FRONTALS_COLOR_PHOTO_BASE}/IMG_2028.png`,
  },
};

const BUNDLE_COLOR_PHOTO_BY_TEXTURE: Record<BcfPdpTexture, Partial<Record<string, string>>> = {
  straight: BUNDLE_STRAIGHT_COLOR_PHOTO,
  wavy: BUNDLE_WAVY_COLOR_PHOTO,
  curly: BUNDLE_CURLY_COLOR_PHOTO,
};

/** Closures & frontals PDP default photo URLs. */
export const BCF_CF_PHOTO: Record<'closures' | 'frontals', Record<BcfPdpTexture, string>> = {
  closures: {
    straight:
      'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/3D%20images/eJn5HaBZjFrYSylTtbb0M_5rpwUenT.jpeg',
    wavy: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/3D%20images/1Oxkel3HVLOhgB9JoyTEf_lqIBqIf9.jpeg',
    curly:
      'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/3D%20images/LeyLbku6UNCCi0kxINgoO_dvi4DQp1.jpeg',
  },
  frontals: {
    straight:
      'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/3D%20images/cq8RwLDCRxEgXU2ypqQru_E0ie561k.jpeg',
    wavy: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/3D%20images/soEIhbMX-172lkCFRci45_QRbCqwEV.jpeg',
    curly:
      'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/3D%20images/_8voCgZgm-dyEMhxvP3kU_vNtnWVLA.jpeg',
  },
};

/** True when this color has its own PNG (not the texture default hero). */
export function bcfPdpHeroHasColorSpecificPhoto(
  category: BcfPdpCategory,
  texture: BcfPdpTexture,
  colorId: string,
): boolean {
  const colorKey = String(colorId || '').toUpperCase();
  if (category === 'bundles') {
    return Boolean(BUNDLE_COLOR_PHOTO_BY_TEXTURE[texture][colorKey]);
  }
  if (category === 'closures') {
    return Boolean(
      cfManifestPhotoUrl('closures', texture, colorKey) ||
        CLOSURES_COLOR_PHOTO[texture][colorKey],
    );
  }
  return Boolean(
    cfManifestPhotoUrl('frontals', texture, colorKey) || FRONTALS_COLOR_PHOTO[texture][colorKey],
  );
}

export function bcfPdpHeroPhotoSrc(
  category: BcfPdpCategory,
  texture: BcfPdpTexture,
  colorId: string,
): string {
  const colorKey = String(colorId || '').toUpperCase();
  if (category === 'bundles') {
    const tinted = BUNDLE_COLOR_PHOTO_BY_TEXTURE[texture][colorKey];
    if (tinted) return tinted;
    return BUNDLE_PHOTO_BY_TEXTURE[texture];
  }
  if (category === 'closures') {
    const manifestHit = cfManifestPhotoUrl('closures', texture, colorKey);
    if (manifestHit) return manifestHit;
    const tinted = CLOSURES_COLOR_PHOTO[texture][colorKey];
    if (tinted) return tinted;
    return BCF_CF_PHOTO.closures[texture];
  }
  const manifestHit = cfManifestPhotoUrl('frontals', texture, colorKey);
  if (manifestHit) return manifestHit;
  const tinted = FRONTALS_COLOR_PHOTO[texture][colorKey];
  if (tinted) return tinted;
  return BCF_CF_PHOTO.frontals[texture];
}
