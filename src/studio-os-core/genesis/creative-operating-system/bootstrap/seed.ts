import { ensureStudioProductionSystemSubsystem } from '../../studio-production-system/engine';
import { readCreativeOperatingSystemStore, writeCreativeOperatingSystemStore } from '../persistence';
import { buildCreativeOperatingSystemSeedStore } from './seed-data';

export function seedCreativeOperatingSystemStore(): void {
  ensureStudioProductionSystemSubsystem();
  const seed = buildCreativeOperatingSystemSeedStore();
  const current = readCreativeOperatingSystemStore();
  writeCreativeOperatingSystemStore({
    ...current,
    ...seed,
    bootstrappedAt: new Date().toISOString(),
  });
}

export function ensureCreativeOperatingSystemStore() {
  ensureStudioProductionSystemSubsystem();
  const current = readCreativeOperatingSystemStore();
  if (!current.seededAt) {
    seedCreativeOperatingSystemStore();
    return readCreativeOperatingSystemStore();
  }
  return current;
}

export function recordCreativeOperatingSystemOpened(): void {
  const store = readCreativeOperatingSystemStore();
  if (store.lastOpenedAt) return;
  writeCreativeOperatingSystemStore({
    ...store,
    lastOpenedAt: new Date().toISOString(),
  });
}
