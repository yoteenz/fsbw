function envFlag(key: string, defaultValue = true): boolean {
  try {
    const raw = import.meta.env[key];
    if (raw === 'true' || raw === '1') return true;
    if (raw === 'false' || raw === '0') return false;
  } catch {
    /* ignore */
  }
  return defaultValue;
}

export type EnvironmentPackageFeatureFlags = {
  enableEnvironmentPackages: boolean;
  enablePackageGeneration: boolean;
  enablePackageCache: boolean;
  enablePackagePersistence: boolean;
  enablePackageProductionGeneration: boolean;
  enablePackageCdsHandoff: boolean;
  enablePackageCanonicalPromotion: boolean;
};

/** Client flags — production generation and canonical promotion default OFF until verified. */
export function resolveEnvironmentPackageFeatureFlags(): EnvironmentPackageFeatureFlags {
  return {
    enableEnvironmentPackages: envFlag('VITE_ENABLE_ENVIRONMENT_PACKAGES', true),
    enablePackageGeneration: envFlag('VITE_ENABLE_PACKAGE_GENERATION', false),
    enablePackageCache: envFlag('VITE_ENABLE_PACKAGE_CACHE', true),
    enablePackagePersistence: envFlag('VITE_ENABLE_PACKAGE_PERSISTENCE', true),
    enablePackageProductionGeneration: envFlag('VITE_ENABLE_PACKAGE_PRODUCTION_GENERATION', false),
    enablePackageCdsHandoff: envFlag('VITE_ENABLE_PACKAGE_CDS_HANDOFF', false),
    enablePackageCanonicalPromotion: envFlag('VITE_ENABLE_PACKAGE_CANONICAL_PROMOTION', false),
  };
}

/** Production must not use in-memory repository when persistence is enabled. */
export function isEnvironmentPackageInMemoryOnly(): boolean {
  if (typeof process !== 'undefined' && process.env?.VITEST === 'true') return true;
  const flags = resolveEnvironmentPackageFeatureFlags();
  return !flags.enablePackagePersistence;
}
