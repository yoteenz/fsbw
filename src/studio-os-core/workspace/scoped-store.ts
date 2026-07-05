import { scopeStorageKey, getRuntimeActiveWorkspaceId } from './storage';

/** Read JSON scoped to active workspace — isolated per organization. */
export function readScopedStore<T>(baseKey: string, empty: () => T, workspaceId?: string): T {
  if (typeof window === 'undefined') return empty();
  const key = scopeStorageKey(baseKey, workspaceId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      const legacy = localStorage.getItem(baseKey);
      if (legacy && !workspaceId) {
        const parsed = JSON.parse(legacy) as T;
        localStorage.setItem(key, legacy);
        return parsed;
      }
      return empty();
    }
    return { ...empty(), ...JSON.parse(raw) } as T;
  } catch {
    return empty();
  }
}

export function writeScopedStore<T>(baseKey: string, value: T, workspaceId?: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(scopeStorageKey(baseKey, workspaceId), JSON.stringify(value));
}

export function getActiveScopedStorageKey(baseKey: string): string {
  return scopeStorageKey(baseKey, getRuntimeActiveWorkspaceId());
}
