import { readFirstEnsure } from '../sync/profile-cache';
import {
  AUTONOMOUS_PREPARATION_STORAGE_KEY,
  AUTONOMOUS_PREPARATION_VERSION,
  STUDIO_OS_AUTONOMOUS_PREPARATION_UPDATED,
} from './constants';
import { applyActionToPreparation } from './approval-workflow';
import {
  buildOrganizationAutonomousPreparationProfile,
  logApprovalToProfessionBrain,
  logRejectionToProfessionBrain,
} from './preparation-builder';
import type {
  ApprovalAction,
  AutonomousPreparationStore,
  OrganizationAutonomousPreparationProfile,
} from './types';

function emptyStore(): AutonomousPreparationStore {
  return { version: AUTONOMOUS_PREPARATION_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_AUTONOMOUS_PREPARATION_UPDATED));
  }
}

export function readAutonomousPreparationStore(): AutonomousPreparationStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(AUTONOMOUS_PREPARATION_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as AutonomousPreparationStore;
    return { ...emptyStore(), ...parsed, version: AUTONOMOUS_PREPARATION_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeAutonomousPreparationStore(store: AutonomousPreparationStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(AUTONOMOUS_PREPARATION_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationAutonomousPreparationProfile(
  organizationId: string
): OrganizationAutonomousPreparationProfile | null {
  return readAutonomousPreparationStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationAutonomousPreparationProfile): OrganizationAutonomousPreparationProfile {
  const store = readAutonomousPreparationStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeAutonomousPreparationStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncAutonomousPreparationFromSources(
  organizationId: string
): OrganizationAutonomousPreparationProfile {
  const existing = getOrganizationAutonomousPreparationProfile(organizationId);
  const profile = upsertProfile(
    buildOrganizationAutonomousPreparationProfile(organizationId, existing?.pendingPreparations)
  );
  return profile;
}

export function ensureOrganizationAutonomousPreparationProfile(organizationId: string): OrganizationAutonomousPreparationProfile {
  return readFirstEnsure(organizationId, getOrganizationAutonomousPreparationProfile, syncAutonomousPreparationFromSources);
}

export function refreshAutonomousPreparationProfile(
  organizationId: string
): OrganizationAutonomousPreparationProfile {
  return syncAutonomousPreparationFromSources(organizationId);
}

export function applyPreparationAction(
  organizationId: string,
  preparationId: string,
  action: ApprovalAction
): OrganizationAutonomousPreparationProfile | null {
  const existing = getOrganizationAutonomousPreparationProfile(organizationId);
  if (!existing) return null;

  const target = existing.pendingPreparations.find((p) => p.id === preparationId);
  if (!target) return null;

  const updatedPreparations = existing.pendingPreparations.map((p) =>
    p.id === preparationId ? applyActionToPreparation(p, action) : p
  );

  if (action === 'reject') logRejectionToProfessionBrain(organizationId, target);
  if (action === 'approve' || action === 'edit') logApprovalToProfessionBrain(organizationId, target);

  const profile = buildOrganizationAutonomousPreparationProfile(organizationId, updatedPreparations);
  return upsertProfile(profile);
}
