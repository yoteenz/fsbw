/** localStorage namespaces — legacy keys migrated into aio_debug_store */

export const AIO_STORAGE_KEYS = {
  intake: 'aio_debug_intake',
  roadmap: 'aio_debug_roadmap',
  servicePlan: 'aio_debug_service_plan',
  requests: 'aio_debug_requests',
  requestCounter: 'aio_debug_request_counter',
  store: 'aio_debug_store',
} as const;

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

export function writeStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function removeStorage(key: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(key);
}

export function resetAllDemoData(): void {
  Object.values(AIO_STORAGE_KEYS).forEach(removeStorage);
}
