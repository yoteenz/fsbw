import { updateBuildOrderSystemStatus } from '../../build-order/build-order/registry';
import { ensureEvolutionRoomSubsystem } from '../../evolution-room/engine';
import { seedReflectionArtifacts } from '../engines/artifact-engine';
import { seedBoardroomPackets } from '../engines/future-opportunity-engine';
import { mutateExecutiveReflectionSuiteStore, readExecutiveReflectionSuiteStore } from '../persistence';
import { ERS_SUBSYSTEM_VERSION } from '../constants';
import type { ErsStore } from '../types';

function now(): string {
  return new Date().toISOString();
}

export function seedExecutiveReflectionSuiteStore(): void {
  mutateExecutiveReflectionSuiteStore((s: ErsStore) => ({
    ...s,
    seededAt: s.seededAt ?? now(),
    bootstrappedAt: now(),
    version: ERS_SUBSYSTEM_VERSION,
  }));
  seedReflectionArtifacts();
  seedBoardroomPackets();
}

export function ensureExecutiveReflectionSuiteStore() {
  ensureEvolutionRoomSubsystem();
  const store = readExecutiveReflectionSuiteStore();
  if (!store.seededAt) {
    seedExecutiveReflectionSuiteStore();
    updateBuildOrderSystemStatus('executive-reflection-suite', 'implemented');
  }
  return readExecutiveReflectionSuiteStore();
}

export function recordExecutiveReflectionSuiteOpened(): void {
  mutateExecutiveReflectionSuiteStore((s: ErsStore) => ({
    ...s,
    lastOpenedAt: now(),
  }));
}
