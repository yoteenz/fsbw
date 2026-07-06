import { readFirstEnsure } from '../sync/profile-cache';
import {
  ACCESSIBILITY_AUDITOR_STORAGE_KEY,
  ACCESSIBILITY_AUDITOR_VERSION,
  STUDIO_OS_ACCESSIBILITY_AUDITOR_UPDATED,
} from './constants';
import { buildOrganizationAccessibilityAuditorProfile } from './engine-profile-builder';
import type { AccessibilityAuditorStore, OrganizationAccessibilityAuditorProfile } from './types';

function emptyStore(): AccessibilityAuditorStore {
  return { version: ACCESSIBILITY_AUDITOR_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_ACCESSIBILITY_AUDITOR_UPDATED));
  }
}

export function readAccessibilityAuditorStore(): AccessibilityAuditorStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(ACCESSIBILITY_AUDITOR_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as AccessibilityAuditorStore;
    return { ...emptyStore(), ...parsed, version: ACCESSIBILITY_AUDITOR_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeAccessibilityAuditorStore(store: AccessibilityAuditorStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(ACCESSIBILITY_AUDITOR_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationAccessibilityAuditorProfile(
  organizationId: string
): OrganizationAccessibilityAuditorProfile | null {
  return readAccessibilityAuditorStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationAccessibilityAuditorProfile): OrganizationAccessibilityAuditorProfile {
  const store = readAccessibilityAuditorStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeAccessibilityAuditorStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncAccessibilityAuditorFromSources(
  organizationId: string
): OrganizationAccessibilityAuditorProfile {
  const existing = getOrganizationAccessibilityAuditorProfile(organizationId);
  const built = buildOrganizationAccessibilityAuditorProfile(organizationId);
  const profile = upsertProfile({
    ...built,
    selectedPageId: existing?.selectedPageId ?? built.selectedPageId,
  });
  return profile;
}

export function ensureOrganizationAccessibilityAuditorProfile(organizationId: string): OrganizationAccessibilityAuditorProfile {
  return readFirstEnsure(organizationId, getOrganizationAccessibilityAuditorProfile, syncAccessibilityAuditorFromSources);
}

export function refreshAccessibilityAuditor(organizationId: string): OrganizationAccessibilityAuditorProfile {
  return syncAccessibilityAuditorFromSources(organizationId);
}

export function selectAccessibilityPage(organizationId: string, pageId: string): OrganizationAccessibilityAuditorProfile {
  const profile = ensureOrganizationAccessibilityAuditorProfile(organizationId);
  return upsertProfile({ ...profile, selectedPageId: pageId, updatedAt: new Date().toISOString() });
}

export function getSelectedAccessibilityReport(profile: OrganizationAccessibilityAuditorProfile) {
  return profile.pageReports.find((p) => p.pageId === profile.selectedPageId) ?? profile.pageReports[0] ?? null;
}

export function getPageAccessibilityFindings(profile: OrganizationAccessibilityAuditorProfile, pageId: string) {
  return profile.findings.filter((f) => f.pageId === pageId);
}
