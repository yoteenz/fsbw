/**
 * Smoke test: Studio OS storage guard — large payloads must not throw QuotaExceededError.
 * Run: npx tsx scripts/test-studio-os-storage.ts
 */

import {
  bootstrapStudioOsBrowserStorage,
  purgeOversizedStudioLocalKeys,
  readStudioOsStorageValue,
  resetLocalStudioCache,
  writeStudioOsStorageValue,
  getStudioLocalStorageAudit,
} from '../src/utils/studioOsBrowserStorage';

const store = new Map<string, string>();

function installMockLocalStorage() {
  const ls = {
    get length() {
      return store.size;
    },
    key(i: number) {
      return [...store.keys()][i] ?? null;
    },
    getItem(k: string) {
      return store.get(k) ?? null;
    },
    setItem(k: string, v: string) {
      if (k === '__quota_test__') throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      store.set(k, String(v));
    },
    removeItem(k: string) {
      store.delete(k);
    },
    clear() {
      store.clear();
    },
  };
  (globalThis as typeof globalThis & { window: typeof globalThis; localStorage: typeof ls }).window = globalThis;
  (globalThis as typeof globalThis & { localStorage: typeof ls }).localStorage = ls;
  (globalThis as typeof globalThis & { Storage: { prototype: typeof ls } }).Storage = { prototype: ls };
  (globalThis as typeof globalThis & { dispatchEvent: () => boolean }).dispatchEvent = () => true;
  (globalThis as typeof globalThis & { CustomEvent: typeof Event }).CustomEvent = Event as unknown as typeof CustomEvent;
}

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`FAIL: ${msg}`);
}

installMockLocalStorage();
bootstrapStudioOsBrowserStorage();

// Large demo payload must not throw
const bigPayload = JSON.stringify({ demo: 'x'.repeat(100_000) });
writeStudioOsStorageValue('studioOs_executiveOrganization_v1', bigPayload);
assert(readStudioOsStorageValue('studioOs_executiveOrganization_v1') === bigPayload, 'memory read large payload');
assert(store.has('studioOs_executiveOrganization_v1') === false, 'large payload not in localStorage');

// Lightweight key persists locally
writeStudioOsStorageValue('studioOs_activeWorkspace_v1', 'frontal-slayer');
assert(store.get('studioOs_activeWorkspace_v1') === 'frontal-slayer', 'lightweight key in localStorage');

// Purge removes legacy oversized keys
store.set('studioOs_growthNetwork_v1', bigPayload);
const { removed } = purgeOversizedStudioLocalKeys();
assert(removed.includes('studioOs_growthNetwork_v1'), 'purge removes oversized key');

// Reset clears studio keys
resetLocalStudioCache();
const audit = getStudioLocalStorageAudit();
assert(audit.localKeys.length === 0, 'reset clears local studio keys');
assert(audit.memoryKeys === 0, 'reset clears memory cache');

console.log('OK: Studio OS storage guard smoke tests passed');
