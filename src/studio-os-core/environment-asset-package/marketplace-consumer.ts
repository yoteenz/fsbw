/** Marketplace consumes Environment Packages — not individual images. Architecture only. */
import type { EnvironmentAssetPackage } from './EnvironmentAssetPackage';
import { getEnvironmentPackage } from './EnvironmentPackageRepository';
import { assertPackageProductionCompleteForMarketplace } from './ProductionReadinessService';

export type MarketplacePackageListing = {
  listingId: string;
  packageId: string;
  title: string;
  theme: string;
  status: 'draft' | 'published' | 'archived';
  priceUsd: number | null;
};

export type MarketplaceAccessResult =
  | { ok: true; listing: MarketplacePackageListing }
  | { ok: false; code: string; message: string };

export function assertMarketplacePackageAccess(packageId: string): MarketplaceAccessResult {
  const gate = assertPackageProductionCompleteForMarketplace(packageId);
  if (!gate.ok) {
    return { ok: false, code: gate.code ?? 'NOT_PRODUCTION_COMPLETE', message: gate.message ?? 'Package not production complete' };
  }
  const pkg = getEnvironmentPackage(packageId);
  if (!pkg) {
    return { ok: false, code: 'PACKAGE_NOT_FOUND', message: 'Package not found' };
  }
  const listing = resolveMarketplaceListingFromPackageUnchecked(pkg, `${pkg.environmentId} Pack`);
  if (!listing) {
    return { ok: false, code: 'LISTING_FAILED', message: 'Could not build listing' };
  }
  return { ok: true, listing };
}

function resolveMarketplaceListingFromPackageUnchecked(
  pkg: EnvironmentAssetPackage,
  title: string
): MarketplacePackageListing | null {
  return {
    listingId: `listing.${pkg.packageId}`,
    packageId: pkg.packageId,
    title,
    theme: pkg.theme,
    status: pkg.marketplaceReady ? 'published' : 'draft',
    priceUsd: null,
  };
}

export function resolveMarketplaceListingFromPackage(
  packageId: string,
  title: string
): MarketplacePackageListing | null {
  const access = assertMarketplacePackageAccess(packageId);
  if (!access.ok) return null;
  return { ...access.listing, title };
}

export function marketplaceReferencesPackage(pkg: EnvironmentAssetPackage): boolean {
  return Boolean(pkg.packageId && pkg.variantId);
}
