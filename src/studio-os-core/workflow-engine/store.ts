import {
  WORKFLOW_ENGINE_STORAGE_KEY,
  WORKFLOW_ENGINE_VERSION,
  STUDIO_OS_WORKFLOW_ENGINE_UPDATED,
} from './constants';
import { buildOrganizationWorkflowEngineProfile } from './engine-profile-builder';
import type { OrganizationWorkflowEngineProfile, WorkflowEngineStore } from './types';

function emptyStore(): WorkflowEngineStore {
  return { version: WORKFLOW_ENGINE_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_WORKFLOW_ENGINE_UPDATED));
  }
}

export function readWorkflowEngineStore(): WorkflowEngineStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(WORKFLOW_ENGINE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as WorkflowEngineStore;
    return { ...emptyStore(), ...parsed, version: WORKFLOW_ENGINE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeWorkflowEngineStore(store: WorkflowEngineStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(WORKFLOW_ENGINE_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationWorkflowEngineProfile(
  organizationId: string
): OrganizationWorkflowEngineProfile | null {
  return readWorkflowEngineStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationWorkflowEngineProfile): OrganizationWorkflowEngineProfile {
  const store = readWorkflowEngineStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeWorkflowEngineStore({ ...store, profiles: [...next, profile] });
  return profile;
}

/** Rebuild visual builder, process templates, testing, and analytics from Plugin SDK + platform sources */
export function syncWorkflowEngineFromSources(organizationId: string): OrganizationWorkflowEngineProfile {
  const profile = upsertProfile(buildOrganizationWorkflowEngineProfile(organizationId));
  void import('../state-engine/store').then((m) => {
    m.syncStateEngineFromSources(organizationId);
  });
  return profile;
}

export function ensureOrganizationWorkflowEngineProfile(
  organizationId: string
): OrganizationWorkflowEngineProfile {
  return syncWorkflowEngineFromSources(organizationId);
}
