/**
 * Signature Collection registry — Frontal Slayer flagship units 001–006.
 */

export type SignatureCollectionUnitSlug =
  | 'noir'
  | 'blanco'
  | 'soft-wave'
  | 'beach-wave'
  | 'soft-curl'
  | 'ocean-curl';

export type SignatureCollectionUnit = {
  collectionNo: string;
  slug: SignatureCollectionUnitSlug;
  label: string;
  shopPath: string;
  /** Reference mannequin asset (site `/assets/` until media kit populated). */
  referenceImageSrc: string;
};

export const SIGNATURE_COLLECTION_UNITS: readonly SignatureCollectionUnit[] = [
  {
    collectionNo: '001',
    slug: 'noir',
    label: 'NOIR',
    shopPath: '/straight/noir',
    referenceImageSrc: '/assets/natural front.png',
  },
  {
    collectionNo: '002',
    slug: 'blanco',
    label: 'BLANCO',
    shopPath: '/straight/blanco',
    referenceImageSrc: '/assets/2D BLANCO FRONT.png',
  },
  {
    collectionNo: '003',
    slug: 'soft-wave',
    label: 'SOFT WAVE',
    shopPath: '/wavy/soft-wave',
    referenceImageSrc: '/assets/2D WAVY FRONT.png',
  },
  {
    collectionNo: '004',
    slug: 'beach-wave',
    label: 'BEACH WAVE',
    shopPath: '/wavy/beach-wave',
    referenceImageSrc: '/assets/2D WAVY FRONT.png',
  },
  {
    collectionNo: '005',
    slug: 'soft-curl',
    label: 'SOFT CURL',
    shopPath: '/curly/soft-curl',
    referenceImageSrc: '/assets/2D CURLY FRONT.png',
  },
  {
    collectionNo: '006',
    slug: 'ocean-curl',
    label: 'OCEAN CURL',
    shopPath: '/curly/ocean-curl',
    referenceImageSrc: '/assets/2D CURLY FRONT.png',
  },
] as const;

export function getSignatureUnitBySlug(slug: string): SignatureCollectionUnit | undefined {
  return SIGNATURE_COLLECTION_UNITS.find((u) => u.slug === slug);
}

export function listSignatureCollectionSlugs(): SignatureCollectionUnitSlug[] {
  return SIGNATURE_COLLECTION_UNITS.map((u) => u.slug);
}
