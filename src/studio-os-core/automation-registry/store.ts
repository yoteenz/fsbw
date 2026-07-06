import { readFirstEnsure } from '../sync/profile-cache';
import {
  AUTOMATION_REGISTRY_STORAGE_KEY,
  AUTOMATION_REGISTRY_VERSION,
  STUDIO_OS_AUTOMATION_REGISTRY_UPDATED,
} from './constants';
import { buildOrganizationAutomationRegistryProfile } from './engine-profile-builder';
import type { AutomationRegistryStore, OrganizationAutomationRegistryProfile } from './types';

function emptyStore(): AutomationRegistryStore {
  return { version: AUTOMATION_REGISTRY_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_AUTOMATION_REGISTRY_UPDATED));
  }
}

export function readAutomationRegistryStore(): AutomationRegistryStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(AUTOMATION_REGISTRY_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as AutomationRegistryStore;
    return { ...emptyStore(), ...parsed, version: AUTOMATION_REGISTRY_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeAutomationRegistryStore(store: AutomationRegistryStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(AUTOMATION_REGISTRY_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationAutomationRegistryProfile(
  organizationId: string
): OrganizationAutomationRegistryProfile | null {
  return readAutomationRegistryStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationAutomationRegistryProfile): OrganizationAutomationRegistryProfile {
  const store = readAutomationRegistryStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeAutomationRegistryStore({ ...store, profiles: [...next, profile] });
  return profile;
}

/** Rebuild automation catalog, dashboard, and governance from Event Bus + platform sources */
export function syncAutomationRegistryFromSources(
  organizationId: string
): OrganizationAutomationRegistryProfile {
  const existing = getOrganizationAutomationRegistryProfile(organizationId);
  const rebuilt = buildOrganizationAutomationRegistryProfile(organizationId);
  if (existing?.executionHistory?.length) {
    rebuilt.executionHistory = existing.executionHistory;
  }
  return upsertProfile(rebuilt);
}

export function ensureOrganizationAutomationRegistryProfile(organizationId: string): OrganizationAutomationRegistryProfile {
  return readFirstEnsure(organizationId, getOrganizationAutomationRegistryProfile, syncAutomationRegistryFromSources);
}

export function pauseAutomationsMatching(
  organizationId: string,
  matcher: (name: string, category: string, department: string) => boolean
): OrganizationAutomationRegistryProfile {
  const profile = getOrganizationAutomationRegistryProfile(organizationId) ?? syncAutomationRegistryFromSources(organizationId);
  const automations = profile.automations.map((a) =>
    matcher(a.name, a.category, a.department) ? { ...a, status: 'paused' as const } : a
  );
  return upsertProfile({
    ...profile,
    automations,
    activeCount: automations.filter((a) => a.status === 'active').length,
    pausedCount: automations.filter((a) => a.status === 'paused').length,
    updatedAt: new Date().toISOString(),
  });
}
