import { readFirstEnsure } from '../sync/profile-cache';
import {
  EXPERIENCE_QA_STORAGE_KEY,
  EXPERIENCE_QA_VERSION,
  STUDIO_OS_EXPERIENCE_QA_UPDATED,
} from './constants';
import { buildOrganizationExperienceQaProfile } from './engine-profile-builder';
import type { ExperienceQaStore, OrganizationExperienceQaProfile } from './types';

function emptyStore(): ExperienceQaStore {
  return { version: EXPERIENCE_QA_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_EXPERIENCE_QA_UPDATED));
  }
}

export function readExperienceQaStore(): ExperienceQaStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(EXPERIENCE_QA_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ExperienceQaStore;
    return { ...emptyStore(), ...parsed, version: EXPERIENCE_QA_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeExperienceQaStore(store: ExperienceQaStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(EXPERIENCE_QA_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationExperienceQaProfile(organizationId: string): OrganizationExperienceQaProfile | null {
  return readExperienceQaStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationExperienceQaProfile): OrganizationExperienceQaProfile {
  const store = readExperienceQaStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeExperienceQaStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncExperienceQaFromSources(organizationId: string): OrganizationExperienceQaProfile {
  const existing = getOrganizationExperienceQaProfile(organizationId);
  const built = buildOrganizationExperienceQaProfile(organizationId);
  const profile = upsertProfile({
    ...built,
    selectedPageId: existing?.selectedPageId ?? built.selectedPageId,
  });
  return profile;
}

export function ensureOrganizationExperienceQaProfile(organizationId: string): OrganizationExperienceQaProfile {
  return readFirstEnsure(organizationId, getOrganizationExperienceQaProfile, syncExperienceQaFromSources);
}

export function refreshExperienceQa(organizationId: string): OrganizationExperienceQaProfile {
  return syncExperienceQaFromSources(organizationId);
}

export function selectExperiencePage(organizationId: string, pageId: string): OrganizationExperienceQaProfile {
  const profile = ensureOrganizationExperienceQaProfile(organizationId);
  return upsertProfile({ ...profile, selectedPageId: pageId, updatedAt: new Date().toISOString() });
}

export function getSelectedExperienceReport(profile: OrganizationExperienceQaProfile) {
  return profile.pageReports.find((p) => p.pageId === profile.selectedPageId) ?? profile.pageReports[0] ?? null;
}

export function getPageExperienceFindings(profile: OrganizationExperienceQaProfile, pageId: string) {
  return profile.findings.filter((f) => f.pageId === pageId);
}
