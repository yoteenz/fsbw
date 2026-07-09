import { ensureBrandDiscoveryEngineSubsystem } from '../../brand-discovery-engine/engine';
import { readStudioIntelligenceLayerStore, writeStudioIntelligenceLayerStore } from '../persistence';
import { buildStudioIntelligenceSeedStore } from './seed-data';
import type { XsilPlaygroundSelection } from '../types';

export function seedStudioIntelligenceLayerStore(): void {
  ensureBrandDiscoveryEngineSubsystem();
  const seed = buildStudioIntelligenceSeedStore();
  const current = readStudioIntelligenceLayerStore();
  writeStudioIntelligenceLayerStore({
    ...current,
    ...seed,
    bootstrappedAt: new Date().toISOString(),
  });
}

export function ensureStudioIntelligenceLayerStore() {
  ensureBrandDiscoveryEngineSubsystem();
  const current = readStudioIntelligenceLayerStore();
  if (!current.seededAt || current.companyRegistry.length === 0) {
    seedStudioIntelligenceLayerStore();
    return readStudioIntelligenceLayerStore();
  }
  return current;
}

export function recordStudioIntelligenceLayerOpened(): void {
  const store = readStudioIntelligenceLayerStore();
  if (store.lastOpenedAt) return;
  writeStudioIntelligenceLayerStore({
    ...store,
    lastOpenedAt: new Date().toISOString(),
  });
}

export function updateIntelligencePlaygroundSelection(partial: Partial<XsilPlaygroundSelection>): void {
  const store = readStudioIntelligenceLayerStore();
  writeStudioIntelligenceLayerStore({
    ...store,
    playground: { ...store.playground, ...partial },
  });
}
