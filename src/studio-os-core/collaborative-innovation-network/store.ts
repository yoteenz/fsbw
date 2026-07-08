import { readFirstEnsure } from '../sync/profile-cache';
import {
  COLLABORATIVE_INNOVATION_NETWORK_STORAGE_KEY,
  COLLABORATIVE_INNOVATION_NETWORK_VERSION,
  STUDIO_OS_COLLABORATIVE_INNOVATION_NETWORK_UPDATED,
} from './constants';
import { buildOrganizationCollaborativeInnovationNetworkProfile } from './network-builder';
import { publishJointInnovation } from './joint-innovations';
import type {
  CollaborativeInnovationNetworkStore,
  OrganizationCollaborativeInnovationNetworkProfile,
  PublicationVisibility,
} from './types';

function emptyStore(): CollaborativeInnovationNetworkStore {
  return { version: COLLABORATIVE_INNOVATION_NETWORK_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_COLLABORATIVE_INNOVATION_NETWORK_UPDATED));
  }
}

export function readCollaborativeInnovationNetworkStore(): CollaborativeInnovationNetworkStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(COLLABORATIVE_INNOVATION_NETWORK_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as CollaborativeInnovationNetworkStore;
    return { ...emptyStore(), ...parsed, version: COLLABORATIVE_INNOVATION_NETWORK_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeCollaborativeInnovationNetworkStore(store: CollaborativeInnovationNetworkStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(COLLABORATIVE_INNOVATION_NETWORK_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationCollaborativeInnovationNetworkProfile(
  organizationId: string
): OrganizationCollaborativeInnovationNetworkProfile | null {
  return (
    readCollaborativeInnovationNetworkStore().profiles.find((p) => p.organizationId === organizationId) ??
    null
  );
}

function upsertProfile(
  profile: OrganizationCollaborativeInnovationNetworkProfile
): OrganizationCollaborativeInnovationNetworkProfile {
  const store = readCollaborativeInnovationNetworkStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeCollaborativeInnovationNetworkStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncCollaborativeInnovationNetworkFromSources(
  organizationId: string
): OrganizationCollaborativeInnovationNetworkProfile {
  return upsertProfile(buildOrganizationCollaborativeInnovationNetworkProfile(organizationId));
}

export function ensureOrganizationCollaborativeInnovationNetworkProfile(
  organizationId: string
): OrganizationCollaborativeInnovationNetworkProfile {
  return readFirstEnsure(
    organizationId,
    getOrganizationCollaborativeInnovationNetworkProfile,
    syncCollaborativeInnovationNetworkFromSources
  );
}

export function refreshOrganizationCollaborativeInnovationNetworkProfile(
  organizationId: string
): OrganizationCollaborativeInnovationNetworkProfile {
  return syncCollaborativeInnovationNetworkFromSources(organizationId);
}

export function publishJointInnovationInStore(
  organizationId: string,
  innovationId: string,
  visibility: PublicationVisibility
): OrganizationCollaborativeInnovationNetworkProfile | null {
  const profile = getOrganizationCollaborativeInnovationNetworkProfile(organizationId);
  if (!profile) return null;
  const jointInnovations = profile.jointInnovations.map((j) =>
    j.id === innovationId || j.innovationId === innovationId
      ? publishJointInnovation(j, visibility)
      : j
  );
  return upsertProfile({ ...profile, jointInnovations, updatedAt: new Date().toISOString() });
}
