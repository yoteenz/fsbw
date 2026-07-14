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
};

/** Default ON per sprint spec. */
export function resolveEnvironmentPackageFeatureFlags(): EnvironmentPackageFeatureFlags {
  return {
    enableEnvironmentPackages: envFlag('VITE_ENABLE_ENVIRONMENT_PACKAGES', true),
    enablePackageGeneration: envFlag('VITE_ENABLE_PACKAGE_GENERATION', true),
    enablePackageCache: envFlag('VITE_ENABLE_PACKAGE_CACHE', true),
  };
}
