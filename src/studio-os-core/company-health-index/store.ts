import {
  COMPANY_HEALTH_INDEX_STORAGE_KEY,
  COMPANY_HEALTH_INDEX_VERSION,
  STUDIO_OS_COMPANY_HEALTH_INDEX_UPDATED,
} from './constants';
import { buildOrganizationHealthIndexProfile } from './health-builder';
import type { CompanyHealthIndexStore, OrganizationHealthIndexProfile } from './types';

function emptyStore(): CompanyHealthIndexStore {
  return { version: COMPANY_HEALTH_INDEX_VERSION, profiles: [] };
}

export function readCompanyHealthIndexStore(): CompanyHealthIndexStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(COMPANY_HEALTH_INDEX_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as CompanyHealthIndexStore;
    return { ...emptyStore(), ...parsed, version: COMPANY_HEALTH_INDEX_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeCompanyHealthIndexStore(store: CompanyHealthIndexStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(COMPANY_HEALTH_INDEX_STORAGE_KEY, JSON.stringify(store));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_COMPANY_HEALTH_INDEX_UPDATED));
  }
}

export function getOrganizationHealthIndexProfile(
  organizationId: string
): OrganizationHealthIndexProfile | null {
  return readCompanyHealthIndexStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

export function syncCompanyHealthIndexFromSources(organizationId: string): OrganizationHealthIndexProfile {
  const profile = buildOrganizationHealthIndexProfile(organizationId);
  const store = readCompanyHealthIndexStore();
  const next = store.profiles.filter((p) => p.organizationId !== organizationId);
  writeCompanyHealthIndexStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function ensureOrganizationHealthIndexProfile(
  organizationId: string
): OrganizationHealthIndexProfile {
  const existing = getOrganizationHealthIndexProfile(organizationId);
  if (existing) return existing;
  return syncCompanyHealthIndexFromSources(organizationId);
}

/** Mission Control executive summary — one score, drill-down available. */
export function getExecutiveHealthSummary(organizationId: string): {
  executiveHealthScore: number;
  executiveStatus: OrganizationHealthIndexProfile['executiveStatus'];
  weakAreaCount: number;
  topWeakArea?: string;
} {
  const profile = getOrganizationHealthIndexProfile(organizationId) ?? syncCompanyHealthIndexFromSources(organizationId);
  return {
    executiveHealthScore: profile.executiveHealthScore,
    executiveStatus: profile.executiveStatus,
    weakAreaCount: profile.weakAreas.length,
    topWeakArea: profile.weakAreas[0]?.label,
  };
}
