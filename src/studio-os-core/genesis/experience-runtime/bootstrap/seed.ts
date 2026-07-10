import { ensureExperienceEngineDnaSubsystem } from '../../experience-engine/engine';
import { ensureRuntimeSessionId } from '../runtime-state/session-state';
import {
  mutateExperienceRuntimeStore,
  readExperienceRuntimeStore,
  writeExperienceRuntimeStore,
} from '../persistence';
import { buildExperienceRuntimeSeedStore } from './seed-data';
import type { XerRuntimeSelection } from '../types';

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
  if (!current.seededAt || !current.selection?.brandId || !current.platformDna?.platformDnaId || current.stateDnaProfiles.length === 0) {
    seedExperienceRuntimeStore();
    ensureRuntimeSessionId();
    return readExperienceRuntimeStore();
  }
  if (!current.sessionId) {
    ensureRuntimeSessionId();
  }
  return readExperienceRuntimeStore();
}

export function recordExperienceRuntimeOpened(): void {
  const current = readExperienceRuntimeStore();
  if (current.lastOpenedAt && Date.now() - Date.parse(current.lastOpenedAt) < 60_000) return;
  writeExperienceRuntimeStore({ ...current, lastOpenedAt: new Date().toISOString() });
}

export function updateRuntimeSelectionStore(partial: Partial<XerRuntimeSelection>): void {
  mutateExperienceRuntimeStore((store) => ({
    ...store,
    selection: { ...store.selection, ...partial },
  }));
}

export { mutateExperienceRuntimeStore };
