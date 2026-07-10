/**
 * Persisted state quarantine — diagnostic isolation smoke tests.
 */
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { quarantineIncompatiblePersistedState } from './persisted-state-audit';

const store = new Map<string, string>();

function installMockStorage() {
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
      store.set(k, String(v));
    },
    removeItem(k: string) {
      store.delete(k);
    },
    clear() {
      store.clear();
    },
  };
  vi.stubGlobal('localStorage', ls);
  vi.stubGlobal('sessionStorage', ls);
  vi.stubGlobal('window', globalThis as unknown as Window);
}

describe('quarantineIncompatiblePersistedState', () => {
  beforeEach(() => {
    store.clear();
    installMockStorage();
  });

  it('quarantines corrupt genesis JSON', () => {
    store.set('genesis_v1', '{not-json');
    const result = quarantineIncompatiblePersistedState();
    expect(result.quarantined.some((r) => r.key === 'genesis_v1')).toBe(true);
    expect(localStorage.getItem('genesis_v1')).toBeNull();
  });

  it('quarantines oversized flight recorder env snapshots', () => {
    store.set('studioOsFlightRecorderEnvSnapshots_v1', 'x'.repeat(300_000));
    const result = quarantineIncompatiblePersistedState();
    expect(result.quarantined.some((r) => r.key === 'studioOsFlightRecorderEnvSnapshots_v1')).toBe(true);
  });

  it('leaves absent keys as skipped', () => {
    const result = quarantineIncompatiblePersistedState();
    expect(result.skipped.some((r) => r.key === 'genesis_v1')).toBe(true);
  });
});
