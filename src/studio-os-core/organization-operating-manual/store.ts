import {
  ORGANIZATION_OPERATING_MANUAL_STORAGE_KEY,
  ORGANIZATION_OPERATING_MANUAL_VERSION,
  STUDIO_OS_ORGANIZATION_OPERATING_MANUAL_UPDATED,
} from './constants';
import { buildOrganizationOperatingManualProfile } from './operating-manual-builder';
import type { OrganizationOperatingManualProfile, OrganizationOperatingManualStore } from './types';

function emptyStore(): OrganizationOperatingManualStore {
  return { version: ORGANIZATION_OPERATING_MANUAL_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_ORGANIZATION_OPERATING_MANUAL_UPDATED));
  }
}

export function readOrganizationOperatingManualStore(): OrganizationOperatingManualStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(ORGANIZATION_OPERATING_MANUAL_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as OrganizationOperatingManualStore;
    return { ...emptyStore(), ...parsed, version: ORGANIZATION_OPERATING_MANUAL_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeOrganizationOperatingManualStore(store: OrganizationOperatingManualStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(ORGANIZATION_OPERATING_MANUAL_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationOperatingManualProfile(
  organizationId: string
): OrganizationOperatingManualProfile | null {
  return readOrganizationOperatingManualStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationOperatingManualProfile): OrganizationOperatingManualProfile {
  const store = readOrganizationOperatingManualStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeOrganizationOperatingManualStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncOrganizationOperatingManualFromSources(
  organizationId: string
): OrganizationOperatingManualProfile {
  return upsertProfile(buildOrganizationOperatingManualProfile(organizationId));
}

export function ensureOrganizationOperatingManualProfile(
  organizationId: string
): OrganizationOperatingManualProfile {
  return syncOrganizationOperatingManualFromSources(organizationId);
}

export function refreshOrganizationOperatingManualProfile(
  organizationId: string
): OrganizationOperatingManualProfile {
  return syncOrganizationOperatingManualFromSources(organizationId);
}
