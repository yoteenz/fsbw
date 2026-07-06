import {
  WORKSPACE_RUNTIME_STORAGE_KEY,
  WORKSPACE_RUNTIME_VERSION,
  STUDIO_OS_WORKSPACE_RUNTIME_UPDATED,
} from './constants';
import { buildOrganizationWorkspaceRuntimeProfile } from './engine-profile-builder';
import type { OrganizationWorkspaceRuntimeProfile, WorkspaceRuntimeStore } from './types';

function emptyStore(): WorkspaceRuntimeStore {
  return { version: WORKSPACE_RUNTIME_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_WORKSPACE_RUNTIME_UPDATED));
  }
}

export function readWorkspaceRuntimeStore(): WorkspaceRuntimeStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(WORKSPACE_RUNTIME_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as WorkspaceRuntimeStore;
    return { ...emptyStore(), ...parsed, version: WORKSPACE_RUNTIME_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeWorkspaceRuntimeStore(store: WorkspaceRuntimeStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(WORKSPACE_RUNTIME_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationWorkspaceRuntimeProfile(
  organizationId: string
): OrganizationWorkspaceRuntimeProfile | null {
  return readWorkspaceRuntimeStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationWorkspaceRuntimeProfile): OrganizationWorkspaceRuntimeProfile {
  const store = readWorkspaceRuntimeStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeWorkspaceRuntimeStore({ ...store, profiles: [...next, profile] });
  return profile;
}

/** Rebuild isolated runtime, configuration, sandboxes, and health from Permission Engine + platform sources */
export function syncWorkspaceRuntimeFromSources(organizationId: string): OrganizationWorkspaceRuntimeProfile {
  const existing = getOrganizationWorkspaceRuntimeProfile(organizationId);
  const rebuilt = buildOrganizationWorkspaceRuntimeProfile(organizationId);
  if (existing?.activeSandbox) {
    rebuilt.activeSandbox = existing.activeSandbox;
  }
  return upsertProfile(rebuilt);
}

export function ensureOrganizationWorkspaceRuntimeProfile(
  organizationId: string
): OrganizationWorkspaceRuntimeProfile {
  return syncWorkspaceRuntimeFromSources(organizationId);
}

export function setActiveSandbox(
  organizationId: string,
  sandbox: OrganizationWorkspaceRuntimeProfile['activeSandbox']
): OrganizationWorkspaceRuntimeProfile {
  const profile =
    getOrganizationWorkspaceRuntimeProfile(organizationId) ?? syncWorkspaceRuntimeFromSources(organizationId);
  return upsertProfile({ ...profile, activeSandbox: sandbox, updatedAt: new Date().toISOString() });
}
