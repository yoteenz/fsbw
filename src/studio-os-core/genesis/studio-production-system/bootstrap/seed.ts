import { ensureNarrativeIntelligenceSubsystem } from '../../narrative-intelligence/engine';
import { readStudioProductionSystemStore, writeStudioProductionSystemStore } from '../persistence';
import { buildStudioProductionSystemSeedStore } from './seed-data';
import type { XpsPlaygroundInput } from '../types';

export function seedStudioProductionSystemStore(): void {
  ensureNarrativeIntelligenceSubsystem();
  const seed = buildStudioProductionSystemSeedStore();
  const current = readStudioProductionSystemStore();
  writeStudioProductionSystemStore({
    ...current,
    ...seed,
    bootstrappedAt: new Date().toISOString(),
  });
}

export function ensureStudioProductionSystemStore() {
  ensureNarrativeIntelligenceSubsystem();
  const current = readStudioProductionSystemStore();
  if (!current.seededAt) {
    seedStudioProductionSystemStore();
    return readStudioProductionSystemStore();
  }
  return current;
}

export function recordStudioProductionSystemOpened(): void {
  const store = readStudioProductionSystemStore();
  if (store.lastOpenedAt) return;
  writeStudioProductionSystemStore({
    ...store,
    lastOpenedAt: new Date().toISOString(),
  });
}

export function updateProductionPlaygroundSelection(partial: Partial<XpsPlaygroundInput>): void {
  const store = readStudioProductionSystemStore();
  writeStudioProductionSystemStore({
    ...store,
    playground: { ...store.playground, ...partial },
  });
}
