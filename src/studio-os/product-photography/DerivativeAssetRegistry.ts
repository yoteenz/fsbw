/**
 * Derivative asset slot registry — maps derivative IDs to crop templates and storage paths.
 */

import type { DerivativeCropTemplate, NormalizedCropRegion } from './DerivativeCropTemplates';
import { getCropTemplate } from './DerivativeCropTemplates';

export type PhotographyProductLine =
  | 'signature-collection'
  | 'bundles'
  | 'closures'
  | 'frontals'
  | 'accessories';

export type DerivativeAssetId =
  | 'hero-portrait'
  | 'transparent-master'
  | 'wishlist-crop'
  | 'mini-wishlist-crop'
  | 'cart-dropdown-crop'
  | 'product-card-crop'
  | 'product-page-crop'
  | 'collection-grid-crop'
  | 'search-result-crop'
  | 'email-crop'
  | 'desktop-crop'
  | 'mobile-crop'
  | 'studioos-crop'
  | 'social-square'
  | 'story-portrait'
  | 'thumbnail'
  | 'holographic-display-crop'
  | 'marketing-composite-placeholder';

export type DerivativeAssetStatus =
  | 'slot-prepared'
  | 'pending-generation'
  | 'generated'
  | 'approved'
  | 'replaced';

export type DerivativeSlotDefinition = {
  id: DerivativeAssetId;
  name: string;
  purpose: string;
  cropTemplateId: string;
  siteBindingIds: string[];
};

export type DerivativeAssetRecord = {
  id: DerivativeAssetId;
  name: string;
  purpose: string;
  dimensions: { width: number; height: number };
  aspectRatio: string;
  cropCoordinates: NormalizedCropRegion;
  cropTemplateId: string;
  version: string;
  status: DerivativeAssetStatus;
  generatedDate: string | null;
  lastUpdated: string;
  folderPath: string;
  productLine: PhotographyProductLine;
  unitSlug: string;
  siteBindingIds: string[];
};

const DERIVATIVES_ROOT = 'studio-os/product-photography/derivatives';

