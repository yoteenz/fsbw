import { recordFlightEvent } from '../flight-recorder/recorder';
import { recordStateMutation } from './ownership-registry';

/** Flight-recorder persistence keys — must not re-enter the observer (infinite setItem loop). */
const OBSERVER_INTERNAL_KEY_PREFIXES = ['studioOsFlightRecorder', 'studioOsQuarantine_v1_'] as const;

function isObservedStorageKey(key: string): boolean {
  if (OBSERVER_INTERNAL_KEY_PREFIXES.some((prefix) => key.startsWith(prefix))) return false;
  return key.includes('genesis') || key.includes('studio') || key.includes('experience');
}

/** Observe localStorage/sessionStorage writes — never blocks or alters writes. */
export function installStorageObserver(): () => void {
  const cleanups: Array<() => void> = [];
  let observerDepth = 0;

  const withObserverGuard = (fn: () => void): void => {
    if (observerDepth > 0) return;
    observerDepth += 1;
    try {
      fn();
    } finally {
      observerDepth -= 1;
    }
  };

  for (const storage of [localStorage, sessionStorage] as Storage[]) {
    const name = storage === localStorage ? 'localStorage' : 'sessionStorage';
    const writeType = storage === localStorage ? 'LOCAL_STORAGE_WRITE' : 'SESSION_STORAGE_WRITE';
    const readType = storage === localStorage ? 'LOCAL_STORAGE_READ' : 'SESSION_STORAGE_READ';
    const origSet = storage.setItem.bind(storage);
    const origRemove = storage.removeItem.bind(storage);
    const origGet = storage.getItem.bind(storage);

    storage.getItem = (key: string) => {
      const value = origGet(key);
      if (isObservedStorageKey(key)) {
        withObserverGuard(() => {
          recordFlightEvent(readType, `${name}.getItem`, { detail: { key, hit: value != null } });
          recordFlightEvent('STORAGE_READ', `${name}.getItem`, { detail: { key, hit: value != null } });
        });
      }
      return value;
    };

    storage.setItem = (key: string, value: string) => {
      origSet(key, value);
      if (isObservedStorageKey(key)) {
        withObserverGuard(() => {
          recordStateMutation('genesis', `${name}.setItem:${key}`);
          recordFlightEvent(writeType, `${name}.setItem`, {
            detail: { key, bytes: value.length },
          });
          recordFlightEvent('STORAGE_WRITE', `${name}.setItem`, {
            detail: { key, bytes: value.length },
          });
          if (key === 'genesis_v1') {
            recordFlightEvent('STORE_UPDATED', 'genesis.localStorage', { detail: { bytes: value.length } });
          }
        });
      }
    };

    storage.removeItem = (key: string) => {
      origRemove(key);
      if (isObservedStorageKey(key)) {
        withObserverGuard(() => {
          recordFlightEvent(writeType, `${name}.removeItem`, { detail: { key } });
          recordFlightEvent('STORAGE_WRITE', `${name}.removeItem`, { detail: { key } });
        });
      }
    };

    cleanups.push(() => {
      storage.setItem = origSet;
      storage.removeItem = origRemove;
      storage.getItem = origGet;
    });
  }

  return () => cleanups.forEach((fn) => fn());
}
