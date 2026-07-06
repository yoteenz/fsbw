import {
  CROSS_ORG_INTELLIGENCE_STORAGE_KEY,
  CROSS_ORG_INTELLIGENCE_VERSION,
  STUDIO_OS_CROSS_ORG_INTELLIGENCE_UPDATED,
} from './constants';
import { buildOrganizationCrossOrgIntelligenceProfile } from './intelligence-builder';
import type { CrossOrgIntelligenceStore, OrganizationCrossOrgIntelligenceProfile } from './types';

function emptyStore(): CrossOrgIntelligenceStore {
  return { version: CROSS_ORG_INTELLIGENCE_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_CROSS_ORG_INTELLIGENCE_UPDATED));
  }
}

export function readCrossOrgIntelligenceStore(): CrossOrgIntelligenceStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(CROSS_ORG_INTELLIGENCE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as CrossOrgIntelligenceStore;
    return { ...emptyStore(), ...parsed, version: CROSS_ORG_INTELLIGENCE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeCrossOrgIntelligenceStore(store: CrossOrgIntelligenceStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(CROSS_ORG_INTELLIGENCE_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationCrossOrgIntelligenceProfile(
  organizationId: string
): OrganizationCrossOrgIntelligenceProfile | null {
  return readCrossOrgIntelligenceStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationCrossOrgIntelligenceProfile): OrganizationCrossOrgIntelligenceProfile {
  const store = readCrossOrgIntelligenceStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeCrossOrgIntelligenceStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncCrossOrgIntelligenceFromSources(organizationId: string): OrganizationCrossOrgIntelligenceProfile {
  return upsertProfile(buildOrganizationCrossOrgIntelligenceProfile(organizationId));
}

export function ensureOrganizationCrossOrgIntelligenceProfile(
  organizationId: string
): OrganizationCrossOrgIntelligenceProfile {
  return syncCrossOrgIntelligenceFromSources(organizationId);
}

export function refreshCrossOrgIntelligence(organizationId: string): OrganizationCrossOrgIntelligenceProfile {
  return syncCrossOrgIntelligenceFromSources(organizationId);
}
