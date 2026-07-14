import type { EnvironmentPackageConsumerRef, EnvironmentProductionAssetKind } from './types';
import { getEnvironmentPackage } from './package-registry';
import { resolvePackageVariant } from './package-resolver';

export type AssetManufacturingPackageInput = {
  packageId: string;
  variantId: string;
  assetKind: EnvironmentProductionAssetKind;
};

/** Asset Manufacturing generators reference the same Environment Package outputs. */
export function resolveAssetManufacturingSource(input: AssetManufacturingPackageInput) {
  const pkg = getEnvironmentPackage(input.packageId);
  if (!pkg) return null;
  const variant = resolvePackageVariant(pkg, input.variantId);
  if (!variant) return null;
  const asset = variant.productionAssets.find((a) => a.kind === input.assetKind);
  if (!asset) return null;
  return {
    packageId: pkg.packageId,
    variantId: variant.id,
    assetKind: input.assetKind,
    status: asset.status,
    revision: asset.revision,
    url: asset.url,
    summary: asset.summary,
    environmentRevision: pkg.metadata.revision,
    promptVersion: pkg.metadata.promptVersion,
    seed: variant.seed,
  };
}

export function blueprintGeneratorSource(ref: EnvironmentPackageConsumerRef) {
  return resolveAssetManufacturingSource({
    packageId: ref.packageId,
    variantId: ref.variantId ?? 'light-01',
    assetKind: 'blueprint',
  });
}

export function constructionGeneratorSource(ref: EnvironmentPackageConsumerRef) {
  return resolveAssetManufacturingSource({
    packageId: ref.packageId,
    variantId: ref.variantId ?? 'light-01',
    assetKind: 'construction-plan',
  });
}

export function lightingGeneratorSource(ref: EnvironmentPackageConsumerRef) {
  return resolveAssetManufacturingSource({
    packageId: ref.packageId,
    variantId: ref.variantId ?? 'light-01',
    assetKind: 'lighting-profile',
  });
}

export function materialsGeneratorSource(ref: EnvironmentPackageConsumerRef) {
  return resolveAssetManufacturingSource({
    packageId: ref.packageId,
    variantId: ref.variantId ?? 'light-01',
    assetKind: 'materials-profile',
  });
}
