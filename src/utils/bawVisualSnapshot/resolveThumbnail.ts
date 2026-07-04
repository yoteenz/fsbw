import type { BawVisualSnapshotContext } from './types';
import { isSignatureUnitCommerceLine } from './unitSlug';
import { snapshotUrlForContext } from './buildSnapshot';
import type { BawVisualSnapshot } from './types';
import { SNAPSHOT_CONTEXT_TO_CROP_SUFFIX } from './assetNaming';
import { resolveStaticUnitThumbFallback } from './staticFallback';

type LineWithSnapshot = {
  name?: string;
  productName?: string;
  type?: string;
  hairline?: string;
  image?: string;
  visualSnapshot?: BawVisualSnapshot;
  visualSnapshotUrl?: string;
  visualSnapshotStatus?: string;
};

/** Resolve thumbnail URL for cart / wishlist / checkout / orders. */
export function resolveBawVisualSnapshotThumbnail(
  item: LineWithSnapshot,
  context: BawVisualSnapshotContext
): string | null {
  if (!isSignatureUnitCommerceLine(item)) return null;

  const snap = item.visualSnapshot;
  if (snap) {
    const contextual = snapshotUrlForContext(snap, context);
    if (contextual) return contextual;
  }

  if (typeof item.visualSnapshotUrl === 'string' && item.visualSnapshotUrl.trim()) {
    return item.visualSnapshotUrl.trim();
  }

  if (item.visualSnapshotStatus === 'FALLBACK_USED' && snap?.fallbackUrl) {
    return snap.fallbackUrl;
  }

  return null;
}

/** Prefer snapshot thumb; caller falls back to legacy static resolution. */
export function resolveCommerceLineThumbnailSrc(
  item: LineWithSnapshot,
  context: BawVisualSnapshotContext,
  legacyFallback: () => string
): string {
  const snapThumb = resolveBawVisualSnapshotThumbnail(item, context);
  if (snapThumb) return snapThumb;
  if (isSignatureUnitCommerceLine(item) && item.image) return item.image;
  return legacyFallback();
}

export function getSnapshotCropSuffixForContext(context: BawVisualSnapshotContext): string {
  return SNAPSHOT_CONTEXT_TO_CROP_SUFFIX[context];
}

export function resolveOrderLineThumbnail(
  line: {
    productName?: string;
    name?: string;
    options?: Record<string, string>;
    visualSnapshotUrl?: string;
    image?: string;
    visualSnapshot?: BawVisualSnapshot;
  },
  context: BawVisualSnapshotContext = 'order-history'
): string {
  const productName = line.productName || line.name || 'NOIR';
  const merged: LineWithSnapshot = {
    name: productName,
    productName,
    hairline: line.options?.hairline,
    visualSnapshot: line.visualSnapshot,
    visualSnapshotUrl: line.visualSnapshotUrl ?? line.options?.visualSnapshotUrl,
    visualSnapshotStatus: line.options?.visualSnapshotStatus,
    image: line.image ?? line.options?.image,
  };
  return resolveCommerceLineThumbnailSrc(merged, context, () =>
    resolveStaticUnitThumbFallback(productName, line.options?.hairline)
  );
}
