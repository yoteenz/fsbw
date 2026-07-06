import {
  CONFIDENCE_ENGINE_STORAGE_KEY,
  CONFIDENCE_ENGINE_VERSION,
  STUDIO_OS_CONFIDENCE_ENGINE_UPDATED,
} from './constants';
import { buildOrganizationConfidenceEngineProfile } from './engine-profile-builder';
import type { OrganizationConfidenceEngineProfile, ConfidenceEngineStore } from './types';

function emptyStore(): ConfidenceEngineStore {
  return { version: CONFIDENCE_ENGINE_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_CONFIDENCE_ENGINE_UPDATED));
  }
}

export function readConfidenceEngineStore(): ConfidenceEngineStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(CONFIDENCE_ENGINE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ConfidenceEngineStore;
    return { ...emptyStore(), ...parsed, version: CONFIDENCE_ENGINE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeConfidenceEngineStore(store: ConfidenceEngineStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(CONFIDENCE_ENGINE_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationConfidenceEngineProfile(
  organizationId: string
): OrganizationConfidenceEngineProfile | null {
  return readConfidenceEngineStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationConfidenceEngineProfile): OrganizationConfidenceEngineProfile {
  const store = readConfidenceEngineStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeConfidenceEngineStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncConfidenceEngineFromSources(organizationId: string): OrganizationConfidenceEngineProfile {
  const existing = getOrganizationConfidenceEngineProfile(organizationId);
  const built = buildOrganizationConfidenceEngineProfile(organizationId);
  const profile = upsertProfile({
    ...built,
    selectedRecommendationId: existing?.selectedRecommendationId ?? built.selectedRecommendationId,
  });
  void import('../organizational-guardian/store').then((m) => {
    m.syncOrganizationalGuardianFromSources(organizationId);
  });
  return profile;
}

export function ensureOrganizationConfidenceEngineProfile(
  organizationId: string
): OrganizationConfidenceEngineProfile {
  return syncConfidenceEngineFromSources(organizationId);
}

export function refreshConfidenceEngine(organizationId: string): OrganizationConfidenceEngineProfile {
  return syncConfidenceEngineFromSources(organizationId);
}

export function selectRecommendation(
  organizationId: string,
  recommendationId: string
): OrganizationConfidenceEngineProfile {
  const profile = ensureOrganizationConfidenceEngineProfile(organizationId);
  return upsertProfile({ ...profile, selectedRecommendationId: recommendationId, updatedAt: new Date().toISOString() });
}

export function getSelectedRecommendation(profile: OrganizationConfidenceEngineProfile) {
  return (
    profile.recommendations.find((r) => r.id === profile.selectedRecommendationId) ??
    profile.recommendations[0] ??
    null
  );
}
