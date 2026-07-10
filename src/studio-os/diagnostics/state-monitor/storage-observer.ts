import { recordFlightEvent } from '../flight-recorder/recorder';
import { recordStateMutation } from './ownership-registry';

/** Observe localStorage/sessionStorage writes — never blocks or alters writes. */
export function installStorageObserver(): () => void {
  const cleanups: Array<() => void> = [];

  for (const storage of [localStorage, sessionStorage] as Storage[]) {
    const name = storage === localStorage ? 'localStorage' : 'sessionStorage';
    const origSet = storage.setItem.bind(storage);
    const origRemove = storage.removeItem.bind(storage);

    storage.setItem = (key: string, value: string) => {
      origSet(key, value);
      if (key.includes('genesis') || key.includes('studio') || key.includes('experience')) {
        recordStateMutation('genesis', `${name}.setItem:${key}`);
        recordFlightEvent('STORAGE_WRITE', `${name}.setItem`, {
          detail: { key, bytes: value.length },
        });
        if (key === 'genesis_v1') {
          recordFlightEvent('STORE_UPDATED', 'genesis.localStorage', { detail: { bytes: value.length } });
        }
      }
    };

    storage.removeItem = (key: string) => {
      origRemove(key);
      recordFlightEvent('STORAGE_WRITE', `${name}.removeItem`, { detail: { key } });
    };

    cleanups.push(() => {
      storage.setItem = origSet;
      storage.removeItem = origRemove;
    });
  }

  return () => cleanups.forEach((fn) => fn());
}
