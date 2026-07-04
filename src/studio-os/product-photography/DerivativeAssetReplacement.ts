/**
 * Asset replacement registry — maps website surfaces to derivative slots.
 * Future approved derivatives replace site assets without page code changes.
 */

import type { DerivativeAssetId } from './DerivativeAssetRegistry';
import type { DerivativeAssetRecord } from './DerivativeAssetRegistry';

export type WebsiteAssetSurface =
  | 'pdp'
  | 'wishlist'
  | 'cart'
  | 'search'
  | 'collection'
  | 'email'
  | 'desktop'
  | 'mobile'
  | 'studioos'
  | 'social'
  | 'marketing';

export type DerivativeSiteBinding = {
  id: string;
  label: string;
  surface: WebsiteAssetSurface;
  derivativeId: DerivativeAssetId;
  /** Stable key for future asset resolver — not a hardcoded file path. */
  assetKey: string;
  description: string;
};

/** Canonical bindings — storefront eventually resolves assetKey → derivative folder URI. */
export const DERIVATIVE_SITE_BINDINGS: readonly DerivativeSiteBinding[] = [
  { id: 'pdp-hero-master', label: 'PDP Hero Master', surface: 'pdp', derivativeId: 'product-page-crop', assetKey: 'unit.pdp.hero', description: 'Unit PDP primary hero image' },
  { id: 'unit-pdp-hero', label: 'Unit PDP Hero', surface: 'pdp', derivativeId: 'product-page-crop', assetKey: 'unit.pdp.heroImage', description: 'Alias for PDP hero derivative' },
  { id: 'shop-product-card', label: 'Shop Product Card', surface: 'collection', derivativeId: 'product-card-crop', assetKey: 'shop.productCard.thumb', description: 'Shop grid product card' },
  { id: 'collection-grid-thumb', label: 'Collection Grid', surface: 'collection', derivativeId: 'collection-grid-crop', assetKey: 'shop.collectionGrid.thumb', description: 'Signature Collection grid tile' },
  { id: 'shop-search-result', label: 'Search Result', surface: 'search', derivativeId: 'search-result-crop', assetKey: 'shop.search.resultThumb', description: 'Shop search result thumbnail' },
  { id: 'wishlist-row-thumb', label: 'Wishlist Row', surface: 'wishlist', derivativeId: 'wishlist-crop', assetKey: 'wishlist.row.thumb', description: 'Wishlist list row thumbnail' },
  { id: 'wishlist-mini-thumb', label: 'Mini Wishlist', surface: 'wishlist', derivativeId: 'mini-wishlist-crop', assetKey: 'wishlist.mini.thumb', description: 'Compact wishlist thumb' },
  { id: 'cart-dropdown-thumb', label: 'Cart Dropdown', surface: 'cart', derivativeId: 'cart-dropdown-crop', assetKey: 'cart.dropdown.lineThumb', description: 'Cart dropdown item thumb' },
  { id: 'email-signature-unit', label: 'Email Signature Unit', surface: 'email', derivativeId: 'email-crop', assetKey: 'email.signatureCollection.unit', description: 'Email Signature Collection hero' },
  { id: 'email-holographic-exhibit', label: 'Email Holographic Exhibit', surface: 'email', derivativeId: 'holographic-display-crop', assetKey: 'email.holographic.exhibit', description: 'Email acrylic exhibit mannequin' },
  { id: 'desktop-hero-module', label: 'Desktop Hero', surface: 'desktop', derivativeId: 'desktop-crop', assetKey: 'marketing.desktop.hero', description: 'Desktop hero band' },
  { id: 'mobile-pdp-hero', label: 'Mobile PDP Hero', surface: 'mobile', derivativeId: 'mobile-crop', assetKey: 'unit.mobile.pdpHero', description: 'Mobile PDP hero' },
  { id: 'studioos-admin-card', label: 'StudioOS Card', surface: 'studioos', derivativeId: 'studioos-crop', assetKey: 'studioos.admin.unitCard', description: 'StudioOS admin unit card' },
  { id: 'social-square-post', label: 'Social Square', surface: 'social', derivativeId: 'social-square', assetKey: 'social.square.post', description: 'Instagram square post' },
  { id: 'social-story-vertical', label: 'Story Portrait', surface: 'social', derivativeId: 'story-portrait', assetKey: 'social.story.vertical', description: 'Vertical story placement' },
  { id: 'global-thumb', label: 'Global Thumbnail', surface: 'marketing', derivativeId: 'thumbnail', assetKey: 'global.thumb.default', description: 'Default thumbnail surface' },
  { id: 'composite-transparent', label: 'Transparent Composite', surface: 'marketing', derivativeId: 'transparent-master', assetKey: 'composite.transparent.master', description: 'Transparent PNG for compositing' },
  { id: 'marketing-composite', label: 'Marketing Composite', surface: 'marketing', derivativeId: 'marketing-composite-placeholder', assetKey: 'marketing.composite.placeholder', description: 'Campaign composite placeholder' },
] as const;

export type DerivativeAssetUri = {
  assetKey: string;
  folderPath: string;
  derivativeId: DerivativeAssetId;
  status: DerivativeAssetRecord['status'];
  /** Null until generation pipeline ships — resolver returns folder path for now. */
  fileUri: string | null;
};

export function getSiteBinding(bindingId: string): DerivativeSiteBinding | undefined {
  return DERIVATIVE_SITE_BINDINGS.find((b) => b.id === bindingId);
}

export function getBindingsForDerivative(derivativeId: DerivativeAssetId): DerivativeSiteBinding[] {
  return DERIVATIVE_SITE_BINDINGS.filter((b) => b.derivativeId === derivativeId);
}

/**
 * Resolve which derivative folder should supply a website asset.
 * Returns null when hero not approved / derivatives not prepared.
 */
export function resolveDerivativeForSiteAsset(
  assetKey: string,
  derivatives: DerivativeAssetRecord[]
): DerivativeAssetUri | null {
  const binding = DERIVATIVE_SITE_BINDINGS.find((b) => b.assetKey === assetKey);
  if (!binding) return null;

  const record = derivatives.find((d) => d.id === binding.derivativeId);
  if (!record) return null;

  return {
    assetKey,
    folderPath: record.folderPath,
    derivativeId: record.id,
    status: record.status,
    fileUri: record.status === 'generated' || record.status === 'approved' || record.status === 'replaced'
      ? `${record.folderPath}/asset.png`
      : null,
  };
}

/** Mark derivative as replaced on site — future pipeline hook. */
export function markDerivativeReplaced(record: DerivativeAssetRecord): DerivativeAssetRecord {
  return {
    ...record,
    status: 'replaced',
    lastUpdated: new Date().toISOString().slice(0, 10),
  };
}
