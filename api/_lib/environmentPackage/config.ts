/** Server-side Environment Package feature flags — production generation default OFF until verified. */

export type EnvironmentPackageServerFlags = {
  enableEnvironmentPackages: boolean;
  enablePackagePersistence: boolean;
  enablePackageProductionGeneration: boolean;
  enablePackageCache: boolean;
  enablePackageCdsHandoff: boolean;
  enablePackageCanonicalPromotion: boolean;
};

function serverFlag(key: string, defaultValue: boolean): boolean {
  const raw = process.env[key]?.trim();
  if (raw === '1' || raw === 'true') return true;
  if (raw === '0' || raw === 'false') return false;
  return defaultValue;
}

export function resolveEnvironmentPackageServerFlags(): EnvironmentPackageServerFlags {
  return {
    enableEnvironmentPackages: serverFlag('ENABLE_ENVIRONMENT_PACKAGES', true),
    enablePackagePersistence: serverFlag('ENABLE_PACKAGE_PERSISTENCE', true),
    enablePackageProductionGeneration: serverFlag('ENABLE_PACKAGE_PRODUCTION_GENERATION', false),
    enablePackageCache: serverFlag('ENABLE_PACKAGE_CACHE', true),
    enablePackageCdsHandoff: serverFlag('ENABLE_PACKAGE_CDS_HANDOFF', false),
    enablePackageCanonicalPromotion: serverFlag('ENABLE_PACKAGE_CANONICAL_PROMOTION', false),
  };
}

export function assertPackagePersistenceAvailable(): { ok: true } | { ok: false; code: string; message: string } {
  const flags = resolveEnvironmentPackageServerFlags();
  if (!flags.enablePackagePersistence) {
    return { ok: false, code: 'PACKAGE_PERSISTENCE_DISABLED', message: 'Package persistence is disabled.' };
  }
  if (!process.env.SUPABASE_URL?.trim() || !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return { ok: false, code: 'PACKAGE_NOT_PERSISTED', message: 'Supabase service role not configured.' };
  }
  return { ok: true };
}

export const ENV_PACKAGE_STORAGE_PREFIX = 'studio-world/environment-packages';

export function buildEnvironmentPackageStoragePath(input: {
  departmentId: string;
  environmentId: string;
  variantId: string;
  revision: number;
  outputType: string;
  filename: string;
}): string {
  return `${ENV_PACKAGE_STORAGE_PREFIX}/${input.departmentId}/${input.environmentId}/${input.variantId}/r${input.revision}/${input.outputType}/${input.filename}`;
}
