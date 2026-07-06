import {
  ORGANIZATION_PULSE_STORAGE_KEY,
  ORGANIZATION_PULSE_VERSION,
  STUDIO_OS_ORGANIZATION_PULSE_UPDATED,
} from './constants';
import { buildOrganizationPulseProfile } from './pulse-builder';
import type { OrganizationPulseProfile, OrganizationPulseStore } from './types';

function emptyStore(): OrganizationPulseStore {
  return { version: ORGANIZATION_PULSE_VERSION, profiles: [] };
}

export function readOrganizationPulseStore(): OrganizationPulseStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(ORGANIZATION_PULSE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as OrganizationPulseStore;
    return { ...emptyStore(), ...parsed, version: ORGANIZATION_PULSE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeOrganizationPulseStore(store: OrganizationPulseStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(ORGANIZATION_PULSE_STORAGE_KEY, JSON.stringify(store));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_ORGANIZATION_PULSE_UPDATED));
  }
}

export function getOrganizationPulseProfile(organizationId: string): OrganizationPulseProfile | null {
  return readOrganizationPulseStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

export function syncOrganizationPulseFromSources(organizationId: string): OrganizationPulseProfile {
  const profile = buildOrganizationPulseProfile(organizationId);
  const store = readOrganizationPulseStore();
  const next = store.profiles.filter((p) => p.organizationId !== organizationId);
  writeOrganizationPulseStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function ensureOrganizationPulseProfile(organizationId: string): OrganizationPulseProfile {
  const existing = getOrganizationPulseProfile(organizationId);
  if (existing) return existing;
  return syncOrganizationPulseFromSources(organizationId);
}

/** Mission Control — how the organization feels right now. */
export function getOrganizationPulseSummary(organizationId: string): {
  overallPulseScore: number;
  pulseState: OrganizationPulseProfile['pulseState'];
  pulseFeeling: string;
  alertCount: number;
  topAlert?: string;
} {
  const profile = getOrganizationPulseProfile(organizationId) ?? syncOrganizationPulseFromSources(organizationId);
  const urgent = profile.proactiveAlerts.filter((a) => a.severity === 'urgent' || a.severity === 'critical');
  return {
    overallPulseScore: profile.overallPulseScore,
    pulseState: profile.pulseState,
    pulseFeeling: profile.pulseFeeling,
    alertCount: profile.proactiveAlerts.length,
    topAlert: urgent[0]?.title ?? profile.proactiveAlerts[0]?.title,
  };
}
