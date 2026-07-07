/**
 * Studio OS browser storage architecture.
 *
 * - Lightweight preferences → localStorage (size-guarded).
 * - Large demo/workspace payloads → in-memory session cache only (never localStorage).
 * - User workspace edits (adminStudio*) → cloud via /api/admin/studio-workspace-state when available.
 * - Never throws QuotaExceededError — app must load even when storage is full or unavailable.
 */

import {
  isQuotaExceededError,
  safeLocalStorageGetItem,
  safeLocalStorageRemoveItem,
  safeLocalStorageSetItem,
} from './safeLocalStorage';

/** Max bytes per Studio OS localStorage value (Safari ~5MB total domain quota). */
export const STUDIO_OS_MAX_LOCAL_VALUE_BYTES = 24 * 1024;

/** Max total bytes for all Studio OS keys in localStorage. */
export const STUDIO_OS_MAX_TOTAL_LOCAL_BYTES = 256 * 1024;

const memoryCache = new Map<string, string>();
let guardInstalled = false;
let purgeRan = false;
let purgeScheduled = false;
/** Cached total bytes for studio keys in localStorage — avoids O(n) scan per write. */
let cachedStudioLocalBytes: number | null = null;
/** Skip per-write storage events during bulk bootstrap seeds. */
let suppressStorageGuardEvents = false;

export const STUDIO_OS_STORAGE_GUARD_EVENT = 'studio-os-storage-guard';

/** Exact keys allowed in localStorage regardless of size (still capped per-value). */
const LIGHTWEIGHT_EXACT_KEYS = new Set([
  'studioOs_activeWorkspace_v1',
  'studioOs_studioOrbSoundEnabled_v1',
  'studioOs_visionActiveMode',
  'studioOsPlatformBootstrapped_v1',
  /** NDXBook pilot registry — must persist Page 001 across navigation (founder pilot). */
  'studioOsNdxbook_v1',
  'studioOsNdxbookNewsroom_v1',
  'studioOsNdxbookMissionControl_v1',
  'studioOsNdxbook_deptProgress_v1',
  'studioOsNdxbook_founderNotes_v1',
  'studioOsCreativeDirection_v1',
]);

/** Substring patterns for small UI preference keys. */
const LIGHTWEIGHT_KEY_FRAGMENTS = [
  'studioOrbAwakening',
  '_collapsed',
  '_preferences',
  '_lastRoute',
  '_theme',
  '_favorites',
  '_recentWorkspaceIds',
  'visionOverlayPosition',
];

export function isStudioOsStorageKey(key: string): boolean {
  if (key.startsWith('studioOs_')) return true;
  if (key.startsWith('adminStudio')) return true;
  if (key.includes('_adminStudio')) return true;
  return false;
}

export function isAdminStudioEditableKey(key: string): boolean {
  return key.includes('adminStudio') && key.includes('Editable');
}

function isLightweightStudioKey(key: string): boolean {
  if (LIGHTWEIGHT_EXACT_KEYS.has(key)) return true;
  return LIGHTWEIGHT_KEY_FRAGMENTS.some((frag) => key.includes(frag));
}

export function readStudioOsMemoryValue(key: string): string | null {
  return memoryCache.get(key) ?? null;
}

export function writeStudioOsMemoryValue(key: string, value: string): void {
  memoryCache.set(key, value);
}

export function removeStudioOsMemoryValue(key: string): void {
  memoryCache.delete(key);
}

export function clearStudioOsMemoryCache(): void {
  memoryCache.clear();
}

function refreshStudioLocalBytesCache(): number {
  cachedStudioLocalBytes = measureStudioLocalBytesUncached();
  return cachedStudioLocalBytes;
}

function getStudioLocalBytesCached(): number {
  if (cachedStudioLocalBytes === null) {
    return refreshStudioLocalBytesCache();
  }
  return cachedStudioLocalBytes;
}

function measureStudioLocalBytesUncached(): number {
  if (typeof window === 'undefined') return 0;
  let total = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !isStudioOsStorageKey(key)) continue;
      const val = localStorage.getItem(key);
      if (val) total += key.length + val.length;
    }
  } catch {
    /* ignore */
  }
  return total;
}

function canPersistStudioKeyLocally(key: string, value: string): boolean {
  if (!isStudioOsStorageKey(key)) return true;
  if (value.length > STUDIO_OS_MAX_LOCAL_VALUE_BYTES) return false;
  if (isLightweightStudioKey(key)) {
    if (getStudioLocalBytesCached() + key.length + value.length > STUDIO_OS_MAX_TOTAL_LOCAL_BYTES) {
      return false;
    }
    return true;
  }
  // Large module/demo payloads never persist locally.
  return false;
}

