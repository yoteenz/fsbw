/**
 * Factory crop templates — extends Photography Bible derivative templates with production fields.
 * Coordinates are normalized on master — never hardcoded per product.
 */

export type FactoryCropAnchor = 'center' | 'top' | 'attention';

export type FactoryCropTemplate = {
  id: string;
  label: string;
  aspectRatio: string;
  outputWidth: number;
  outputHeight: number;
  cropRegion: { x: number; y: number; width: number; height: number };
  cropAnchor: FactoryCropAnchor;
  padding: number;
  scale: number;
  transparency: boolean;
  exportFormat: 'png' | 'webp';
};

/** POC derivative outputs for Milestone — maps to Supabase filenames. */
export const FACTORY_POC_DERIVATIVE_OUTPUTS: Array<{
  assetType: string;
  templateId: string;
  fileName: string;
}> = [
  { assetType: 'wishlist', templateId: 'wishlist-standard', fileName: 'wishlist.png' },
  { assetType: 'cart', templateId: 'cart-dropdown', fileName: 'cart.png' },
  { assetType: 'checkout', templateId: 'product-page', fileName: 'checkout.png' },
  { assetType: 'product-card', templateId: 'product-card', fileName: 'product-card.png' },
  { assetType: 'product-page', templateId: 'product-page', fileName: 'product-page.png' },
  { assetType: 'collection-grid', templateId: 'collection-grid', fileName: 'collection-grid.png' },
  { assetType: 'search-result', templateId: 'search-result', fileName: 'search-result.png' },
  { assetType: 'email', templateId: 'email-signature', fileName: 'email.png' },
  { assetType: 'desktop', templateId: 'desktop-hero', fileName: 'desktop.png' },
  { assetType: 'mobile', templateId: 'mobile-pdp', fileName: 'mobile.png' },
  { assetType: 'studio-preview', templateId: 'studioos-preview', fileName: 'studio-preview.png' },
  { assetType: 'thumbnail', templateId: 'thumbnail-standard', fileName: 'thumbnail.png' },
];

const FULL = { x: 0, y: 0, width: 1, height: 1 };
const BUST_CENTER = { x: 0.14, y: 0.04, width: 0.72, height: 0.82 };
const BUST_TIGHT = { x: 0.2, y: 0.06, width: 0.6, height: 0.78 };

export const FACTORY_CROP_TEMPLATES: readonly FactoryCropTemplate[] = [
  { id: 'master-hero-full', label: 'Master Hero', aspectRatio: '1:1', outputWidth: 4096, outputHeight: 4096, cropRegion: FULL, cropAnchor: 'center', padding: 0, scale: 1, transparency: false, exportFormat: 'png' },
  { id: 'master-transparent-full', label: 'Transparent Master', aspectRatio: '1:1', outputWidth: 4096, outputHeight: 4096, cropRegion: FULL, cropAnchor: 'center', padding: 0, scale: 1, transparency: true, exportFormat: 'png' },
  { id: 'wishlist-standard', label: 'Wishlist', aspectRatio: '10:13', outputWidth: 400, outputHeight: 520, cropRegion: BUST_CENTER, cropAnchor: 'top', padding: 0.02, scale: 1, transparency: true, exportFormat: 'png' },
  { id: 'cart-dropdown', label: 'Cart', aspectRatio: '3:4', outputWidth: 96, outputHeight: 128, cropRegion: BUST_TIGHT, cropAnchor: 'top', padding: 0.02, scale: 1, transparency: true, exportFormat: 'png' },
  { id: 'product-card', label: 'Product Card', aspectRatio: '1:1', outputWidth: 600, outputHeight: 600, cropRegion: BUST_CENTER, cropAnchor: 'center', padding: 0.03, scale: 1, transparency: true, exportFormat: 'png' },
  { id: 'product-page', label: 'Product Page', aspectRatio: '1:1', outputWidth: 1200, outputHeight: 1200, cropRegion: BUST_CENTER, cropAnchor: 'center', padding: 0.02, scale: 1, transparency: true, exportFormat: 'png' },
  { id: 'collection-grid', label: 'Collection Grid', aspectRatio: '1:1', outputWidth: 800, outputHeight: 800, cropRegion: BUST_CENTER, cropAnchor: 'center', padding: 0.02, scale: 1, transparency: true, exportFormat: 'png' },
  { id: 'search-result', label: 'Search Result', aspectRatio: '1:1', outputWidth: 320, outputHeight: 320, cropRegion: BUST_TIGHT, cropAnchor: 'center', padding: 0.02, scale: 1, transparency: true, exportFormat: 'png' },
  { id: 'email-signature', label: 'Email', aspectRatio: '1:1', outputWidth: 800, outputHeight: 800, cropRegion: BUST_CENTER, cropAnchor: 'center', padding: 0.02, scale: 1, transparency: true, exportFormat: 'png' },
  { id: 'desktop-hero', label: 'Desktop', aspectRatio: '1:1', outputWidth: 1600, outputHeight: 1600, cropRegion: BUST_CENTER, cropAnchor: 'center', padding: 0.02, scale: 1, transparency: true, exportFormat: 'png' },
  { id: 'mobile-pdp', label: 'Mobile', aspectRatio: '1:1', outputWidth: 600, outputHeight: 600, cropRegion: BUST_CENTER, cropAnchor: 'center', padding: 0.02, scale: 1, transparency: true, exportFormat: 'png' },
  { id: 'studioos-preview', label: 'StudioOS Preview', aspectRatio: '1:1', outputWidth: 400, outputHeight: 400, cropRegion: BUST_TIGHT, cropAnchor: 'center', padding: 0.02, scale: 1, transparency: true, exportFormat: 'png' },
  { id: 'thumbnail-standard', label: 'Thumbnail', aspectRatio: '1:1', outputWidth: 200, outputHeight: 200, cropRegion: BUST_TIGHT, cropAnchor: 'center', padding: 0.02, scale: 1, transparency: true, exportFormat: 'png' },
];

export function getFactoryCropTemplate(id: string): FactoryCropTemplate | undefined {
  return FACTORY_CROP_TEMPLATES.find((t) => t.id === id);
}
