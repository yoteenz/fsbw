import {
  LIVING_PRESENCE_PHILOSOPHY,
  LIVING_PRESENCE_STORAGE_KEY,
  LIVING_PRESENCE_VERSION,
} from './constants';
import { buildMorningArrival } from './engine';
import { readScopedStore, writeScopedStore } from '../workspace/scoped-store';
import type { LivingPresenceStore } from './types';

const RETURN_THRESHOLD_MS = 4 * 3600_000;

function emptyStore(): LivingPresenceStore {
  return {
    version: LIVING_PRESENCE_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    lastVisitAt: null,
    morningArrivalShownSession: false,
    dismissedMomentIds: [],
    philosophy: [...LIVING_PRESENCE_PHILOSOPHY],
  };
}

export function readLivingPresenceStore(): LivingPresenceStore {
  return readScopedStore(LIVING_PRESENCE_STORAGE_KEY, emptyStore);
}

export function writeLivingPresenceStore(store: LivingPresenceStore): void {
  writeScopedStore(LIVING_PRESENCE_STORAGE_KEY, {
    ...store,
    lastUpdatedAt: new Date().toISOString(),
  });
}

export function bootstrapLivingPresenceStore(seed: Partial<LivingPresenceStore>): void {
  const current = readLivingPresenceStore();
  if (current.lastVisitAt) return;
  writeLivingPresenceStore({ ...emptyStore(), ...seed });
}

/** Check founder return and morning arrival — call once on headquarters entry. */
export function checkFounderArrival(): {
  isReturning: boolean;
  arrival: ReturnType<typeof buildMorningArrival>;
} {
  const store = readLivingPresenceStore();
  const now = Date.now();
  const last = store.lastVisitAt ? new Date(store.lastVisitAt).getTime() : 0;
  const isReturning = last > 0 && now - last > RETURN_THRESHOLD_MS;
  const arrival =
    !store.morningArrivalShownSession && isReturning ? buildMorningArrival(true) : null;

  writeLivingPresenceStore({
    ...store,
    lastVisitAt: new Date().toISOString(),
    morningArrivalShownSession: arrival ? true : store.morningArrivalShownSession,
  });

  return { isReturning, arrival };
}

export function dismissOrganizationalMoment(id: string): void {
  const store = readLivingPresenceStore();
  if (store.dismissedMomentIds.includes(id)) return;
  writeLivingPresenceStore({
    ...store,
    dismissedMomentIds: [...store.dismissedMomentIds, id].slice(-24),
  });
}
