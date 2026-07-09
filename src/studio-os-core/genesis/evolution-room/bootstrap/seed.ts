import { updateBuildOrderSystemStatus } from '../../build-order/build-order/registry';
import { ensureLiveValidationSystemSubsystem } from '../../live-validation-system/engine';
import { seedLegacyWall } from '../legacy-wall/legacy-engine';
import { seedFutureWall } from '../future-wall/future-engine';
import { seedAutomationSuggestions } from '../automation/automation-engine';
import { seedStrategicPriorities } from '../priorities/priorities-engine';
import { mutateEvolutionRoomStore, readEvolutionRoomStore } from '../persistence';
import { ER_SUBSYSTEM_VERSION } from '../constants';
import type { ErStore } from '../types';

function now(): string {
  return new Date().toISOString();
}

export function seedEvolutionRoomStore(): void {
  mutateEvolutionRoomStore((s: ErStore) => ({
    ...s,
    seededAt: s.seededAt ?? now(),
    bootstrappedAt: now(),
    version: ER_SUBSYSTEM_VERSION,
  }));
  seedLegacyWall();
  seedFutureWall();
  seedAutomationSuggestions();
  seedStrategicPriorities();
}

export function ensureEvolutionRoomStore() {
  ensureLiveValidationSystemSubsystem();
  const store = readEvolutionRoomStore();
  if (!store.seededAt) {
    seedEvolutionRoomStore();
    updateBuildOrderSystemStatus('evolution-room', 'implemented');
  }
  return readEvolutionRoomStore();
}

export function recordEvolutionRoomOpened(): void {
  mutateEvolutionRoomStore((s: ErStore) => ({
    ...s,
    lastOpenedAt: now(),
  }));
}
