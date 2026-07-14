import type { EnvironmentPackageConsumerRef, EnvironmentVariantId } from './types';
import { getEnvironmentPackage } from './package-registry';
import { resolveVariantOutputUrl, resolvePackageVariant } from './package-resolver';

/** Creative Director Studio consumes Environment Package IDs — never loose image URLs. */
export type CdsEnvironmentPackageBinding = {
  packageId: string;
  variantId: EnvironmentVariantId;
  sceneStackLayer: 'environment-shell';
  referenceOnly: true;
};

export function resolveCdsEnvironmentBinding(ref: EnvironmentPackageConsumerRef): CdsEnvironmentPackageBinding | null {
  const pkg = getEnvironmentPackage(ref.packageId);
  if (!pkg || !ref.variantId) return null;
  const variant = resolvePackageVariant(pkg, ref.variantId);
  if (!variant) return null;
  return {
    packageId: pkg.packageId,
    variantId: variant.id,
    sceneStackLayer: 'environment-shell',
    referenceOnly: true,
  };
}

export function resolveCdsEnvironmentPlateUrl(ref: EnvironmentPackageConsumerRef): string | null {
  const pkg = getEnvironmentPackage(ref.packageId);
  if (!pkg || !ref.variantId) return null;
  const variant = resolvePackageVariant(pkg, ref.variantId);
  if (!variant) return null;
  return resolveVariantOutputUrl(variant, ref.outputFormatId ?? 'hero-landscape');
}
