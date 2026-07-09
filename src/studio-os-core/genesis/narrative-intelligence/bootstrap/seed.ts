import { ensureStudioIntelligenceLayerSubsystem } from '../../studio-intelligence-layer/engine';
import { readNarrativeIntelligenceStore, writeNarrativeIntelligenceStore } from '../persistence';
import { buildNarrativeIntelligenceSeedStore } from './seed-data';
import type { XniPlaygroundInput } from '../types';

export function seedNarrativeIntelligenceStore(): void {
  ensureStudioIntelligenceLayerSubsystem();
  const seed = buildNarrativeIntelligenceSeedStore();
  const current = readNarrativeIntelligenceStore();
  writeNarrativeIntelligenceStore({
    ...current,
    ...seed,
    bootstrappedAt: new Date().toISOString(),
  });
}

export function ensureNarrativeIntelligenceStore() {
  ensureStudioIntelligenceLayerSubsystem();
  const current = readNarrativeIntelligenceStore();
  if (!current.seededAt || current.productionGenomeRegistry.length === 0) {
    seedNarrativeIntelligenceStore();
    return readNarrativeIntelligenceStore();
  }
  return current;
}

export function recordNarrativeIntelligenceOpened(): void {
  const store = readNarrativeIntelligenceStore();
  if (store.lastOpenedAt) return;
  writeNarrativeIntelligenceStore({
    ...store,
    lastOpenedAt: new Date().toISOString(),
  });
}

export function updateNarrativePlaygroundSelection(partial: Partial<XniPlaygroundInput>): void {
  const store = readNarrativeIntelligenceStore();
  writeNarrativeIntelligenceStore({
    ...store,
    playground: { ...store.playground, ...partial },
  });
}

export { SEED_PRODUCTION_GENOMES } from './seed-data';
