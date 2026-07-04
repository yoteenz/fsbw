import type { BawVisualSnapshotContext, BawVisualSnapshotCropSuffix } from './types';

/** Map commerce surface → crop suffix for asset naming. */
export const SNAPSHOT_CONTEXT_TO_CROP_SUFFIX: Record<BawVisualSnapshotContext, BawVisualSnapshotCropSuffix> = {
  'cart-dropdown': 'cart',
  wishlist: 'wishlist',
  'cart-page': 'cart',
  checkout: 'checkout',
  'order-confirmation': 'checkout',
  'order-history': 'order',
  'admin-order': 'admin',
};

/** `{unitSlug}_{colorSlug}_{suffix}` e.g. soft-wave_cherry_cart */
export function buildSnapshotAssetId(
  unitSlug: string,
  colorSlug: string,
  suffix: BawVisualSnapshotCropSuffix
): string {
  return `${unitSlug}_${colorSlug}_${suffix}`;
}

export function visualSnapshotVariantRelativePath(
  unitSlug: string,
  colorSlug: string,
  suffix: BawVisualSnapshotCropSuffix
): string {
  return `studio-os/product-photography/visual-snapshots/signature-collection/${unitSlug}/${colorSlug}/${suffix}.png`;
}

/** Public path when variant is published to `/assets/baw-visual-snapshots/`. */
export function visualSnapshotPublicAssetPath(
  unitSlug: string,
  colorSlug: string,
  suffix: BawVisualSnapshotCropSuffix
): string {
  return `/assets/baw-visual-snapshots/${buildSnapshotAssetId(unitSlug, colorSlug, suffix)}.png`;
}
