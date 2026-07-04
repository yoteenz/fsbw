import type { SignatureCollectionUnitSlug } from '../../studio-os/product-photography';

const PRODUCT_TO_SLUG: Record<string, SignatureCollectionUnitSlug> = {
  NOIR: 'noir',
  BLANCO: 'blanco',
  'SOFT WAVE': 'soft-wave',
  'BEACH WAVE': 'beach-wave',
  'SOFT CURL': 'soft-curl',
  'OCEAN CURL': 'ocean-curl',
};

const SLUG_TO_LABEL: Record<SignatureCollectionUnitSlug, string> = {
  noir: 'NOIR',
  blanco: 'BLANCO',
  'soft-wave': 'SOFT WAVE',
  'beach-wave': 'BEACH WAVE',
  'soft-curl': 'SOFT CURL',
  'ocean-curl': 'OCEAN CURL',
};

export const SIGNATURE_UNIT_PRODUCT_NAMES = Object.keys(PRODUCT_TO_SLUG);

export function productNameToUnitSlug(productName: string): SignatureCollectionUnitSlug | null {
  const key = String(productName || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');
  return PRODUCT_TO_SLUG[key] ?? null;
}

export function unitSlugToProductName(slug: string): string {
  return SLUG_TO_LABEL[slug as SignatureCollectionUnitSlug] ?? slug.toUpperCase();
}

/** True for Signature Collection wig lines (not gift, booking, BCF, membership). */
export function isSignatureUnitCommerceLine(item: {
  name?: string;
  productName?: string;
  type?: string;
}): boolean {
  if (!item) return false;
  if (
    item.type === 'gift-card' ||
    item.type === 'digital' ||
    item.type === 'booking-consult' ||
    item.type === 'booking-appointment' ||
    item.type === 'shop-texture-category'
  ) {
    return false;
  }
  const name = String(item.productName || item.name || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');
  if (name === 'GIFT CARD' || name === 'SLAY TICKET') return false;
  return productNameToUnitSlug(name) != null;
}
