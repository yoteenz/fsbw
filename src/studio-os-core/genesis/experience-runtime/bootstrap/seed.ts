import { ensureExperienceEngineDnaSubsystem } from '../../experience-engine/engine';
import {
  mutateExperienceRuntimeStore,
  readExperienceRuntimeStore,
  writeExperienceRuntimeStore,
} from '../persistence';
import { buildExperienceRuntimeSeedStore } from './seed-data';
import type { XerStore, XerRuntimeSelection } from '../types';

export function seedExperienceRuntimeStore(): void {
  ensureExperienceEngineDnaSubsystem();
  const seed = buildExperienceRuntimeSeedStore();
  writeExperienceRuntimeStore({
    ...seed,
    bootstrappedAt: new Date().toISOString(),
  });
}

export function ensureExperienceRuntimeStore() {
  ensureExperienceEngineDnaSubsystem();
  const current = readExperienceRuntimeStore();
  if (!current.seededAt || current.platformDna.routeAnatomy.length === 0) {
    seedExperienceRuntimeStore();
    return readExperienceRuntimeStore();
  }
  return current;
}

export function recordExperienceRuntimeOpened(): void {
  const current = readExperienceRuntimeStore();
  const next: XerStore = { ...current, lastOpenedAt: new Date().toISOString() };
  if (next.lastOpenedAt === current.lastOpenedAt) return;
  writeExperienceRuntimeStore(next);
}

export function updateRuntimeSelectionStore(partial: Partial<XerRuntimeSelection>): void {
  mutateExperienceRuntimeStore((store) => ({
    ...store,
    selection: { ...store.selection, ...partial },
  }));
}

export { mutateExperienceRuntimeStore };
