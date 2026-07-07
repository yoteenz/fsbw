import { readFirstEnsure } from '../sync/profile-cache';
import {
  ROLE_INTELLIGENCE_STORAGE_KEY,
  ROLE_INTELLIGENCE_VERSION,
  STUDIO_OS_ROLE_INTELLIGENCE_UPDATED,
} from './constants';
import { buildOrganizationRoleIntelligenceProfile } from './role-builder';
import type { OrganizationRoleIntelligenceProfile, RoleIntelligenceStore } from './types';

function emptyStore(): RoleIntelligenceStore {
  return { version: ROLE_INTELLIGENCE_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_ROLE_INTELLIGENCE_UPDATED));
  }
}

export function readRoleIntelligenceStore(): RoleIntelligenceStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(ROLE_INTELLIGENCE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as RoleIntelligenceStore;
    return { ...emptyStore(), ...parsed, version: ROLE_INTELLIGENCE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeRoleIntelligenceStore(store: RoleIntelligenceStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(ROLE_INTELLIGENCE_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationRoleIntelligenceProfile(
  organizationId: string
): OrganizationRoleIntelligenceProfile | null {
  return readRoleIntelligenceStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationRoleIntelligenceProfile): OrganizationRoleIntelligenceProfile {
  const store = readRoleIntelligenceStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeRoleIntelligenceStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncRoleIntelligenceFromSources(organizationId: string): OrganizationRoleIntelligenceProfile {
  const existing = getOrganizationRoleIntelligenceProfile(organizationId);
  const built = buildOrganizationRoleIntelligenceProfile(organizationId);
  return upsertProfile({
    ...built,
    selectedRoleId: existing?.selectedRoleId ?? built.selectedRoleId,
  });
}

export function ensureOrganizationRoleIntelligenceProfile(
  organizationId: string
): OrganizationRoleIntelligenceProfile {
  return readFirstEnsure(organizationId, getOrganizationRoleIntelligenceProfile, syncRoleIntelligenceFromSources);
}

export function refreshRoleIntelligence(organizationId: string): OrganizationRoleIntelligenceProfile {
  return syncRoleIntelligenceFromSources(organizationId);
}

function withProfile(
  organizationId: string,
  update: (p: OrganizationRoleIntelligenceProfile) => OrganizationRoleIntelligenceProfile
): OrganizationRoleIntelligenceProfile {
  const profile = ensureOrganizationRoleIntelligenceProfile(organizationId);
  return upsertProfile(update({ ...profile, updatedAt: new Date().toISOString() }));
}

export function selectRole(organizationId: string, roleId: string): OrganizationRoleIntelligenceProfile {
  return withProfile(organizationId, (p) => ({ ...p, selectedRoleId: roleId }));
}
