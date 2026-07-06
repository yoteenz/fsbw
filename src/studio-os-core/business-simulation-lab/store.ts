import {
  SIMULATION_LAB_STORAGE_KEY,
  SIMULATION_LAB_VERSION,
  STUDIO_OS_SIMULATION_LAB_UPDATED,
} from './constants';
import { buildOrganizationSimulationLabProfile } from './lab-builder';
import { runBusinessSimulation, updateScenarioLibraryDecision } from './simulation-engine';
import type {
  BusinessSimulationReport,
  OrganizationSimulationLabProfile,
  BusinessSimulationLabStore,
  ScenarioLibraryEntry,
} from './types';

function emptyStore(): BusinessSimulationLabStore {
  return { version: SIMULATION_LAB_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_SIMULATION_LAB_UPDATED));
  }
}

export function readSimulationLabStore(): BusinessSimulationLabStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(SIMULATION_LAB_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as BusinessSimulationLabStore;
    return { ...emptyStore(), ...parsed, version: SIMULATION_LAB_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeSimulationLabStore(store: BusinessSimulationLabStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(SIMULATION_LAB_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationSimulationLabProfile(organizationId: string): OrganizationSimulationLabProfile | null {
  return readSimulationLabStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationSimulationLabProfile): OrganizationSimulationLabProfile {
  const store = readSimulationLabStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeSimulationLabStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncSimulationLabFromSources(organizationId: string): OrganizationSimulationLabProfile {
  const existing = getOrganizationSimulationLabProfile(organizationId);
  const profile = buildOrganizationSimulationLabProfile(organizationId, existing);
  return upsertProfile({
    ...profile,
    reports: existing?.reports ?? [],
    scenarioLibrary: existing?.scenarioLibrary ?? [],
    totalSimulationsRun: existing?.reports.length ?? 0,
    scenariosPendingDecision: (existing?.scenarioLibrary ?? []).filter((s) => s.decision === 'pending').length,
  });
}

export function ensureOrganizationSimulationLabProfile(organizationId: string): OrganizationSimulationLabProfile {
  const existing = getOrganizationSimulationLabProfile(organizationId);
  if (existing) return syncSimulationLabFromSources(organizationId);
  return syncSimulationLabFromSources(organizationId);
}

export function runLabSimulation(organizationId: string, query: string): BusinessSimulationReport {
  const profile = ensureOrganizationSimulationLabProfile(organizationId);
  const { report, libraryEntry } = runBusinessSimulation(profile, query);

  const updated: OrganizationSimulationLabProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
    totalSimulationsRun: profile.totalSimulationsRun + 1,
    scenariosPendingDecision: profile.scenariosPendingDecision + 1,
    reports: [report, ...profile.reports].slice(0, 30),
    scenarioLibrary: [libraryEntry, ...profile.scenarioLibrary].slice(0, 40),
  };

  upsertProfile(updated);
  return report;
}

export function resolveScenarioDecision(
  organizationId: string,
  scenarioId: string,
  decision: ScenarioLibraryEntry['decision'],
  actualResults?: string,
  lessonsLearned?: string[]
): OrganizationSimulationLabProfile | null {
  const profile = getOrganizationSimulationLabProfile(organizationId);
  if (!profile) return null;

  const scenarioLibrary = profile.scenarioLibrary.map((entry) =>
    entry.id === scenarioId
      ? updateScenarioLibraryDecision(entry, decision, actualResults, lessonsLearned)
      : entry
  );

  return upsertProfile({
    ...profile,
    scenarioLibrary,
    scenariosPendingDecision: scenarioLibrary.filter((s) => s.decision === 'pending').length,
    updatedAt: new Date().toISOString(),
  });
}

export function getLatestLabReport(organizationId: string): BusinessSimulationReport | null {
  const profile = getOrganizationSimulationLabProfile(organizationId);
  return profile?.reports[0] ?? null;
}
