import {
  FOUNDER_OPERATING_SYSTEM_STORAGE_KEY,
  FOUNDER_OPERATING_SYSTEM_VERSION,
  STUDIO_OS_FOUNDER_OPERATING_SYSTEM_UPDATED,
} from './constants';
import { buildOrganizationFounderOperatingSystemProfile } from './founder-os-builder';
import type { FounderOperatingSystemStore, OrganizationFounderOperatingSystemProfile } from './types';

function emptyStore(): FounderOperatingSystemStore {
  return { version: FOUNDER_OPERATING_SYSTEM_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_FOUNDER_OPERATING_SYSTEM_UPDATED));
  }
}

export function readFounderOperatingSystemStore(): FounderOperatingSystemStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(FOUNDER_OPERATING_SYSTEM_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as FounderOperatingSystemStore;
    return { ...emptyStore(), ...parsed, version: FOUNDER_OPERATING_SYSTEM_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeFounderOperatingSystemStore(store: FounderOperatingSystemStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(FOUNDER_OPERATING_SYSTEM_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationFounderOperatingSystemProfile(
  organizationId: string
): OrganizationFounderOperatingSystemProfile | null {
  return readFounderOperatingSystemStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationFounderOperatingSystemProfile): OrganizationFounderOperatingSystemProfile {
  const store = readFounderOperatingSystemStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeFounderOperatingSystemStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncFounderOperatingSystemFromSources(
  organizationId: string
): OrganizationFounderOperatingSystemProfile {
  const profile = upsertProfile(buildOrganizationFounderOperatingSystemProfile(organizationId));
  void import('../innovation-lab/store').then((m) => {
    m.syncInnovationLabFromSources(organizationId);
  });
  return profile;
}

export function ensureOrganizationFounderOperatingSystemProfile(
  organizationId: string
): OrganizationFounderOperatingSystemProfile {
  return syncFounderOperatingSystemFromSources(organizationId);
}

export function refreshOrganizationFounderOperatingSystemProfile(
  organizationId: string
): OrganizationFounderOperatingSystemProfile {
  return syncFounderOperatingSystemFromSources(organizationId);
}
