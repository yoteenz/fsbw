import { readFirstEnsure } from '../sync/profile-cache';
import {
  INNOVATION_LINEAGE_STORAGE_KEY,
  INNOVATION_LINEAGE_VERSION,
  STUDIO_OS_INNOVATION_LINEAGE_UPDATED,
} from './constants';
import { buildOrganizationInnovationLineageProfile } from './lineage-builder';
import { recordForkAction } from './forking-engine';
import type {
  ForkAction,
  InnovationLineageStore,
  OrganizationInnovationLineageProfile,
} from './types';

function emptyStore(): InnovationLineageStore {
  return { version: INNOVATION_LINEAGE_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_INNOVATION_LINEAGE_UPDATED));
  }
}

export function readInnovationLineageStore(): InnovationLineageStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(INNOVATION_LINEAGE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as InnovationLineageStore;
    return { ...emptyStore(), ...parsed, version: INNOVATION_LINEAGE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeInnovationLineageStore(store: InnovationLineageStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(INNOVATION_LINEAGE_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationInnovationLineageProfile(
  organizationId: string
): OrganizationInnovationLineageProfile | null {
  return readInnovationLineageStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationInnovationLineageProfile): OrganizationInnovationLineageProfile {
  const store = readInnovationLineageStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeInnovationLineageStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncInnovationLineageFromSources(
  organizationId: string
): OrganizationInnovationLineageProfile {
  return upsertProfile(buildOrganizationInnovationLineageProfile(organizationId));
}

export function ensureOrganizationInnovationLineageProfile(
  organizationId: string
): OrganizationInnovationLineageProfile {
  return readFirstEnsure(
    organizationId,
    getOrganizationInnovationLineageProfile,
    syncInnovationLineageFromSources
  );
}

export function refreshOrganizationInnovationLineageProfile(
  organizationId: string
): OrganizationInnovationLineageProfile {
  return syncInnovationLineageFromSources(organizationId);
}

export function recordLineageForkInStore(
  organizationId: string,
  parentInnovationId: string,
  childInnovationId: string,
  action: ForkAction,
  actorName: string
): OrganizationInnovationLineageProfile | null {
  const profile = getOrganizationInnovationLineageProfile(organizationId);
  if (!profile) return null;
  const forkRecords = [...profile.forkRecords, recordForkAction(parentInnovationId, childInnovationId, action, actorName)];
  return upsertProfile({ ...profile, forkRecords, updatedAt: new Date().toISOString() });
}
