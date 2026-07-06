import {
  DIGITAL_TWIN_STORAGE_KEY,
  DIGITAL_TWIN_VERSION,
  STUDIO_OS_DIGITAL_TWIN_UPDATED,
} from './constants';
import { runWhatIfSimulation } from './scenario-engine';
import { buildOrganizationDigitalTwinProfile } from './twin-builder';
import type { OrganizationDigitalTwinProfile, OrganizationDigitalTwinStore, WhatIfSimulationResult } from './types';

function emptyStore(): OrganizationDigitalTwinStore {
  return { version: DIGITAL_TWIN_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_DIGITAL_TWIN_UPDATED));
  }
}

export function readDigitalTwinStore(): OrganizationDigitalTwinStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(DIGITAL_TWIN_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as OrganizationDigitalTwinStore;
    return { ...emptyStore(), ...parsed, version: DIGITAL_TWIN_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeDigitalTwinStore(store: OrganizationDigitalTwinStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(DIGITAL_TWIN_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationDigitalTwinProfile(organizationId: string): OrganizationDigitalTwinProfile | null {
  return readDigitalTwinStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationDigitalTwinProfile): OrganizationDigitalTwinProfile {
  const store = readDigitalTwinStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeDigitalTwinStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncDigitalTwinFromSources(organizationId: string): OrganizationDigitalTwinProfile {
  const existing = getOrganizationDigitalTwinProfile(organizationId);
  const profile = buildOrganizationDigitalTwinProfile(organizationId, existing);
  return upsertProfile({ ...profile, simulationHistory: existing?.simulationHistory ?? [] });
}

export function ensureOrganizationDigitalTwinProfile(organizationId: string): OrganizationDigitalTwinProfile {
  const existing = getOrganizationDigitalTwinProfile(organizationId);
  if (existing) return syncDigitalTwinFromSources(organizationId);
  return syncDigitalTwinFromSources(organizationId);
}

export function runSandboxWhatIfSimulation(
  organizationId: string,
  query: string
): WhatIfSimulationResult {
  const profile = ensureOrganizationDigitalTwinProfile(organizationId);
  const result = runWhatIfSimulation(profile, query);
  const updated: OrganizationDigitalTwinProfile = {
    ...profile,
    simulationHistory: [result, ...profile.simulationHistory].slice(0, 25),
    updatedAt: new Date().toISOString(),
  };
  upsertProfile(updated);
  return result;
}

export function getLatestSimulation(organizationId: string): WhatIfSimulationResult | null {
  const profile = getOrganizationDigitalTwinProfile(organizationId);
  return profile?.simulationHistory[0] ?? null;
}
