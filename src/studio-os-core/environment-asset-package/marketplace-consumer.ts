/** Marketplace consumes Environment Packages — not individual images. Architecture only. */
import type { EnvironmentAssetPackage } from './EnvironmentAssetPackage';
import { getEnvironmentPackage } from './EnvironmentPackageRepository';

export type MarketplacePackageListing = {
  listingId: string;
  packageId: string;
  title: string;
  theme: string;
  status: 'draft' | 'published' | 'archived';
  priceUsd: number | null;
};

export function resolveMarketplaceListingFromPackage(
  packageId: string,
  title: string
): MarketplacePackageListing | null {
  const pkg = getEnvironmentPackage(packageId);
  if (!pkg) return null;
  return {
    listingId: `listing.${packageId}`,
    packageId: pkg.packageId,
    title,
    theme: pkg.theme,
    status: pkg.marketplaceReady ? 'published' : 'draft',
    priceUsd: null,
  };
}

export function marketplaceReferencesPackage(pkg: EnvironmentAssetPackage): boolean {
  return Boolean(pkg.packageId && pkg.variantId);
}
