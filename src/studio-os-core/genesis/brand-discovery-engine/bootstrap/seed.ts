import { ensureExperienceEngineDnaSubsystem } from '../../experience-engine/engine';
import { readBrandDiscoveryEngineStore, writeBrandDiscoveryEngineStore } from '../persistence';
import { buildBrandDiscoverySeedStore, SEED_STRATEGIC_BRAND_DNA } from './seed-data';
import type { XbdDiscoveryInput, XbdPlaygroundSelection } from '../types';

export function seedBrandDiscoveryEngineStore(): void {
  ensureExperienceEngineDnaSubsystem();
  const seed = buildBrandDiscoverySeedStore();
  const current = readBrandDiscoveryEngineStore();
  writeBrandDiscoveryEngineStore({
    ...current,
    ...seed,
    discoverySession: {
      ...current.discoverySession,
      sessionId: current.discoverySession.sessionId || `xbd-${Date.now()}`,
    },
    bootstrappedAt: new Date().toISOString(),
  });
}

export function ensureBrandDiscoveryEngineStore() {
  ensureExperienceEngineDnaSubsystem();
  const current = readBrandDiscoveryEngineStore();
  if (!current.seededAt || current.brandRegistry.length === 0) {
    seedBrandDiscoveryEngineStore();
    return readBrandDiscoveryEngineStore();
  }
  return current;
}

export function updateBrandDiscoveryPlaygroundSelection(partial: Partial<XbdPlaygroundSelection>): void {
  const store = readBrandDiscoveryEngineStore();
  writeBrandDiscoveryEngineStore({
    ...store,
    playground: { ...store.playground, ...partial },
  });
}

export function updateDiscoveryInputs(partial: Partial<XbdDiscoveryInput>): void {
  const store = readBrandDiscoveryEngineStore();
  writeBrandDiscoveryEngineStore({
    ...store,
    discoverySession: {
      ...store.discoverySession,
      inputs: { ...store.discoverySession.inputs, ...partial },
      updatedAt: new Date().toISOString(),
    },
  });
}

export function recordBrandDiscoveryEngineOpened(): void {
  const store = readBrandDiscoveryEngineStore();
  if (store.lastOpenedAt) return;
  writeBrandDiscoveryEngineStore({
    ...store,
    lastOpenedAt: new Date().toISOString(),
  });
}

export function advanceDiscoveryStep(): void {
  const store = readBrandDiscoveryEngineStore();
  const steps = ['intake', 'interview', 'synthesis', 'review', 'complete'] as const;
  const nextIndex = Math.min(store.discoverySession.stepIndex + 1, steps.length - 1);
  writeBrandDiscoveryEngineStore({
    ...store,
    discoverySession: {
      ...store.discoverySession,
      stepIndex: nextIndex,
      status: steps[nextIndex],
      updatedAt: new Date().toISOString(),
    },
  });
}

export { SEED_STRATEGIC_BRAND_DNA };
