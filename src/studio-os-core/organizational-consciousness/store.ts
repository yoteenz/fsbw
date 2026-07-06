import {
  ORGANIZATIONAL_CONSCIOUSNESS_STORAGE_KEY,
  ORGANIZATIONAL_CONSCIOUSNESS_VERSION,
  STUDIO_OS_ORGANIZATIONAL_CONSCIOUSNESS_UPDATED,
} from './constants';
import { buildOrganizationConsciousnessProfile } from './consciousness-builder';
import type { OrganizationConsciousnessProfile, OrganizationalConsciousnessStore } from './types';

function emptyStore(): OrganizationalConsciousnessStore {
  return { version: ORGANIZATIONAL_CONSCIOUSNESS_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_ORGANIZATIONAL_CONSCIOUSNESS_UPDATED));
  }
}

export function readOrganizationalConsciousnessStore(): OrganizationalConsciousnessStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(ORGANIZATIONAL_CONSCIOUSNESS_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as OrganizationalConsciousnessStore;
    return { ...emptyStore(), ...parsed, version: ORGANIZATIONAL_CONSCIOUSNESS_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeOrganizationalConsciousnessStore(store: OrganizationalConsciousnessStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(ORGANIZATIONAL_CONSCIOUSNESS_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationConsciousnessProfile(
  organizationId: string
): OrganizationConsciousnessProfile | null {
  return readOrganizationalConsciousnessStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationConsciousnessProfile): OrganizationConsciousnessProfile {
  const store = readOrganizationalConsciousnessStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeOrganizationalConsciousnessStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncOrganizationalConsciousnessFromSources(
  organizationId: string
): OrganizationConsciousnessProfile {
  const profile = upsertProfile(buildOrganizationConsciousnessProfile(organizationId));
  void import('../executive-timeline/history-store').then((m) => {
    m.syncExecutiveTimelineHistoryFromSources(organizationId);
  });
  return profile;
}

export function ensureOrganizationConsciousnessProfile(
  organizationId: string
): OrganizationConsciousnessProfile {
  return syncOrganizationalConsciousnessFromSources(organizationId);
}

export function refreshOrganizationalConsciousnessProfile(
  organizationId: string
): OrganizationConsciousnessProfile {
  return syncOrganizationalConsciousnessFromSources(organizationId);
}
