import {
  RELEASE_READINESS_STORAGE_KEY,
  RELEASE_READINESS_VERSION,
  STUDIO_OS_RELEASE_READINESS_UPDATED,
} from './constants';
import { buildOrganizationReleaseReadinessProfile } from './engine-profile-builder';
import type { OrganizationReleaseReadinessProfile, ReleaseReadinessStore } from './types';

function emptyStore(): ReleaseReadinessStore {
  return { version: RELEASE_READINESS_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_RELEASE_READINESS_UPDATED));
  }
}

export function readReleaseReadinessStore(): ReleaseReadinessStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(RELEASE_READINESS_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ReleaseReadinessStore;
    return { ...emptyStore(), ...parsed, version: RELEASE_READINESS_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeReleaseReadinessStore(store: ReleaseReadinessStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(RELEASE_READINESS_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationReleaseReadinessProfile(
  organizationId: string
): OrganizationReleaseReadinessProfile | null {
  return readReleaseReadinessStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationReleaseReadinessProfile): OrganizationReleaseReadinessProfile {
  const store = readReleaseReadinessStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeReleaseReadinessStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncReleaseReadinessFromSources(
  organizationId: string
): OrganizationReleaseReadinessProfile {
  const existing = getOrganizationReleaseReadinessProfile(organizationId);
  const built = buildOrganizationReleaseReadinessProfile(organizationId);
  const profile = upsertProfile({
    ...built,
    selectedReleaseId: existing?.selectedReleaseId ?? built.selectedReleaseId,
  });
  void import('../engineering-excellence-dashboard/store').then((m) => {
    m.syncEngineeringExcellenceFromSources(organizationId);
  });
  return profile;
}

export function ensureOrganizationReleaseReadinessProfile(
  organizationId: string
): OrganizationReleaseReadinessProfile {
  return syncReleaseReadinessFromSources(organizationId);
}

export function refreshReleaseReadiness(organizationId: string): OrganizationReleaseReadinessProfile {
  return syncReleaseReadinessFromSources(organizationId);
}

export function selectReleaseCandidate(
  organizationId: string,
  releaseId: string
): OrganizationReleaseReadinessProfile {
  const profile = ensureOrganizationReleaseReadinessProfile(organizationId);
  return upsertProfile({ ...profile, selectedReleaseId: releaseId, updatedAt: new Date().toISOString() });
}

export function getSelectedProductionReport(profile: OrganizationReleaseReadinessProfile) {
  return profile.productionReports.find((r) => r.releaseId === profile.selectedReleaseId) ?? profile.productionReports[0] ?? null;
}

export function getExecutiveBriefForSelectedRelease(profile: OrganizationReleaseReadinessProfile) {
  const report = getSelectedProductionReport(profile);
  if (!report) return profile.executiveBriefs[0] ?? null;
  return profile.executiveBriefs.find((b) => b.releaseId === report.releaseId) ?? profile.executiveBriefs[0] ?? null;
}
