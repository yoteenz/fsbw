import {
  SHADOW_MODE_STORAGE_KEY,
  SHADOW_MODE_VERSION,
  STUDIO_OS_SHADOW_MODE_UPDATED,
} from './constants';
import { buildOrganizationShadowModeProfile } from './shadow-builder';
import type { OrganizationShadowModeProfile, ShadowModeStore } from './types';

function emptyStore(): ShadowModeStore {
  return { version: SHADOW_MODE_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_SHADOW_MODE_UPDATED));
  }
}

export function readShadowModeStore(): ShadowModeStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(SHADOW_MODE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ShadowModeStore;
    return { ...emptyStore(), ...parsed, version: SHADOW_MODE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeShadowModeStore(store: ShadowModeStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(SHADOW_MODE_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationShadowModeProfile(organizationId: string): OrganizationShadowModeProfile | null {
  return readShadowModeStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationShadowModeProfile): OrganizationShadowModeProfile {
  const store = readShadowModeStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeShadowModeStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncShadowModeFromSources(organizationId: string): OrganizationShadowModeProfile {
  const existing = getOrganizationShadowModeProfile(organizationId);
  const profile = buildOrganizationShadowModeProfile(organizationId, existing);
  return upsertProfile(profile);
}

export function ensureOrganizationShadowModeProfile(organizationId: string): OrganizationShadowModeProfile {
  const existing = getOrganizationShadowModeProfile(organizationId);
  if (existing) return existing;
  return syncShadowModeFromSources(organizationId);
}

export function setConciergeAutomationThreshold(
  organizationId: string,
  conciergeId: string,
  threshold: number
): OrganizationShadowModeProfile | null {
  const profile = getOrganizationShadowModeProfile(organizationId);
  if (!profile) return null;

  const clamped = Math.max(70, Math.min(98, Math.round(threshold)));
  const conciergeProfiles = profile.conciergeProfiles.map((c) =>
    c.conciergeId === conciergeId ? { ...c, automationThreshold: clamped } : c
  );

  return upsertProfile(buildOrganizationShadowModeProfile(organizationId, { ...profile, conciergeProfiles }));
}

export function getConciergeShadowStatus(organizationId: string, conciergeId: string) {
  const profile = getOrganizationShadowModeProfile(organizationId) ?? syncShadowModeFromSources(organizationId);
  return profile.conciergeProfiles.find((c) => c.conciergeId === conciergeId) ?? null;
}
