import { readFirstEnsure } from '../sync/profile-cache';
import {
  DESIGN_COMPLIANCE_ENGINE_STORAGE_KEY,
  DESIGN_COMPLIANCE_ENGINE_VERSION,
  STUDIO_OS_DESIGN_COMPLIANCE_ENGINE_UPDATED,
} from './constants';
import { buildOrganizationDesignComplianceEngineProfile } from './engine-profile-builder';
import type { DesignComplianceEngineStore, OrganizationDesignComplianceEngineProfile } from './types';

function emptyStore(): DesignComplianceEngineStore {
  return { version: DESIGN_COMPLIANCE_ENGINE_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_DESIGN_COMPLIANCE_ENGINE_UPDATED));
  }
}

export function readDesignComplianceEngineStore(): DesignComplianceEngineStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(DESIGN_COMPLIANCE_ENGINE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as DesignComplianceEngineStore;
    return { ...emptyStore(), ...parsed, version: DESIGN_COMPLIANCE_ENGINE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeDesignComplianceEngineStore(store: DesignComplianceEngineStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(DESIGN_COMPLIANCE_ENGINE_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationDesignComplianceEngineProfile(
  organizationId: string
): OrganizationDesignComplianceEngineProfile | null {
  return readDesignComplianceEngineStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationDesignComplianceEngineProfile): OrganizationDesignComplianceEngineProfile {
  const store = readDesignComplianceEngineStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeDesignComplianceEngineStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncDesignComplianceEngineFromSources(
  organizationId: string
): OrganizationDesignComplianceEngineProfile {
  const existing = getOrganizationDesignComplianceEngineProfile(organizationId);
  const built = buildOrganizationDesignComplianceEngineProfile(organizationId);
  const profile = upsertProfile({
    ...built,
    selectedPageId: existing?.selectedPageId ?? built.selectedPageId,
  });
  return profile;
}

export function ensureOrganizationDesignComplianceEngineProfile(organizationId: string): OrganizationDesignComplianceEngineProfile {
  return readFirstEnsure(organizationId, getOrganizationDesignComplianceEngineProfile, syncDesignComplianceEngineFromSources);
}

export function refreshDesignComplianceEngine(organizationId: string): OrganizationDesignComplianceEngineProfile {
  return syncDesignComplianceEngineFromSources(organizationId);
}

export function selectCompliancePage(organizationId: string, pageId: string): OrganizationDesignComplianceEngineProfile {
  const profile = ensureOrganizationDesignComplianceEngineProfile(organizationId);
  return upsertProfile({ ...profile, selectedPageId: pageId, updatedAt: new Date().toISOString() });
}

export function getSelectedPageReport(profile: OrganizationDesignComplianceEngineProfile) {
  return profile.pageReports.find((p) => p.pageId === profile.selectedPageId) ?? profile.pageReports[0] ?? null;
}

export function getPageFindings(profile: OrganizationDesignComplianceEngineProfile, pageId: string) {
  return profile.findings.filter((f) => f.pageId === pageId);
}
