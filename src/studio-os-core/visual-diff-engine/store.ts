import { readFirstEnsure } from '../sync/profile-cache';
import {
  VISUAL_DIFF_ENGINE_STORAGE_KEY,
  VISUAL_DIFF_ENGINE_VERSION,
  STUDIO_OS_VISUAL_DIFF_ENGINE_UPDATED,
} from './constants';
import { buildOrganizationVisualDiffEngineProfile } from './engine-profile-builder';
import type { OrganizationVisualDiffEngineProfile, VisualDiffEngineStore } from './types';

function emptyStore(): VisualDiffEngineStore {
  return { version: VISUAL_DIFF_ENGINE_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_VISUAL_DIFF_ENGINE_UPDATED));
  }
}

export function readVisualDiffEngineStore(): VisualDiffEngineStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(VISUAL_DIFF_ENGINE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as VisualDiffEngineStore;
    return { ...emptyStore(), ...parsed, version: VISUAL_DIFF_ENGINE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeVisualDiffEngineStore(store: VisualDiffEngineStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(VISUAL_DIFF_ENGINE_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationVisualDiffEngineProfile(
  organizationId: string
): OrganizationVisualDiffEngineProfile | null {
  return readVisualDiffEngineStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationVisualDiffEngineProfile): OrganizationVisualDiffEngineProfile {
  const store = readVisualDiffEngineStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeVisualDiffEngineStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncVisualDiffEngineFromSources(
  organizationId: string
): OrganizationVisualDiffEngineProfile {
  const existing = getOrganizationVisualDiffEngineProfile(organizationId);
  const built = buildOrganizationVisualDiffEngineProfile(organizationId);
  const profile = upsertProfile({
    ...built,
    selectedScreenId: existing?.selectedScreenId ?? built.selectedScreenId,
  });
  return profile;
}

export function ensureOrganizationVisualDiffEngineProfile(organizationId: string): OrganizationVisualDiffEngineProfile {
  return readFirstEnsure(organizationId, getOrganizationVisualDiffEngineProfile, syncVisualDiffEngineFromSources);
}

export function refreshVisualDiffEngine(organizationId: string): OrganizationVisualDiffEngineProfile {
  return syncVisualDiffEngineFromSources(organizationId);
}

export function selectVisualDiffScreen(organizationId: string, screenId: string): OrganizationVisualDiffEngineProfile {
  const profile = ensureOrganizationVisualDiffEngineProfile(organizationId);
  return upsertProfile({ ...profile, selectedScreenId: screenId, updatedAt: new Date().toISOString() });
}

export function getSelectedVisualReport(profile: OrganizationVisualDiffEngineProfile) {
  return profile.visualReports.find((r) => r.screenId === profile.selectedScreenId) ?? profile.visualReports[0] ?? null;
}

export function getScreenDiffFindings(profile: OrganizationVisualDiffEngineProfile, screenId: string) {
  return profile.findings.filter((f) => f.screenId === screenId);
}

export function getGoldenReference(profile: OrganizationVisualDiffEngineProfile, screenId: string) {
  return profile.goldenReferences.find((g) => g.screenId === screenId) ?? null;
}
