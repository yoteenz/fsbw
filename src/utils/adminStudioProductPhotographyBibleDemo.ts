/** Product Photography Bible — admin demo state (Milestone 20.5). */

import {
  PHOTOGRAPHY_INHERITANCE_FIELDS,
  PHOTOGRAPHY_LOCKED_SPECIFICATIONS,
  PHOTOGRAPHY_SYSTEM_V1_DETAIL,
  PHOTOGRAPHY_VERSION_HISTORY,
  SIGNATURE_COLLECTION_UNITS,
  MEDIA_KIT_ASSET_SLOTS,
  PHOTOGRAPHY_EXPORT_TEMPLATES,
  type PhotographyVersionRecord,
} from '../studio-os/product-photography';

export const PHOTOGRAPHY_BIBLE_SUBTITLE =
  'OFFICIAL SOURCE OF TRUTH FOR ALL FRONTAL SLAYER PRODUCT PHOTOGRAPHY — SIGNATURE COLLECTION & FUTURE PRODUCTS.';

export const BRAND_ASSETS_HUB_SUBTITLE =
  'BRAND ASSETS COMMAND · PHOTOGRAPHY BIBLE · ASSET FACTORY · MEDIA KITS.';

export type PhotographyBibleTabId =
  | 'overview'
  | 'display-mannequin'
  | 'camera-system'
  | 'composition'
  | 'lighting'
  | 'background'
  | 'color-science'
  | 'media-kits'
  | 'exports'
  | 'templates'
  | 'version-history'
  | 'derivatives'
  | 'creative-dna';

export const PHOTOGRAPHY_BIBLE_TABS: Array<{ id: PhotographyBibleTabId; label: string }> = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'display-mannequin', label: 'DISPLAY MANNEQUIN' },
  { id: 'camera-system', label: 'CAMERA SYSTEM' },
  { id: 'composition', label: 'COMPOSITION' },
  { id: 'lighting', label: 'LIGHTING' },
  { id: 'background', label: 'BACKGROUND' },
  { id: 'color-science', label: 'COLOR SCIENCE' },
  { id: 'media-kits', label: 'MEDIA KITS' },
  { id: 'exports', label: 'EXPORTS' },
  { id: 'templates', label: 'TEMPLATES' },
  { id: 'derivatives', label: 'DERIVATIVES' },
  { id: 'creative-dna', label: 'CREATIVE DNA' },
  { id: 'version-history', label: 'VERSION HISTORY' },
];

export type PhotographyStatus = 'draft' | 'reference' | 'approved' | 'pending-review';
export type MediaKitStatus = 'empty' | 'partial' | 'complete';

export type SignatureUnitPhotographyRecord = {
  slug: string;
  collectionNo: string;
  label: string;
  heroPortraitSrc: string;
  referenceImageSrc: string;
  photographyStatus: PhotographyStatus;
  mediaKitStatus: MediaKitStatus;
  version: string;
  lastUpdated: string;
};

export const PHOTOGRAPHY_BIBLE_INHERITANCE_CHAIN = [
  'PHOTOGRAPHY BIBLE V1.0',
  'CREATIVE DNA V1.0',
  'SIGNATURE COLLECTION',
  'MEDIA KIT',
  'EXPORT TEMPLATES',
  'ASSET FACTORY',
  'STUDIOOS PRODUCT',
] as const;

function defaultUnitRecord(
  unit: (typeof SIGNATURE_COLLECTION_UNITS)[number]
): SignatureUnitPhotographyRecord {
  return {
    slug: unit.slug,
    collectionNo: unit.collectionNo,
    label: unit.label,
    heroPortraitSrc: unit.referenceImageSrc,
    referenceImageSrc: unit.referenceImageSrc,
    photographyStatus: 'reference',
    mediaKitStatus: 'empty',
    version: '1.0',
    lastUpdated: '2026-07-04',
  };
}

export const PHOTOGRAPHY_BIBLE_DEFAULT_UNITS: SignatureUnitPhotographyRecord[] =
  SIGNATURE_COLLECTION_UNITS.map(defaultUnitRecord);

export const PHOTOGRAPHY_STATUS_LABELS: Record<PhotographyStatus, string> = {
  draft: 'DRAFT',
  reference: 'REFERENCE ON FILE',
  approved: 'APPROVED',
  'pending-review': 'PENDING REVIEW',
};

export const MEDIA_KIT_STATUS_LABELS: Record<MediaKitStatus, string> = {
  empty: 'EMPTY — FOLDERS PREPARED',
  partial: 'PARTIAL',
  complete: 'COMPLETE',
};

export function getPhotographyTabBody(tabId: PhotographyBibleTabId): string {
  switch (tabId) {
    case 'overview':
      return 'Photography System V1.0 — immutable baseline. All Signature units inherit locked specifications.';
    case 'display-mannequin':
      return PHOTOGRAPHY_SYSTEM_V1_DETAIL.displayMannequin;
    case 'camera-system':
      return PHOTOGRAPHY_SYSTEM_V1_DETAIL.cameraSystem;
    case 'composition':
      return PHOTOGRAPHY_SYSTEM_V1_DETAIL.composition;
    case 'lighting':
      return PHOTOGRAPHY_SYSTEM_V1_DETAIL.lighting;
    case 'background':
      return PHOTOGRAPHY_SYSTEM_V1_DETAIL.background;
    case 'color-science':
      return PHOTOGRAPHY_SYSTEM_V1_DETAIL.colorScience;
    case 'media-kits':
      return `${MEDIA_KIT_ASSET_SLOTS.length} asset slots per unit · folders prepared under studio-os/product-photography/media-kits/`;
    case 'exports':
      return PHOTOGRAPHY_SYSTEM_V1_DETAIL.exports;
    case 'templates':
      return `${PHOTOGRAPHY_EXPORT_TEMPLATES.length} export templates locked to V1.0.`;
    case 'derivatives':
      return 'Photography Derivative Engine — 18 derivative slots per approved hero · reusable crop templates · site asset bindings · no image processing in Milestone 21.';
    case 'creative-dna':
      return 'Creative DNA v1.0 — permanent Frontal Slayer product photography standard · approved prompt v2.0 · Display Bust v1.0 · SOFT WAVE benchmark · locked specs · generation package architecture.';
    case 'version-history':
      return PHOTOGRAPHY_VERSION_HISTORY.map((v: PhotographyVersionRecord) => `${v.label} (${v.status})`).join(' · ');
    default:
      return '';
  }
}

export {
  PHOTOGRAPHY_LOCKED_SPECIFICATIONS,
  PHOTOGRAPHY_INHERITANCE_FIELDS,
  PHOTOGRAPHY_EXPORT_TEMPLATES,
  MEDIA_KIT_ASSET_SLOTS,
  PHOTOGRAPHY_VERSION_HISTORY,
};