function noteLocalStudioWrite(key: string, value: string): void {
  if (cachedStudioLocalBytes !== null && isStudioOsStorageKey(key)) {
    cachedStudioLocalBytes += key.length + value.length;
  }
}

function noteLocalStudioRemove(key: string, previousLength: number): void {
  if (cachedStudioLocalBytes !== null && isStudioOsStorageKey(key)) {
    cachedStudioLocalBytes = Math.max(0, cachedStudioLocalBytes - (key.length + previousLength));
  }
}

function dispatchStorageGuardEvent(detail: { action: 'memory-fallback' | 'purge' | 'reset'; key?: string }): void {
  if (suppressStorageGuardEvents) return;
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(STUDIO_OS_STORAGE_GUARD_EVENT, { detail }));
}

/** Suppress storage guard events during bulk platform bootstrap (avoids main-thread churn). */
export function runWithStudioStorageBulkWrite<T>(fn: () => T): T {
  const prev = suppressStorageGuardEvents;
  suppressStorageGuardEvents = true;
  try {
    return fn();
  } finally {
    suppressStorageGuardEvents = prev;
  }
}

/**
 * Persist a Studio OS value — memory always; localStorage only when lightweight and within quota.
 */
export function writeStudioOsStorageValue(key: string, value: string): boolean {
  writeStudioOsMemoryValue(key, value);

  if (!canPersistStudioKeyLocally(key, value)) {
    if (!suppressStorageGuardEvents) {
      dispatchStorageGuardEvent({ action: 'memory-fallback', key });
    }
    return false;
  }

  const ok = safeLocalStorageSetItem(key, value);
  if (ok) {
    noteLocalStudioWrite(key, value);
  } else if (!suppressStorageGuardEvents) {
    dispatchStorageGuardEvent({ action: 'memory-fallback', key });
  }
  return ok;
}

/** Read Studio OS value — memory cache first, then localStorage. */
export function readStudioOsStorageValue(key: string): string | null {
  const mem = readStudioOsMemoryValue(key);
  if (mem !== null) return mem;
  return safeLocalStorageGetItem(key);
}

export function removeStudioOsStorageValue(key: string): void {
  if (typeof window !== 'undefined') {
    try {
      const prev = safeLocalStorageGetItem(key);
      if (prev) noteLocalStudioRemove(key, prev.length);
    } catch {
      /* ignore */
    }
  }
  removeStudioOsMemoryValue(key);
  safeLocalStorageRemoveItem(key);
}

export function readStudioOsJson<T>(key: string, empty: () => T): T {
  const raw = readStudioOsStorageValue(key);
  if (!raw) return empty();
  try {
    return { ...empty(), ...JSON.parse(raw) } as T;
  } catch {
    removeStudioOsStorageValue(key);
    return empty();
  }
}

export function writeStudioOsJson(key: string, value: unknown): boolean {
  try {
    return writeStudioOsStorageValue(key, JSON.stringify(value));
  } catch {
    return false;
  }
}

/** Remove oversized or corrupted Studio OS keys from localStorage (safe on boot). */
export function purgeOversizedStudioLocalKeys(): { removed: string[]; freedBytes: number } {
  const removed: string[] = [];
  let freedBytes = 0;
  if (typeof window === 'undefined') return { removed, freedBytes };

  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && isStudioOsStorageKey(k)) keys.push(k);
    }

    for (const key of keys) {
      let raw: string | null = null;
      try {
        raw = localStorage.getItem(key);
      } catch {
        safeLocalStorageRemoveItem(key);
        removed.push(key);
        continue;
      }
      if (!raw) continue;

      let drop = false;
      if (raw.length > STUDIO_OS_MAX_LOCAL_VALUE_BYTES) drop = true;
      else if (!isLightweightStudioKey(key)) drop = true;
      else {
        try {
          JSON.parse(raw);
        } catch {
          drop = true;
        }
      }

      if (drop) {
        writeStudioOsMemoryValue(key, raw);
        noteLocalStudioRemove(key, raw.length);
        safeLocalStorageRemoveItem(key);
        removed.push(key);
        freedBytes += key.length + raw.length;
      }
    }
  } catch (error) {
    console.warn('[studioOsBrowserStorage] purge failed:', error);
  }

  cachedStudioLocalBytes = null;

  if (removed.length > 0) {
    dispatchStorageGuardEvent({ action: 'purge' });
    console.info(`[studioOsBrowserStorage] purged ${removed.length} oversized Studio keys (${freedBytes} bytes)`);
  }
  return { removed, freedBytes };
}

