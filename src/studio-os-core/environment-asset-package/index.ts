/** Re-exports canonical Environment Asset Package types and helpers. */
export * from './EnvironmentAssetPackage';
export * from './EnvironmentPackageOutputs';
export * from './EnvironmentPackageRepository';
export * from './EnvironmentPackageService';
export * from './EnvironmentPackageGenerationService';
export * from './EnvironmentPackageCache';
export * from './EnvironmentPackageGenerationQueue';
export * from './EnvironmentPackageStatus';
export * from './EnvironmentPackageConsistencyValidator';
export * from './environment-package-feature-flags';
export * from './ProductionReadinessGate';
export * from './ProductionReadinessRepository';
export * from './ProductionReadinessService';

export {
  resolveCdsEnvironmentBinding,
  resolveCdsEnvironmentPlateUrl,
  resolveCdsPackageAccess,
  type CdsEnvironmentPackageBinding,
  type CdsPackageAccessResult,
} from './cds-consumer';

export {
  resolveAssetManufacturingSource,
  assertAssetManufacturingAccess,
  blueprintGeneratorSource,
  constructionGeneratorSource,
  lightingGeneratorSource,
  materialsGeneratorSource,
  heroGeneratorSource,
  thumbnailGeneratorSource,
  type AssetManufacturingPackageInput,
  type AssetManufacturingAccessResult,
} from './asset-manufacturing-consumer';

export {
  resolveMarketplaceListingFromPackage,
  assertMarketplacePackageAccess,
  marketplaceReferencesPackage,
  type MarketplacePackageListing,
  type MarketplaceAccessResult,
} from './marketplace-consumer';
