import { readFirstEnsure } from '../sync/profile-cache';
import {
  QA_HEADQUARTERS_STORAGE_KEY,
  QA_HEADQUARTERS_VERSION,
  STUDIO_OS_QA_HEADQUARTERS_UPDATED,
} from './constants';
import { buildOrganizationQaHeadquartersProfile } from './engine-profile-builder';
import type { OrganizationQaHeadquartersProfile, QaHeadquartersStore } from './types';

function emptyStore(): QaHeadquartersStore {
  return { version: QA_HEADQUARTERS_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_QA_HEADQUARTERS_UPDATED));
  }
}

export function readQaHeadquartersStore(): QaHeadquartersStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(QA_HEADQUARTERS_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as QaHeadquartersStore;
    return { ...emptyStore(), ...parsed, version: QA_HEADQUARTERS_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeQaHeadquartersStore(store: QaHeadquartersStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(QA_HEADQUARTERS_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationQaHeadquartersProfile(
  organizationId: string
): OrganizationQaHeadquartersProfile | null {
  return readQaHeadquartersStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationQaHeadquartersProfile): OrganizationQaHeadquartersProfile {
  const store = readQaHeadquartersStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeQaHeadquartersStore({ ...store, profiles: [...next, profile] });
  return profile;
}

/** Rebuild trust scores, responsibilities, and continuous validation from platform sources */
export function syncQaHeadquartersFromSources(organizationId: string): OrganizationQaHeadquartersProfile {
  const profile = upsertProfile(buildOrganizationQaHeadquartersProfile(organizationId));
  return profile;
}

export function ensureOrganizationQaHeadquartersProfile(organizationId: string): OrganizationQaHeadquartersProfile {
  return readFirstEnsure(organizationId, getOrganizationQaHeadquartersProfile, syncQaHeadquartersFromSources);
}

export function triggerContinuousValidation(
  organizationId: string,
  _trigger: OrganizationQaHeadquartersProfile['recentValidations'][0]['trigger']
): OrganizationQaHeadquartersProfile {
  return syncQaHeadquartersFromSources(organizationId);
}