/** Full recovery — clears Studio OS local + memory caches; cloud remains source of truth. */
export function resetLocalStudioCache(): void {
  if (typeof window === 'undefined') return;
  clearStudioOsMemoryCache();
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && isStudioOsStorageKey(k)) keys.push(k);
    }
    for (const key of keys) {
      safeLocalStorageRemoveItem(key);
    }
    try {
      sessionStorage.removeItem('studioOsPlatformBootstrapped_v1');
    } catch {
      /* ignore */
    }
  } catch (error) {
    console.warn('[studioOsBrowserStorage] reset failed:', error);
  }
  dispatchStorageGuardEvent({ action: 'reset' });
  cachedStudioLocalBytes = null;
}

/** Install localStorage guard — intercepts Studio OS keys before quota errors crash the app. */
export function installStudioOsStorageGuard(): void {
  if (guardInstalled || typeof window === 'undefined') return;
  guardInstalled = true;

  const proto = Storage.prototype;
  const originalSetItem = proto.setItem;
  const originalGetItem = proto.getItem;
  const originalRemoveItem = proto.removeItem;

  proto.setItem = function studioOsSetItem(key: string, value: string): void {
    if (!isStudioOsStorageKey(key)) {
      try {
        originalSetItem.call(this, key, value);
      } catch (error) {
        if (isQuotaExceededError(error)) {
          console.warn(`[studioOsBrowserStorage] quota exceeded (non-studio key skipped): ${key}`);
          return;
        }
        throw error;
      }
      return;
    }

    writeStudioOsMemoryValue(key, value);
    if (!canPersistStudioKeyLocally(key, value)) {
      if (!suppressStorageGuardEvents) {
        dispatchStorageGuardEvent({ action: 'memory-fallback', key });
      }
      return;
    }
    try {
      originalSetItem.call(this, key, value);
      noteLocalStudioWrite(key, value);
    } catch (error) {
      if (isQuotaExceededError(error)) {
        console.warn(`[studioOsBrowserStorage] quota exceeded — memory only: ${key}`);
        dispatchStorageGuardEvent({ action: 'memory-fallback', key });
        return;
      }
      throw error;
    }
  };

  proto.getItem = function studioOsGetItem(key: string): string | null {
    if (isStudioOsStorageKey(key)) {
      const mem = readStudioOsMemoryValue(key);
      if (mem !== null) return mem;
    }
    try {
      return originalGetItem.call(this, key);
    } catch {
      return null;
    }
  };

  proto.removeItem = function studioOsRemoveItem(key: string): void {
    if (isStudioOsStorageKey(key)) {
      removeStudioOsMemoryValue(key);
    }
    try {
      originalRemoveItem.call(this, key);
    } catch {
      /* ignore */
    }
  };
}

/** Boot hook — install guard sync; purge legacy keys on idle (never block first paint). */
export function bootstrapStudioOsBrowserStorage(): void {
  installStudioOsStorageGuard();
  schedulePurgeOversizedStudioLocalKeys();
}

function schedulePurgeOversizedStudioLocalKeys(): void {
  if (purgeRan || purgeScheduled || typeof window === 'undefined') return;
  purgeScheduled = true;

  const run = () => {
    purgeScheduled = false;
    if (purgeRan) return;
    purgeRan = true;
    purgeOversizedStudioLocalKeys();
  };

  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(run, { timeout: 3000 });
  } else {
    setTimeout(run, 0);
  }
}

export function getStudioLocalStorageAudit(): {
  localKeys: { key: string; bytes: number; lightweight: boolean }[];
  memoryKeys: number;
  totalLocalBytes: number;
} {
  const localKeys: { key: string; bytes: number; lightweight: boolean }[] = [];
  let totalLocalBytes = 0;
  if (typeof window !== 'undefined') {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !isStudioOsStorageKey(key)) continue;
        const val = localStorage.getItem(key) ?? '';
        const bytes = key.length + val.length;
        localKeys.push({ key, bytes, lightweight: isLightweightStudioKey(key) });
        totalLocalBytes += bytes;
      }
    } catch {
      /* ignore */
    }
  }
  return { localKeys, memoryKeys: memoryCache.size, totalLocalBytes: getStudioLocalBytesCached() };
}
