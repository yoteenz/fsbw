/**
 * Care product catalog metadata — uses existing Frontal Slayer identifiers only.
 */

export const WIG_UNIT_DISPLAY_NAMES = [
  'NOIR',
  'BLANCO',
  'SOFT WAVE',
  'BEACH WAVE',
  'SOFT CURL',
  'OCEAN CURL',
] as const;

export type WigUnitDisplayName = (typeof WIG_UNIT_DISPLAY_NAMES)[number];

export const WIG_UNIT_SLUGS = [
  'noir',
  'blanco',
  'soft-wave',
  'beach-wave',
  'soft-curl',
  'ocean-curl',
] as const;

export type WigUnitSlug = (typeof WIG_UNIT_SLUGS)[number];

export type CareProductType = 'unit' | 'bundles' | 'closures' | 'frontals';

export type CareTextureFamily = 'straight' | 'wavy' | 'curly' | 'universal';

export const DISPLAY_NAME_TO_UNIT_SLUG: Record<string, WigUnitSlug> = {
  NOIR: 'noir',
  BLANCO: 'blanco',
  'SOFT WAVE': 'soft-wave',
  'BEACH WAVE': 'beach-wave',
  'SOFT CURL': 'soft-curl',
  'OCEAN CURL': 'ocean-curl',
};

export const UNIT_SLUG_TEXTURE: Record<WigUnitSlug, CareTextureFamily> = {
  noir: 'straight',
  blanco: 'straight',
  'soft-wave': 'wavy',
  'beach-wave': 'wavy',
  'soft-curl': 'curly',
  'ocean-curl': 'curly',
};

export const BCF_CATEGORY_TO_PRODUCT_TYPE: Record<string, CareProductType> = {
  bundles: 'bundles',
  closures: 'closures',
  frontals: 'frontals',
};

/** Order status required to grant purchase-included Care (matches verified-review bar). */
export const CARE_QUALIFYING_ORDER_STATUS = 'DELIVERED' as const;

export const CARE_REVOKED_ORDER_STATUSES = new Set(['CANCELED', 'CANCELLED', 'REFUNDED']);

export function normalizeTextureFamily(raw: string | undefined): CareTextureFamily | undefined {
  if (!raw) return undefined;
  const t = raw.trim().toLowerCase();
  if (t === 'straight') return 'straight';
  if (t === 'wavy') return 'wavy';
  if (t === 'curly') return 'curly';
  if (t === 'universal') return 'universal';
  return undefined;
}

export function textureFamilyFromUnitSlug(slug: string | undefined): CareTextureFamily | undefined {
  if (!slug) return undefined;
  return UNIT_SLUG_TEXTURE[slug as WigUnitSlug];
}

export function displayNameToUnitSlug(name: string | undefined): WigUnitSlug | undefined {
  if (!name) return undefined;
  return DISPLAY_NAME_TO_UNIT_SLUG[name.trim().toUpperCase()];
}
