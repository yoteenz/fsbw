import { PHOTOGRAPHY_LOCKED_SPECIFICATIONS, PHOTOGRAPHY_SYSTEM_VERSION } from './PhotographySpecifications';
import { PHOTOGRAPHY_EXPORT_TEMPLATES } from './PhotographyTemplates';
import { DERIVATIVE_SLOT_DEFINITIONS } from './DerivativeAssetRegistry';

export { PhotographyBibleProvider, PhotographySystemProvider, usePhotographySystem, createPhotographySystemValue } from './PhotographyBibleProvider';
export { PhotographySystemContext } from './PhotographySystemContext';
export {
  PHOTOGRAPHY_LOCKED_SPECIFICATIONS,
  PHOTOGRAPHY_SYSTEM_VERSION,
  PHOTOGRAPHY_SYSTEM_V1_DETAIL,
  PHOTOGRAPHY_INHERITANCE_FIELDS,
  getPhotographyLockedSpec,
} from './PhotographySpecifications';
export type { PhotographyLockedSpec, PhotographyLockedSpecId, PhotographySystemSpecDetail } from './PhotographySpecifications';
export { SIGNATURE_COLLECTION_UNITS, getSignatureUnitBySlug, listSignatureCollectionSlugs } from './SignatureCollectionRegistry';
export type { SignatureCollectionUnit, SignatureCollectionUnitSlug } from './SignatureCollectionRegistry';
export {
  MEDIA_KIT_ASSET_SLOTS,
  mediaKitFolderPath,
  buildMediaKitForUnit,
  listAllMediaKitFolderPaths,
} from './MediaKitRegistry';
export type { MediaKitAssetType, MediaKitAssetSlot } from './MediaKitRegistry';
export { PHOTOGRAPHY_EXPORT_TEMPLATES, getExportTemplate } from './PhotographyTemplates';
export type { PhotographyExportTemplate } from './PhotographyTemplates';
export {
  PHOTOGRAPHY_VERSION_1_0,
  PHOTOGRAPHY_VERSION_HISTORY,
  PHOTOGRAPHY_FUTURE_VERSION_SLOTS,
  getCurrentPhotographyVersion,
  getPhotographyVersion,
  isPhotographyVersionImmutable,
  appendPhotographyVersionDraft,
} from './PhotographyVersionManager';
export type { PhotographyVersionRecord, PhotographyVersionStatus } from './PhotographyVersionManager';
export {
  DERIVATIVE_CROP_TEMPLATES,
  getCropTemplate,
  listCropTemplatesByCategory,
  resolveCropPixels,
} from './DerivativeCropTemplates';
export type { DerivativeCropCategory, DerivativeCropTemplate, NormalizedCropRegion } from './DerivativeCropTemplates';
export {
  DERIVATIVE_SLOT_DEFINITIONS,
  derivativeFolderPath,
  buildDerivativeRecordFromSlot,
  getDerivativeSlotDefinition,
  listDerivativeSlotsForProductLine,
} from './DerivativeAssetRegistry';
export type {
  DerivativeAssetId,
  DerivativeAssetRecord,
  DerivativeAssetStatus,
  DerivativeSlotDefinition,
  PhotographyProductLine,
} from './DerivativeAssetRegistry';
export {
  prepareDerivativesOnHeroApproval,
  prepareDerivativesForProduct,
  mergeDerivativeStores,
  derivativeStoreKey,
  getDerivativesForUnit,
  countPreparedDerivatives,
} from './PhotographyDerivativeEngine';
export type { PrepareDerivativesInput, DerivativeEngineResult } from './PhotographyDerivativeEngine';
export {
  DERIVATIVE_SITE_BINDINGS,
  getSiteBinding,
  getBindingsForDerivative,
  resolveDerivativeForSiteAsset,
  markDerivativeReplaced,
} from './DerivativeAssetReplacement';
export type { DerivativeSiteBinding, DerivativeAssetUri, WebsiteAssetSurface } from './DerivativeAssetReplacement';
export {
  PRODUCT_ASSET_FACTORY_POC_UNIT,
  PRODUCT_ASSET_FACTORY_STAGES,
  PRODUCT_ASSET_FACTORY_STAGE_LABELS,
  productAssetSupabasePath,
} from './ProductAssetFactory';
export type {
  ProductAssetFactoryStage,
  ProductAssetRegistryRecord,
  ProductAssetFactoryJobRecord,
  ProductAssetFactoryLogRecord,
} from './ProductAssetFactory';
export { FACTORY_CROP_TEMPLATES, FACTORY_POC_DERIVATIVE_OUTPUTS } from './FactoryCropTemplates';
export type { FactoryCropTemplate, FactoryCropAnchor } from './FactoryCropTemplates';

/** Inheritance payload for future StudioOS product creation. */
export function inheritPhotographyBibleForProduct(productSlug: string) {
  return {
    productSlug,
    photographyVersion: PHOTOGRAPHY_SYSTEM_VERSION,
    lockedSpecifications: PHOTOGRAPHY_LOCKED_SPECIFICATIONS,
    mediaKitRoot: `studio-os/product-photography/media-kits/signature-collection/${productSlug}`,
    exportTemplates: PHOTOGRAPHY_EXPORT_TEMPLATES,
    derivativeSlots: DERIVATIVE_SLOT_DEFINITIONS.length,
    inheritedFrom: 'Photography Bible V1.0',
  };
}
