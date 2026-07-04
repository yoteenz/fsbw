import { PHOTOGRAPHY_LOCKED_SPECIFICATIONS, PHOTOGRAPHY_SYSTEM_VERSION } from './PhotographySpecifications';
import { PHOTOGRAPHY_EXPORT_TEMPLATES } from './PhotographyTemplates';

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

/** Inheritance payload for future StudioOS product creation. */
export function inheritPhotographyBibleForProduct(productSlug: string) {
  return {
    productSlug,
    photographyVersion: PHOTOGRAPHY_SYSTEM_VERSION,
    lockedSpecifications: PHOTOGRAPHY_LOCKED_SPECIFICATIONS,
    mediaKitRoot: `studio-os/product-photography/media-kits/signature-collection/${productSlug}`,
    exportTemplates: PHOTOGRAPHY_EXPORT_TEMPLATES,
    inheritedFrom: 'Photography Bible V1.0',
  };
}
