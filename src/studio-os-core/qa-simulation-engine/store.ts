import { readFirstEnsure } from '../sync/profile-cache';
import {
  QA_SIMULATION_ENGINE_STORAGE_KEY,
  QA_SIMULATION_ENGINE_VERSION,
  STUDIO_OS_QA_SIMULATION_ENGINE_UPDATED,
} from './constants';
import { buildOrganizationQaSimulationEngineProfile } from './engine-profile-builder';
import type { OrganizationQaSimulationEngineProfile, QaSimulationEngineStore, SimulationPersona, SimulationScenario } from './types';

function emptyStore(): QaSimulationEngineStore {
  return { version: QA_SIMULATION_ENGINE_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_QA_SIMULATION_ENGINE_UPDATED));
  }
}

export function readQaSimulationEngineStore(): QaSimulationEngineStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(QA_SIMULATION_ENGINE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as QaSimulationEngineStore;
    return { ...emptyStore(), ...parsed, version: QA_SIMULATION_ENGINE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeQaSimulationEngineStore(store: QaSimulationEngineStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(QA_SIMULATION_ENGINE_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationQaSimulationEngineProfile(
  organizationId: string
): OrganizationQaSimulationEngineProfile | null {
  return readQaSimulationEngineStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationQaSimulationEngineProfile): OrganizationQaSimulationEngineProfile {
  const store = readQaSimulationEngineStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeQaSimulationEngineStore({ ...store, profiles: [...next, profile] });
  return profile;
}

/** Rebuild simulation runs and production gates from QA Inspector + platform sources */
export function syncQaSimulationEngineFromSources(organizationId: string): OrganizationQaSimulationEngineProfile {
  const profile = upsertProfile(buildOrganizationQaSimulationEngineProfile(organizationId));
  return profile;
}

export function ensureOrganizationQaSimulationEngineProfile(organizationId: string): OrganizationQaSimulationEngineProfile {
  return readFirstEnsure(organizationId, getOrganizationQaSimulationEngineProfile, syncQaSimulationEngineFromSources);
}

export function runSimulation(
  organizationId: string,
  _persona: SimulationPersona,
  _scenario: SimulationScenario
): OrganizationQaSimulationEngineProfile {
  return syncQaSimulationEngineFromSources(organizationId);
}
