import {
  POLICY_ENGINE_STORAGE_KEY,
  POLICY_ENGINE_VERSION,
  STUDIO_OS_POLICY_ENGINE_UPDATED,
} from './constants';
import { buildOrganizationPolicyEngineProfile } from './engine-profile-builder';
import type { OrganizationPolicyEngineProfile, PolicyEngineStore, PolicySimulationResult } from './types';

function emptyStore(): PolicyEngineStore {
  return { version: POLICY_ENGINE_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_POLICY_ENGINE_UPDATED));
  }
}

export function readPolicyEngineStore(): PolicyEngineStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(POLICY_ENGINE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as PolicyEngineStore;
    return { ...emptyStore(), ...parsed, version: POLICY_ENGINE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writePolicyEngineStore(store: PolicyEngineStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(POLICY_ENGINE_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationPolicyEngineProfile(
  organizationId: string
): OrganizationPolicyEngineProfile | null {
  return readPolicyEngineStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationPolicyEngineProfile): OrganizationPolicyEngineProfile {
  const store = readPolicyEngineStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writePolicyEngineStore({ ...store, profiles: [...next, profile] });
  return profile;
}

function chainPermissionEngineSync(organizationId: string): void {
  void import('../permission-engine/store').then((m) => {
    m.syncPermissionEngineFromSources(organizationId);
  });
}

/** Rebuild policy catalog, hierarchy, enforcement, and simulation from Prompt Registry + platform sources */
export function syncPolicyEngineFromSources(organizationId: string): OrganizationPolicyEngineProfile {
  const existing = getOrganizationPolicyEngineProfile(organizationId);
  const rebuilt = buildOrganizationPolicyEngineProfile(organizationId);
  if (existing?.enforcementHistory?.length) {
    rebuilt.enforcementHistory = existing.enforcementHistory;
  }
  if (existing?.simulationResults?.length) {
    rebuilt.simulationResults = existing.simulationResults;
  }
  const profile = upsertProfile(rebuilt);
  chainPermissionEngineSync(organizationId);
  return profile;
}

export function ensureOrganizationPolicyEngineProfile(
  organizationId: string
): OrganizationPolicyEngineProfile {
  return syncPolicyEngineFromSources(organizationId);
}

export function appendPolicySimulationResult(
  organizationId: string,
  result: PolicySimulationResult
): OrganizationPolicyEngineProfile {
  const profile =
    getOrganizationPolicyEngineProfile(organizationId) ?? syncPolicyEngineFromSources(organizationId);
  return upsertProfile({
    ...profile,
    simulationResults: [result, ...profile.simulationResults].slice(0, 40),
    updatedAt: new Date().toISOString(),
  });
}
