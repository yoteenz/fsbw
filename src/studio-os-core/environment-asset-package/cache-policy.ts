import type {
  EnvironmentAssetPackage,
  EnvironmentPackageCacheLookup,
  EnvironmentPackageRegenerationRequest,
} from './types';

export function buildEnvironmentPackageCacheKey(input: EnvironmentPackageCacheLookup): string {
  return [
    input.departmentId,
    input.environmentId,
    `r${input.revision}`,
    input.promptHash,
    input.seed,
    input.provider,
  ].join(':');
}

export function packageCacheKeyMatches(
  pkg: EnvironmentAssetPackage,
  input: EnvironmentPackageCacheLookup
): boolean {
  return pkg.cacheKey === buildEnvironmentPackageCacheKey(input);
}

/** Returns true when regeneration is allowed; false when cached package should be reused. */
export function shouldRegenerateEnvironmentPackage(
  existing: EnvironmentAssetPackage | null,
  lookup: EnvironmentPackageCacheLookup,
  request?: EnvironmentPackageRegenerationRequest
): boolean {
  if (!existing) return true;
  if (request?.force) return true;
  if (!packageCacheKeyMatches(existing, lookup)) return true;
  if (request) return true;
  return false;
}

export function assertPackageReusePolicy(
  existing: EnvironmentAssetPackage | null,
  lookup: EnvironmentPackageCacheLookup
): 'reuse' | 'generate' {
  return shouldRegenerateEnvironmentPackage(existing, lookup) ? 'generate' : 'reuse';
}
