/** Centralized Studio localStorage keys — single source for Phase 2 scaling. */

export const ADMIN_STUDIO_STORAGE_KEYS = {
  shows: 'adminStudioShowsEditable_v1',
  contentPacks: 'adminStudioContentPacksEditable_v1',
  publishingQueue: 'adminStudioPublishingQueue_v1',
  aiForm: 'adminStudioAiForm_v1',
  promptLibrary: 'adminStudioPromptLibrary_v1',
  promptFavorites: 'adminStudioPromptFavorites_v1',
} as const;

export type AdminStudioStorageKey = (typeof ADMIN_STUDIO_STORAGE_KEYS)[keyof typeof ADMIN_STUDIO_STORAGE_KEYS];

export function readStudioJson<T>(key: AdminStudioStorageKey): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeStudioJson(key: AdminStudioStorageKey, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function patchStudioRecord<T extends Record<string, unknown>>(
  key: AdminStudioStorageKey,
  recordId: string,
  patch: Partial<T>
): void {
  const store = readStudioJson<Record<string, Partial<T>>>(key) ?? {};
  store[recordId] = { ...(store[recordId] ?? {}), ...patch };
  writeStudioJson(key, store);
}
