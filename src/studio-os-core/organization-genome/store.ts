import {
  ORGANIZATION_GENOME_STORAGE_KEY,
  ORGANIZATION_GENOME_VERSION,
  STUDIO_OS_ORGANIZATION_GENOME_UPDATED,
} from './constants';
import { buildOrganizationGenomeProfile } from './genome-builder';
import type { OrganizationGenomeProfile, OrganizationGenomeStore } from './types';

function emptyStore(): OrganizationGenomeStore {
  return { version: ORGANIZATION_GENOME_VERSION, profiles: [] };
}

export function readOrganizationGenomeStore(): OrganizationGenomeStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(ORGANIZATION_GENOME_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as OrganizationGenomeStore;
    return { ...emptyStore(), ...parsed, version: ORGANIZATION_GENOME_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeOrganizationGenomeStore(store: OrganizationGenomeStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(ORGANIZATION_GENOME_STORAGE_KEY, JSON.stringify(store));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_ORGANIZATION_GENOME_UPDATED));
  }
}

export function getOrganizationGenomeProfile(organizationId: string): OrganizationGenomeProfile | null {
  return readOrganizationGenomeStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

export function syncOrganizationGenomeFromSources(
  organizationId: string
): OrganizationGenomeProfile {
  const profile = buildOrganizationGenomeProfile(organizationId);
  const store = readOrganizationGenomeStore();
  const next = store.profiles.filter((p) => p.organizationId !== organizationId);
  writeOrganizationGenomeStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function ensureOrganizationGenomeProfile(organizationId: string): OrganizationGenomeProfile {
  const existing = getOrganizationGenomeProfile(organizationId);
  if (existing) return existing;
  return syncOrganizationGenomeFromSources(organizationId);
}
