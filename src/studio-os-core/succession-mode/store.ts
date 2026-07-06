import {
  SUCCESSION_MODE_STORAGE_KEY,
  SUCCESSION_MODE_VERSION,
  STUDIO_OS_SUCCESSION_MODE_UPDATED,
} from './constants';
import { buildOrganizationSuccessionProfile } from './succession-builder';
import type { OrganizationSuccessionProfile, SuccessionModeStore } from './types';

function emptyStore(): SuccessionModeStore {
  return { version: SUCCESSION_MODE_VERSION, profiles: [] };
}

export function readSuccessionModeStore(): SuccessionModeStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(SUCCESSION_MODE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as SuccessionModeStore;
    return { ...emptyStore(), ...parsed, version: SUCCESSION_MODE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeSuccessionModeStore(store: SuccessionModeStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(SUCCESSION_MODE_STORAGE_KEY, JSON.stringify(store));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_SUCCESSION_MODE_UPDATED));
  }
}

export function getOrganizationSuccessionProfile(organizationId: string): OrganizationSuccessionProfile | null {
  return readSuccessionModeStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

export function syncSuccessionModeFromSources(organizationId: string): OrganizationSuccessionProfile {
  const profile = buildOrganizationSuccessionProfile(organizationId);
  const store = readSuccessionModeStore();
  const next = store.profiles.filter((p) => p.organizationId !== organizationId);
  writeSuccessionModeStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function ensureOrganizationSuccessionProfile(organizationId: string): OrganizationSuccessionProfile {
  const existing = getOrganizationSuccessionProfile(organizationId);
  if (existing) return existing;
  return syncSuccessionModeFromSources(organizationId);
}
