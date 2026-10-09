/** localStorage namespaces — legacy keys migrated into aio_debug_store */

export const AIO_STORAGE_KEYS = {
  intake: 'aio_debug_intake',
  roadmap: 'aio_debug_roadmap',
  servicePlan: 'aio_debug_service_plan',
  requests: 'aio_debug_requests',
  requestCounter: 'aio_debug_request_counter',
  store: 'aio_debug_store',
} as const;

export type StorageWriteError =
  | { kind: 'quota_exceeded' }
  | { kind: 'storage_unavailable' }
  | { kind: 'serialization_failed' }
  | { kind: 'unknown'; message: string };

export type StorageWriteResult = { ok: true } | { ok: false; error: StorageWriteError };

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  return safeParse(window.localStorage.getItem(key), fallback);
}

export function writeStorage<T>(key: string, value: T): StorageWriteResult {
  if (typeof window === 'undefined') return { ok: true };
  let serialized: string;
  try {
    serialized = JSON.stringify(value);
  } catch (e) {
    return {
      ok: false,
      error: {
        kind: 'serialization_failed',
      },
    };
  }
  try {
    window.localStorage.setItem(key, serialized);
    return { ok: true };
  } catch (e) {
    const name = e instanceof DOMException ? e.name : '';
    if (name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      return { ok: false, error: { kind: 'quota_exceeded' } };
    }
    if (typeof window.localStorage === 'undefined') {
      return { ok: false, error: { kind: 'storage_unavailable' } };
    }
    return {
      ok: false,
      error: { kind: 'unknown', message: e instanceof Error ? e.message : 'Storage write failed' },
    };
  }
}

export function removeStorage(key: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(key);
}

export function resetAllDemoData(): void {
  Object.values(AIO_STORAGE_KEYS).forEach(removeStorage);
}

/** User-facing message for storage failures (no raw exception text). */
export function storageWriteErrorMessage(error: StorageWriteError): string {
  switch (error.kind) {
    case 'quota_exceeded':
      return 'This browser’s saved workspace is full. Your current work is still on screen — export a backup or clear old demo data, then try again.';
    case 'storage_unavailable':
      return 'Browser storage is unavailable. Your work may not persist after refresh.';
    case 'serialization_failed':
      return 'Could not save workspace data (serialization failed). Your on-screen work is unchanged.';
    default:
      return 'Could not save workspace data. Your on-screen work is unchanged.';
  }
}
