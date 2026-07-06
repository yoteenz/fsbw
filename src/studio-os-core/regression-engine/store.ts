import {
  REGRESSION_ENGINE_STORAGE_KEY,
  REGRESSION_ENGINE_VERSION,
  STUDIO_OS_REGRESSION_ENGINE_UPDATED,
} from './constants';
import { buildOrganizationRegressionEngineProfile } from './engine-profile-builder';
import type { OrganizationRegressionEngineProfile, RegressionEngineStore } from './types';

function emptyStore(): RegressionEngineStore {
  return { version: REGRESSION_ENGINE_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_REGRESSION_ENGINE_UPDATED));
  }
}

export function readRegressionEngineStore(): RegressionEngineStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(REGRESSION_ENGINE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as RegressionEngineStore;
    return { ...emptyStore(), ...parsed, version: REGRESSION_ENGINE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeRegressionEngineStore(store: RegressionEngineStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(REGRESSION_ENGINE_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationRegressionEngineProfile(
  organizationId: string
): OrganizationRegressionEngineProfile | null {
  return readRegressionEngineStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationRegressionEngineProfile): OrganizationRegressionEngineProfile {
  const store = readRegressionEngineStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeRegressionEngineStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncRegressionEngineFromSources(
  organizationId: string
): OrganizationRegressionEngineProfile {
  const existing = getOrganizationRegressionEngineProfile(organizationId);
  const built = buildOrganizationRegressionEngineProfile(organizationId);
  return upsertProfile({
    ...built,
    selectedBuildId: existing?.selectedBuildId ?? built.selectedBuildId,
  });
}

export function ensureOrganizationRegressionEngineProfile(
  organizationId: string
): OrganizationRegressionEngineProfile {
  return syncRegressionEngineFromSources(organizationId);
}

export function refreshRegressionEngine(organizationId: string): OrganizationRegressionEngineProfile {
  return syncRegressionEngineFromSources(organizationId);
}

export function selectRegressionBuild(organizationId: string, buildId: string): OrganizationRegressionEngineProfile {
  const profile = ensureOrganizationRegressionEngineProfile(organizationId);
  return upsertProfile({ ...profile, selectedBuildId: buildId, updatedAt: new Date().toISOString() });
}

export function getSelectedBuildReport(profile: OrganizationRegressionEngineProfile) {
  return profile.buildReports.find((r) => r.buildId === profile.selectedBuildId) ?? profile.buildReports[0] ?? null;
}

export function getBuildBrokenFeatures(profile: OrganizationRegressionEngineProfile, buildId: string) {
  const report = profile.buildReports.find((r) => r.buildId === buildId);
  if (!report) return profile.brokenFeatures;
  return profile.brokenFeatures.filter((f) => report.brokenFeatures.includes(f.featureLabel));
}
