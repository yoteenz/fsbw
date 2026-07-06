import { readFirstEnsure } from '../sync/profile-cache';
import {
  ENGINEERING_EXCELLENCE_STORAGE_KEY,
  ENGINEERING_EXCELLENCE_VERSION,
  STUDIO_OS_ENGINEERING_EXCELLENCE_UPDATED,
} from './constants';
import { buildOrganizationEngineeringExcellenceProfile } from './engine-profile-builder';
import type { EngineeringExcellenceStore, ExcellencePeriod, OrganizationEngineeringExcellenceProfile } from './types';

function emptyStore(): EngineeringExcellenceStore {
  return { version: ENGINEERING_EXCELLENCE_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_ENGINEERING_EXCELLENCE_UPDATED));
  }
}

export function readEngineeringExcellenceStore(): EngineeringExcellenceStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(ENGINEERING_EXCELLENCE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as EngineeringExcellenceStore;
    return { ...emptyStore(), ...parsed, version: ENGINEERING_EXCELLENCE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeEngineeringExcellenceStore(store: EngineeringExcellenceStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(ENGINEERING_EXCELLENCE_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationEngineeringExcellenceProfile(
  organizationId: string
): OrganizationEngineeringExcellenceProfile | null {
  return readEngineeringExcellenceStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationEngineeringExcellenceProfile): OrganizationEngineeringExcellenceProfile {
  const store = readEngineeringExcellenceStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeEngineeringExcellenceStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncEngineeringExcellenceFromSources(
  organizationId: string
): OrganizationEngineeringExcellenceProfile {
  const existing = getOrganizationEngineeringExcellenceProfile(organizationId);
  const built = buildOrganizationEngineeringExcellenceProfile(organizationId);
  return upsertProfile({
    ...built,
    selectedPeriod: existing?.selectedPeriod ?? built.selectedPeriod,
  });
}

export function ensureOrganizationEngineeringExcellenceProfile(organizationId: string): OrganizationEngineeringExcellenceProfile {
  return readFirstEnsure(organizationId, getOrganizationEngineeringExcellenceProfile, syncEngineeringExcellenceFromSources);
}

export function refreshEngineeringExcellence(organizationId: string): OrganizationEngineeringExcellenceProfile {
  return syncEngineeringExcellenceFromSources(organizationId);
}

export function selectExcellencePeriod(
  organizationId: string,
  period: ExcellencePeriod
): OrganizationEngineeringExcellenceProfile {
  const profile = ensureOrganizationEngineeringExcellenceProfile(organizationId);
  return upsertProfile({ ...profile, selectedPeriod: period, updatedAt: new Date().toISOString() });
}

export function getSelectedHistoricalPoint(profile: OrganizationEngineeringExcellenceProfile) {
  return profile.historicalExcellence.find((h) => h.period === profile.selectedPeriod) ?? profile.historicalExcellence[0] ?? null;
}
