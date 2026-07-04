export type {
  BawVisualSnapshot,
  BawVisualSnapshotBuildInput,
  BawVisualSnapshotCartFields,
  BawVisualSnapshotContext,
  BawVisualSnapshotCropSuffix,
  BawVisualSnapshotStatus,
} from './types';

export { APPROVED_HAIR_COLORS, getApprovedColorMeta, colorNameToSlug, normalizeColorName } from './colorPalette';
export {
  isSignatureUnitCommerceLine,
  productNameToUnitSlug,
  unitSlugToProductName,
  SIGNATURE_UNIT_PRODUCT_NAMES,
} from './unitSlug';
export {
  buildSnapshotAssetId,
  SNAPSHOT_CONTEXT_TO_CROP_SUFFIX,
  visualSnapshotPublicAssetPath,
  visualSnapshotVariantRelativePath,
} from './assetNaming';
export { resolveStaticUnitFallbackUrl, resolveStaticUnitThumbFallback } from './staticFallback';
export { BAW_APPROVED_VARIANT_URLS, lookupApprovedVariantUrl } from './variantRegistry';
export {
  buildBawVisualSnapshot,
  attachVisualSnapshotToCartLine,
  snapshotUrlForContext,
} from './buildSnapshot';
export {
  resolveBawVisualSnapshotThumbnail,
  resolveCommerceLineThumbnailSrc,
  resolveOrderLineThumbnail,
  getSnapshotCropSuffixForContext,
} from './resolveThumbnail';
export {
  buildBawConfigurationLabelLines,
  bawConfigurationSummaryHeadline,
  bawCompactColorLabel,
  isBawVisualSnapshotFallback,
  bawVisualSnapshotFallbackNotice,
} from './configurationLabels';
export type { BawConfigurationLabelLine } from './configurationLabels';
export {
  enqueueBawVisualVariantGeneration,
  listBawVisualVariantGenerationQueue,
} from './assetFactoryHooks';
export type { BawVisualVariantGenerationRequest } from './assetFactoryHooks';
