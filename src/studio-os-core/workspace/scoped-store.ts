import { scopeStorageKey, getRuntimeActiveWorkspaceId } from './storage';
import {
  readStudioOsStorageValue,
  removeStudioOsStorageValue,
  writeStudioOsJson,
} from '../../utils/studioOsBrowserStorage';

/** Read JSON scoped to active workspace — isolated per organization. */
export function readScopedStore<T>(baseKey: string, empty: () => T, workspaceId?: string): T {
  if (typeof window === 'undefined') return empty();
  const key = scopeStorageKey(baseKey, workspaceId);
  try {
    const raw = readStudioOsStorageValue(key);
    if (!raw) {
      const legacy = readStudioOsStorageValue(baseKey);
      if (legacy && !workspaceId) {
        try {
          const parsed = JSON.parse(legacy) as T;
          writeStudioOsJson(key, parsed);
          return parsed;
        } catch {
          removeStudioOsStorageValue(baseKey);
          return empty();
        }
      }
      return empty();
    }
    return { ...empty(), ...JSON.parse(raw) } as T;
  } catch {
    removeStudioOsStorageValue(key);
    return empty();
  }
}

export function writeScopedStore<T>(baseKey: string, value: T, workspaceId?: string): void {
  if (typeof window === 'undefined') return;
  writeStudioOsJson(scopeStorageKey(baseKey, workspaceId), value);
}

export function getActiveScopedStorageKey(baseKey: string): string {
  return scopeStorageKey(baseKey, getRuntimeActiveWorkspaceId());
}
