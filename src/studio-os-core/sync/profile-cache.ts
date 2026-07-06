/**
 * Read cached profile from localStorage before running expensive sync rebuilds.
 * Prevents Mission Control / studio pages from re-syncing entire module chains on every mount.
 */
export function readFirstEnsure<T>(
  organizationId: string,
  get: (id: string) => T | null,
  sync: (id: string) => T
): T {
  return get(organizationId) ?? sync(organizationId);
}
