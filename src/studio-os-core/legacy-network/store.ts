import {
  LEGACY_NETWORK_STORAGE_KEY,
  LEGACY_NETWORK_VERSION,
  STUDIO_OS_LEGACY_NETWORK_UPDATED,
} from './constants';
import { buildOrganizationLegacyNetworkProfile } from './legacy-network-builder';
import type { LegacyNetworkStore, OrganizationLegacyNetworkProfile } from './types';

function emptyStore(): LegacyNetworkStore {
  return { version: LEGACY_NETWORK_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_LEGACY_NETWORK_UPDATED));
  }
}

export function readLegacyNetworkStore(): LegacyNetworkStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(LEGACY_NETWORK_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as LegacyNetworkStore;
    return { ...emptyStore(), ...parsed, version: LEGACY_NETWORK_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeLegacyNetworkStore(store: LegacyNetworkStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(LEGACY_NETWORK_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationLegacyNetworkProfile(
  organizationId: string
): OrganizationLegacyNetworkProfile | null {
  return readLegacyNetworkStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationLegacyNetworkProfile): OrganizationLegacyNetworkProfile {
  const store = readLegacyNetworkStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeLegacyNetworkStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncLegacyNetworkFromSources(organizationId: string): OrganizationLegacyNetworkProfile {
  return upsertProfile(buildOrganizationLegacyNetworkProfile(organizationId));
}

export function ensureOrganizationLegacyNetworkProfile(
  organizationId: string
): OrganizationLegacyNetworkProfile {
  return syncLegacyNetworkFromSources(organizationId);
}

export function refreshOrganizationLegacyNetworkProfile(
  organizationId: string
): OrganizationLegacyNetworkProfile {
  return syncLegacyNetworkFromSources(organizationId);
}
