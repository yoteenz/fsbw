import { readFirstEnsure } from '../sync/profile-cache';
import {
  SKILL_GRAPH_STORAGE_KEY,
  SKILL_GRAPH_VERSION,
  STUDIO_OS_SKILL_GRAPH_UPDATED,
} from './constants';
import { buildOrganizationSkillGraphProfile } from './graph-builder';
import type { OrganizationSkillGraphProfile, SkillGraphStore } from './types';

function emptyStore(): SkillGraphStore {
  return { version: SKILL_GRAPH_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_SKILL_GRAPH_UPDATED));
  }
}

export function readSkillGraphStore(): SkillGraphStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(SKILL_GRAPH_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as SkillGraphStore;
    return { ...emptyStore(), ...parsed, version: SKILL_GRAPH_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeSkillGraphStore(store: SkillGraphStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(SKILL_GRAPH_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationSkillGraphProfile(organizationId: string): OrganizationSkillGraphProfile | null {
  return readSkillGraphStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationSkillGraphProfile): OrganizationSkillGraphProfile {
  const store = readSkillGraphStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeSkillGraphStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncSkillGraphFromSources(organizationId: string): OrganizationSkillGraphProfile {
  const existing = getOrganizationSkillGraphProfile(organizationId);
  const built = buildOrganizationSkillGraphProfile(organizationId);
  return upsertProfile({
    ...built,
    selectedSkillId: existing?.selectedSkillId ?? built.selectedSkillId,
  });
}

export function ensureOrganizationSkillGraphProfile(organizationId: string): OrganizationSkillGraphProfile {
  return readFirstEnsure(organizationId, getOrganizationSkillGraphProfile, syncSkillGraphFromSources);
}

export function refreshSkillGraph(organizationId: string): OrganizationSkillGraphProfile {
  return syncSkillGraphFromSources(organizationId);
}

function withProfile(
  organizationId: string,
  update: (p: OrganizationSkillGraphProfile) => OrganizationSkillGraphProfile
): OrganizationSkillGraphProfile {
  const profile = ensureOrganizationSkillGraphProfile(organizationId);
  return upsertProfile(update({ ...profile, updatedAt: new Date().toISOString() }));
}

export function selectSkill(organizationId: string, skillId: string): OrganizationSkillGraphProfile {
  return withProfile(organizationId, (p) => ({ ...p, selectedSkillId: skillId }));
}
