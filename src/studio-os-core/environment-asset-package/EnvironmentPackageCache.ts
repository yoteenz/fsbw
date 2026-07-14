import type { EnvironmentAssetPackage, EnvironmentPackageCacheLookup } from './EnvironmentAssetPackage';

export function buildEnvironmentPackageCacheKey(input: EnvironmentPackageCacheLookup): string {
  return [
    input.departmentId,
    input.environmentId,
    input.variantId,
    `r${input.revision}`,
    input.promptHash,
    input.seed,
    input.provider,
    input.departmentBibleVersion,
  ].join(':');
}

export function packageCacheKeyMatches(
  pkg: EnvironmentAssetPackage,
  input: EnvironmentPackageCacheLookup
): boolean {
  return pkg.cacheKey === buildEnvironmentPackageCacheKey(input);
}

export function shouldRegenerateEnvironmentPackage(
  existing: EnvironmentAssetPackage | null,
  lookup: EnvironmentPackageCacheLookup,
  request?: { force: boolean }
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

/** In-memory package cache — keyed by cacheKey for deduplication. */
const CACHE_STORE = new Map<string, EnvironmentAssetPackage>();

export function cacheEnvironmentPackage(pkg: EnvironmentAssetPackage): void {
  CACHE_STORE.set(pkg.cacheKey, pkg);
}

export function getCachedEnvironmentPackage(cacheKey: string): EnvironmentAssetPackage | null {
  return CACHE_STORE.get(cacheKey) ?? null;
}

export function resolveOrCachePackage(
  lookup: EnvironmentPackageCacheLookup,
  factory: () => EnvironmentAssetPackage
): EnvironmentAssetPackage {
  const key = buildEnvironmentPackageCacheKey(lookup);
  const cached = getCachedEnvironmentPackage(key);
  if (cached) return cached;
  const pkg = factory();
  cacheEnvironmentPackage(pkg);
  return pkg;
}

export function clearEnvironmentPackageCache(): void {
  CACHE_STORE.clear();
}
