import {
  STUDIO_EXCHANGE_STORAGE_KEY,
  STUDIO_EXCHANGE_UPDATED_EVENT,
} from '../constants';
import { emptyStudioExchangeStore, type StudioExchangeStore } from './store-schema';

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_EXCHANGE_UPDATED_EVENT));
  }
}

export function readStudioExchangeStore(): StudioExchangeStore {
  if (typeof localStorage === 'undefined') return emptyStudioExchangeStore();
  try {
    const raw = localStorage.getItem(STUDIO_EXCHANGE_STORAGE_KEY);
    if (!raw) return emptyStudioExchangeStore();
    return { ...emptyStudioExchangeStore(), ...(JSON.parse(raw) as StudioExchangeStore) };
  } catch {
    return emptyStudioExchangeStore();
  }
}

export function writeStudioExchangeStore(store: StudioExchangeStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STUDIO_EXCHANGE_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function patchStudioExchangeStore(
  patch: (store: StudioExchangeStore) => StudioExchangeStore,
): StudioExchangeStore {
  const next = patch(readStudioExchangeStore());
  writeStudioExchangeStore(next);
  return next;
}