export const DERIVATIVE_SLOT_DEFINITIONS: readonly DerivativeSlotDefinition[] = [
  {
    id: 'hero-portrait',
    name: 'Hero Portrait',
    purpose: 'Approved master hero — ecosystem source of truth',
    cropTemplateId: 'master-hero-full',
    siteBindingIds: ['pdp-hero-master'],
  },
  {
    id: 'transparent-master',
    name: 'Transparent Master',
    purpose: 'Transparent PNG cutout from approved hero',
    cropTemplateId: 'master-transparent-full',
    siteBindingIds: ['composite-transparent'],
  },
  {
    id: 'wishlist-crop',
    name: 'Wishlist Crop',
    purpose: 'Wishlist surfaces',
    cropTemplateId: 'wishlist-standard',
    siteBindingIds: ['wishlist-row-thumb'],
  },
  {
    id: 'mini-wishlist-crop',
    name: 'Mini Wishlist Crop',
    purpose: 'Compact wishlist chips',
    cropTemplateId: 'wishlist-mini',
    siteBindingIds: ['wishlist-mini-thumb'],
  },
  {
    id: 'cart-dropdown-crop',
    name: 'Cart Dropdown Crop',
    purpose: 'Cart dropdown line items',
    cropTemplateId: 'cart-dropdown',
    siteBindingIds: ['cart-dropdown-thumb'],
  },
  {
    id: 'product-card-crop',
    name: 'Product Card Crop',
    purpose: 'Shop and collection product cards',
    cropTemplateId: 'product-card',
    siteBindingIds: ['shop-product-card'],
  },
  {
    id: 'product-page-crop',
    name: 'Product Page Crop',
    purpose: 'Unit PDP primary imagery',
    cropTemplateId: 'product-page',
    siteBindingIds: ['unit-pdp-hero'],
  },
  {
    id: 'collection-grid-crop',
    name: 'Collection Grid Crop',
    purpose: 'Signature Collection grids',
    cropTemplateId: 'collection-grid',
    siteBindingIds: ['collection-grid-thumb'],
  },
  {
    id: 'search-result-crop',
    name: 'Search Result Crop',
    purpose: 'Shop search results',
    cropTemplateId: 'search-result',
    siteBindingIds: ['shop-search-result'],
  },
  {
    id: 'email-crop',
    name: 'Email Crop',
    purpose: 'Email Signature Collection and promos',
    cropTemplateId: 'email-signature',
    siteBindingIds: ['email-signature-unit'],
  },
  {
    id: 'desktop-crop',
    name: 'Desktop Crop',
    purpose: 'Desktop hero modules',
    cropTemplateId: 'desktop-hero',
    siteBindingIds: ['desktop-hero-module'],
  },
  {
    id: 'mobile-crop',
    name: 'Mobile Crop',
    purpose: 'Mobile PDP and shop',
    cropTemplateId: 'mobile-pdp',
    siteBindingIds: ['mobile-pdp-hero'],
  },
  {
    id: 'studioos-crop',
    name: 'studio os Crop',
    purpose: 'studio os admin previews',
    cropTemplateId: 'studioos-preview',
    siteBindingIds: ['studioos-admin-card'],
  },
  {
    id: 'social-square',
    name: 'Social Square',
    purpose: 'Paid social and Instagram square',
    cropTemplateId: 'social-square',
    siteBindingIds: ['social-square-post'],
  },
  {
    id: 'story-portrait',
    name: 'Story Portrait',
    purpose: 'Stories and vertical social',
    cropTemplateId: 'story-portrait',
    siteBindingIds: ['social-story-vertical'],
  },
  {
    id: 'thumbnail',
    name: 'Thumbnail',
    purpose: 'Global thumbnail surfaces',
    cropTemplateId: 'thumbnail-standard',
    siteBindingIds: ['global-thumb'],
  },
  {
    id: 'holographic-display-crop',
    name: 'Holographic Display Crop',
    purpose: 'Email acrylic / holographic exhibits',
    cropTemplateId: 'holographic-display',
    siteBindingIds: ['email-holographic-exhibit'],
  },
  {
    id: 'marketing-composite-placeholder',
    name: 'Marketing Composite Placeholder',
    purpose: 'Reserved campaign composite slot',
    cropTemplateId: 'marketing-composite-slot',
    siteBindingIds: ['marketing-composite'],
  },
] as const;

export function derivativeFolderPath(
  productLine: PhotographyProductLine,
  unitSlug: string,
  derivativeId: DerivativeAssetId
): string {
  return `${DERIVATIVES_ROOT}/${productLine}/${unitSlug}/${derivativeId}`;
}

export function buildDerivativeRecordFromSlot(
  slot: DerivativeSlotDefinition,
  template: DerivativeCropTemplate,
  input: {
    productLine: PhotographyProductLine;
    unitSlug: string;
    version: string;
    lastUpdated: string;
  }
): DerivativeAssetRecord {
  return {
    id: slot.id,
    name: slot.name,
    purpose: slot.purpose,
    dimensions: { width: template.outputWidth, height: template.outputHeight },
    aspectRatio: template.aspectRatio,
    cropCoordinates: { ...template.cropRegion },
    cropTemplateId: template.id,
    version: input.version,
    status: 'slot-prepared',
    generatedDate: null,
    lastUpdated: input.lastUpdated,
    folderPath: derivativeFolderPath(input.productLine, input.unitSlug, slot.id),
    productLine: input.productLine,
    unitSlug: input.unitSlug,
    siteBindingIds: [...slot.siteBindingIds],
  };
}

export function getDerivativeSlotDefinition(id: DerivativeAssetId): DerivativeSlotDefinition | undefined {
  return DERIVATIVE_SLOT_DEFINITIONS.find((s) => s.id === id);
}

export function listDerivativeSlotsForProductLine(_productLine: PhotographyProductLine): readonly DerivativeSlotDefinition[] {
  return DERIVATIVE_SLOT_DEFINITIONS;
}

export function assertCropTemplateForSlot(slot: DerivativeSlotDefinition): DerivativeCropTemplate {
  const template = getCropTemplate(slot.cropTemplateId);
  if (!template) {
    throw new Error(`Missing crop template: ${slot.cropTemplateId} for derivative ${slot.id}`);
  }
  return template;
}
