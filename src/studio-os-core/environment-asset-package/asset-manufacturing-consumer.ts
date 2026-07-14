import type { EnvironmentPackageOutputKey } from './EnvironmentPackageOutputs';
import { getEnvironmentPackage } from './EnvironmentPackageRepository';

export type AssetManufacturingPackageInput = {
  packageId: string;
  assetKind: EnvironmentPackageOutputKey;
};

const ASSET_KIND_MAP: Partial<Record<EnvironmentPackageOutputKey, EnvironmentPackageOutputKey>> = {
  blueprint: 'blueprint',
  constructionPlan: 'constructionPlan',
  lightingProfile: 'lightingProfile',
  materialsProfile: 'materialsProfile',
};

/** Asset Manufacturing generators reference the same Environment Package outputs. */
export function resolveAssetManufacturingSource(input: AssetManufacturingPackageInput) {
  const pkg = getEnvironmentPackage(input.packageId);
  if (!pkg) return null;
  const outputKey = ASSET_KIND_MAP[input.assetKind] ?? input.assetKind;
  const output = pkg.outputs[outputKey];
  if (!output) return null;
  return {
    packageId: pkg.packageId,
    variantId: pkg.variantId,
    assetKind: input.assetKind,
    status: output.status,
    revision: pkg.revision,
    url: output.url,
    summary: `${pkg.variantName} ${input.assetKind}`,
    environmentRevision: pkg.revision,
    promptVersion: pkg.promptVersion,
    seed: pkg.seed,
  };
}

export function blueprintGeneratorSource(ref: { packageId: string }) {
  return resolveAssetManufacturingSource({ packageId: ref.packageId, assetKind: 'blueprint' });
}

export function constructionGeneratorSource(ref: { packageId: string }) {
  return resolveAssetManufacturingSource({ packageId: ref.packageId, assetKind: 'constructionPlan' });
}

export function lightingGeneratorSource(ref: { packageId: string }) {
  return resolveAssetManufacturingSource({ packageId: ref.packageId, assetKind: 'lightingProfile' });
}

export function materialsGeneratorSource(ref: { packageId: string }) {
  return resolveAssetManufacturingSource({ packageId: ref.packageId, assetKind: 'materialsProfile' });
}

export function heroGeneratorSource(ref: { packageId: string }) {
  return resolveAssetManufacturingSource({ packageId: ref.packageId, assetKind: 'heroLandscape' });
}

export function thumbnailGeneratorSource(ref: { packageId: string }) {
  return resolveAssetManufacturingSource({ packageId: ref.packageId, assetKind: 'squareThumbnail' });
}
