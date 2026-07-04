import { resolveWigPreviewLiveColorTripleIfStored } from '../wigPreviewLiveStoragePublicUrls';
import { lookupApprovedVariantUrl } from './variantRegistry';
import {
  buildSnapshotAssetId,
  SNAPSHOT_CONTEXT_TO_CROP_SUFFIX,
  visualSnapshotPublicAssetPath,
} from './assetNaming';
import { getApprovedColorMeta } from './colorPalette';
import { productNameToUnitSlug, unitSlugToProductName } from './unitSlug';
import { resolveStaticUnitThumbFallback } from './staticFallback';
import { enqueueBawVisualVariantGeneration } from './assetFactoryHooks';
import type {
  BawVisualSnapshot,
  BawVisualSnapshotBuildInput,
  BawVisualSnapshotCropSuffix,
  BawVisualSnapshotStatus,
} from './types';

const CROP_SUFFIXES: BawVisualSnapshotCropSuffix[] = [
  'hero',
  'cart',
  'wishlist',
  'checkout',
  'order',
  'admin',
];

async function tryResolveLivePreviewFront(input: BawVisualSnapshotBuildInput): Promise<string | null> {
  try {
    const triple = await resolveWigPreviewLiveColorTripleIfStored({
      unitKey: input.productName,
      length: String(input.length || '24"'),
      density: String(input.density || '200%'),
      lace: String(input.lace || '13X6'),
      texture: String(input.texture || 'SILKY'),
      color: String(input.color || 'OFF BLACK'),
      hairline: String(input.hairline || 'NATURAL'),
      styling: String(input.styling || 'NONE'),
      addOns: input.addOns ?? [],
    });
    return triple?.[1] ?? null;
  } catch {
    return null;
  }
}

function resolveUrlsByContext(
  unitSlug: string,
  colorSlug: string,
  primaryUrl: string
): Partial<Record<BawVisualSnapshotCropSuffix, string>> {
  const urls: Partial<Record<BawVisualSnapshotCropSuffix, string>> = {};
  for (const suffix of CROP_SUFFIXES) {
    const assetId = buildSnapshotAssetId(unitSlug, colorSlug, suffix);
    urls[suffix] = lookupApprovedVariantUrl(assetId) ?? primaryUrl;
  }
  return urls;
}

/** Build visual snapshot for a configured Signature unit. */
export async function buildBawVisualSnapshot(input: BawVisualSnapshotBuildInput): Promise<BawVisualSnapshot | null> {
  const unitSlug = productNameToUnitSlug(input.productName);
  if (!unitSlug) return null;

  const colorMeta = getApprovedColorMeta(input.color);
  const colorSlug = colorMeta.slug;
  const cartAssetId = buildSnapshotAssetId(unitSlug, colorSlug, 'cart');

  let url: string | null =
    lookupApprovedVariantUrl(cartAssetId) ??
    lookupApprovedVariantUrl(buildSnapshotAssetId(unitSlug, colorSlug, 'hero'));

  let status: BawVisualSnapshotStatus = url ? 'READY' : 'MISSING';

  if (!url) {
    const liveFront = await tryResolveLivePreviewFront(input);
    if (liveFront) {
      url = liveFront;
      status = 'READY';
    }
  }

  const fallbackUrl = resolveStaticUnitThumbFallback(input.productName, input.hairline);
  const fallbackLabel = `${unitSlugToProductName(unitSlug)} · ${colorMeta.name}`;

  let generationRequestId: string | undefined;
  if (!url) {
    url = fallbackUrl;
    status = 'FALLBACK_USED';
    const req = enqueueBawVisualVariantGeneration(input);
    generationRequestId = req?.id;
  }

  const urlsByContext = resolveUrlsByContext(unitSlug, colorSlug, url);
  for (const suffix of CROP_SUFFIXES) {
    if (!urlsByContext[suffix]) {
      urlsByContext[suffix] =
        lookupApprovedVariantUrl(buildSnapshotAssetId(unitSlug, colorSlug, suffix)) ??
        visualSnapshotPublicAssetPath(unitSlug, colorSlug, suffix);
    }
  }

  return {
    baseUnitId: unitSlug,
    baseUnitLabel: unitSlugToProductName(unitSlug),
    colorName: colorMeta.name,
    colorHex: colorMeta.hex,
    colorSlug,
    length: input.length,
    density: input.density,
    lace: input.lace,
    capSize: input.capSize,
    texture: input.texture,
    hairline: input.hairline,
    styling: input.styling,
    partSelection: input.partSelection,
    addOns: input.addOns,
    assetId: cartAssetId,
    url,
    urlsByContext,
    status,
    fallbackUrl,
    fallbackLabel,
    generationRequestId,
    preparedAt: new Date().toISOString().slice(0, 10),
  };
}

export async function attachVisualSnapshotToCartLine<T extends Record<string, unknown>>(
  line: T,
  input: BawVisualSnapshotBuildInput
): Promise<T & { visualSnapshot?: BawVisualSnapshot; image?: string }> {
  const snapshot = await buildBawVisualSnapshot(input);
  if (!snapshot) return line;
  return {
    ...line,
    image: snapshot.url,
    visualSnapshot: snapshot,
    visualSnapshotAssetId: snapshot.assetId,
    visualSnapshotUrl: snapshot.url,
    visualSnapshotStatus: snapshot.status,
    baseUnitId: snapshot.baseUnitId,
    selectedColorHex: snapshot.colorHex,
  };
}

export function snapshotUrlForContext(
  snapshot: BawVisualSnapshot | undefined,
  context: keyof typeof SNAPSHOT_CONTEXT_TO_CROP_SUFFIX
): string | null {
  if (!snapshot) return null;
  const suffix = SNAPSHOT_CONTEXT_TO_CROP_SUFFIX[context];
  return snapshot.urlsByContext?.[suffix] ?? snapshot.url ?? null;
}
