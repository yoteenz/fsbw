import {
  CAREER_WORLDS_ENGINE_VERSION,
  CAREER_WORLDS_STORAGE_KEY,
  CAREER_WORLDS_UPDATED_EVENT,
} from '../constants';
import type { CareerWorldId } from '../types';
import type { CareerWorldSave, CareerWorldStore } from '../core/schemas';
import { createCareerWorldSave, touchCareerWorldSave } from '../worlds/registry';

function emptyStore(): CareerWorldStore {
  return { version: CAREER_WORLDS_ENGINE_VERSION, saves: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CAREER_WORLDS_UPDATED_EVENT));
  }
}

export function readCareerWorldStore(): CareerWorldStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(CAREER_WORLDS_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as CareerWorldStore;
    return { ...emptyStore(), ...parsed, version: CAREER_WORLDS_ENGINE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeCareerWorldStore(store: CareerWorldStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(CAREER_WORLDS_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getCareerWorldSave(worldId: CareerWorldId, learnerId: string): CareerWorldSave | null {
  const key = `${worldId}:${learnerId}`;
  return readCareerWorldStore().saves.find((save) => save.saveId === key) ?? null;
}

export function ensureCareerWorldSave(worldId: CareerWorldId, learnerId: string): CareerWorldSave {
  const existing = getCareerWorldSave(worldId, learnerId);
  if (existing) return existing;

  const save = createCareerWorldSave({ worldId, learnerId });
  const store = readCareerWorldStore();
  writeCareerWorldStore({
    ...store,
    saves: [...store.saves.filter((s) => s.saveId !== save.saveId), save],
  });
  return save;
}

export function upsertCareerWorldSave(save: CareerWorldSave): CareerWorldSave {
  const next = touchCareerWorldSave(save);
  const store = readCareerWorldStore();
  writeCareerWorldStore({
    ...store,
    saves: [...store.saves.filter((s) => s.saveId !== next.saveId), next],
  });
  return next;
}

/** Alias for orchestration layer. */
export const saveCareerWorldSave = upsertCareerWorldSave;

/** Alias for orchestration layer. */
export const loadCareerWorldSave = getCareerWorldSave;

export function listCareerWorldSaves(learnerId?: string): CareerWorldSave[] {
  const saves = readCareerWorldStore().saves;
  return learnerId ? saves.filter((save) => save.learnerId === learnerId) : saves;
}

/** Future: Supabase adapter replaces localStorage without changing simulation API. */
export type CareerWorldPersistenceAdapter = {
  load: (worldId: CareerWorldId, learnerId: string) => Promise<CareerWorldSave | null>;
  save: (save: CareerWorldSave) => Promise<void>;
};
