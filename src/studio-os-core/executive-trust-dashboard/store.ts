import {
  EXECUTIVE_TRUST_DASHBOARD_STORAGE_KEY,
  EXECUTIVE_TRUST_DASHBOARD_VERSION,
  STUDIO_OS_EXECUTIVE_TRUST_DASHBOARD_UPDATED,
} from './constants';
import { buildOrganizationExecutiveTrustDashboardProfile } from './engine-profile-builder';
import type { OrganizationExecutiveTrustDashboardProfile, ExecutiveTrustDashboardStore } from './types';

function emptyStore(): ExecutiveTrustDashboardStore {
  return { version: EXECUTIVE_TRUST_DASHBOARD_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_EXECUTIVE_TRUST_DASHBOARD_UPDATED));
  }
}

export function readExecutiveTrustDashboardStore(): ExecutiveTrustDashboardStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(EXECUTIVE_TRUST_DASHBOARD_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ExecutiveTrustDashboardStore;
    return { ...emptyStore(), ...parsed, version: EXECUTIVE_TRUST_DASHBOARD_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeExecutiveTrustDashboardStore(store: ExecutiveTrustDashboardStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(EXECUTIVE_TRUST_DASHBOARD_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationExecutiveTrustDashboardProfile(
  organizationId: string
): OrganizationExecutiveTrustDashboardProfile | null {
  return readExecutiveTrustDashboardStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(
  profile: OrganizationExecutiveTrustDashboardProfile
): OrganizationExecutiveTrustDashboardProfile {
  const store = readExecutiveTrustDashboardStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeExecutiveTrustDashboardStore({ ...store, profiles: [...next, profile] });
  return profile;
}

/** Rebuild trust indicators, executive summary, and history from QA layer + platform sources */
export function syncExecutiveTrustDashboardFromSources(
  organizationId: string
): OrganizationExecutiveTrustDashboardProfile {
  return upsertProfile(buildOrganizationExecutiveTrustDashboardProfile(organizationId));
}

export function ensureOrganizationExecutiveTrustDashboardProfile(
  organizationId: string
): OrganizationExecutiveTrustDashboardProfile {
  return syncExecutiveTrustDashboardFromSources(organizationId);
}

export function refreshTrustDashboard(organizationId: string): OrganizationExecutiveTrustDashboardProfile {
  return syncExecutiveTrustDashboardFromSources(organizationId);
}
