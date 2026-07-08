/**
 * Career Worlds™ — orchestration engine (Profession Simulation Engine™ extension).
 * Reusable across every profession blueprint; no single-world hardcoding.
 */

import { CAREER_WORLD_BLUEPRINT_BY_ID } from './catalog';
import { buildCareerHubViewModel } from './career-hub/builder';
import {
  ensureCareerWorldSave,
  loadCareerWorldSave,
  saveCareerWorldSave,
} from './persistence/save-store';
import { runSimulationTick } from './simulation/tick-engine';
import type { CareerHubViewModel } from './career-hub/builder';
import type { CareerWorldSave } from './core/schemas';
import type { CareerWorldBlueprint, CareerWorldId } from './types';

export type { CareerHubViewModel, CareerWorldBlueprint, CareerWorldSave };

export function getCareerWorld(worldId: CareerWorldId): CareerWorldBlueprint | undefined {
  return CAREER_WORLD_BLUEPRINT_BY_ID[worldId];
}

export function listCareerWorlds(): CareerWorldBlueprint[] {
  return Object.values(CAREER_WORLD_BLUEPRINT_BY_ID);
}

/** Load or create persistent save for a learner in a world. */
export function bootstrapCareerWorld(worldId: CareerWorldId, learnerId: string): CareerWorldSave {
  return ensureCareerWorldSave(worldId, learnerId);
}

/** Advance simulation when player returns (offline catch-up + live tick). */
export function syncCareerWorldOnReturn(
  worldId: CareerWorldId,
  learnerId: string,
  options?: { maxSimDays?: number },
): CareerWorldSave {
  const save = ensureCareerWorldSave(worldId, learnerId);
  const result = runSimulationTick(
    save,
    options?.maxSimDays ? { forceDays: options.maxSimDays } : undefined,
  );
  saveCareerWorldSave(result.save);
  return result.save;
}

/** Read save without advancing time. */
export function readCareerWorldSave(
  worldId: CareerWorldId,
  learnerId: string,
): CareerWorldSave | null {
  return loadCareerWorldSave(worldId, learnerId);
}

/** Build Career Hub view model (replaces course dashboard). */
export function getCareerHub(
  worldId: CareerWorldId,
  learnerId: string,
): CareerHubViewModel | null {
  const save = loadCareerWorldSave(worldId, learnerId);
  if (!save) return null;
  return buildCareerHubViewModel(save);
}

/** Persist manual mutations (UI actions, admin tools). */
export function persistCareerWorldSave(save: CareerWorldSave): CareerWorldSave {
  saveCareerWorldSave(save);
  return save;
}

export { runSimulationTick, buildCareerHubViewModel };
