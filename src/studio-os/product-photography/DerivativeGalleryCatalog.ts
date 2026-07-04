/**
 * Canonical derivative gallery slots — keep FACTORY_POC_DERIVATIVE_OUTPUTS in sync (client + api/_lib).
 */

export type DerivativeGallerySlotDef = {
  assetType: string;
  label: string;
  templateId: string;
  fileName: string;
  /** Slot reserved for future composite / hologram workflows. */
  placeholder?: boolean;
};

/** Every tile shown in Asset Factory Derivative Gallery (SOFT WAVE POC). */
export const DERIVATIVE_GALLERY_SLOTS: readonly DerivativeGallerySlotDef[] = [
  { assetType: 'wishlist', label: 'Wishlist', templateId: 'wishlist-standard', fileName: 'wishlist.png' },
  { assetType: 'mini-wishlist', label: 'Mini Wishlist', templateId: 'mini-wishlist', fileName: 'mini-wishlist.png' },
  { assetType: 'cart', label: 'Cart Dropdown', templateId: 'cart-dropdown', fileName: 'cart.png' },
  { assetType: 'checkout', label: 'Checkout', templateId: 'product-page', fileName: 'checkout.png' },
  { assetType: 'order-summary', label: 'Order Summary', templateId: 'order-summary', fileName: 'order-summary.png' },
  { assetType: 'product-card', label: 'Product Card', templateId: 'product-card', fileName: 'product-card.png' },
  { assetType: 'product-page', label: 'Product Page', templateId: 'product-page', fileName: 'product-page.png' },
  { assetType: 'collection-grid', label: 'Collection Grid', templateId: 'collection-grid', fileName: 'collection-grid.png' },
  { assetType: 'search-result', label: 'Search Result', templateId: 'search-result', fileName: 'search-result.png' },
  { assetType: 'email', label: 'Email', templateId: 'email-signature', fileName: 'email.png' },
  { assetType: 'desktop', label: 'Desktop', templateId: 'desktop-hero', fileName: 'desktop.png' },
  { assetType: 'mobile', label: 'Mobile', templateId: 'mobile-pdp', fileName: 'mobile.png' },
  { assetType: 'studio-preview', label: 'studio os Preview', templateId: 'studioos-preview', fileName: 'studio-preview.png' },
  { assetType: 'thumbnail', label: 'Thumbnail', templateId: 'thumbnail-standard', fileName: 'thumbnail.png' },
  {
    assetType: 'marketing-composite',
    label: 'Marketing Composite Placeholder',
    templateId: 'marketing-composite',
    fileName: 'marketing-composite.png',
    placeholder: true,
  },
  {
    assetType: 'holographic-display',
    label: 'Holographic Display',
    templateId: 'holographic-display',
    fileName: 'holographic-display.png',
    placeholder: true,
  },
] as const;

export const FACTORY_POC_DERIVATIVE_OUTPUTS = DERIVATIVE_GALLERY_SLOTS.map((s) => ({
  assetType: s.assetType,
  templateId: s.templateId,
  fileName: s.fileName,
}));

export type DerivativeGalleryFilter =
  | 'all'
  | 'pending'
  | 'generated'
  | 'needs-review'
  | 'approved'
  | 'published'
  | 'failed';

export type DerivativeGalleryItemStatus =
  | 'pending'
  | 'generated'
  | 'needs-review'
  | 'approved'
  | 'published'
  | 'failed';

export type DerivativeGalleryItem = {
  slot: DerivativeGallerySlotDef;
  templateLabel: string;
  dimensions: { width: number; height: number };
  aspectRatio: string;
  transparency: boolean;
  version: string;
  status: DerivativeGalleryItemStatus;
  registryStatus: string;
  supabaseStatus: 'uploaded' | 'missing' | 'failed';
  previewSrc?: string;
  supabaseUrl?: string;
  storagePath?: string;
  lastUpdated?: string;
  registryId?: string;
};

export function derivativeGallerySlotByType(assetType: string): DerivativeGallerySlotDef | undefined {
  return DERIVATIVE_GALLERY_SLOTS.find((s) => s.assetType === assetType);
}
