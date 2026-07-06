import { INDUSTRY_ARCHITECTURE_STORAGE_KEY, INDUSTRY_ARCHITECTURE_VERSION } from './constants';
import {
  buildInitialOrganizationProfile,
  installPackOnProfile,
  mergePackIntoProfile,
} from './install-engine';
import type { IndustryArchitectureStore, IndustryId, OrganizationArchitectureProfile } from './types';

function emptyStore(): IndustryArchitectureStore {
  return { profiles: [], version: INDUSTRY_ARCHITECTURE_VERSION };
}

export function readIndustryArchitectureStore(): IndustryArchitectureStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(INDUSTRY_ARCHITECTURE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as IndustryArchitectureStore;
    return { ...emptyStore(), ...parsed, version: INDUSTRY_ARCHITECTURE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeIndustryArchitectureStore(store: IndustryArchitectureStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(INDUSTRY_ARCHITECTURE_STORAGE_KEY, JSON.stringify(store));
}

export function getOrganizationArchitectureProfile(organizationId: string): OrganizationArchitectureProfile | null {
  return readIndustryArchitectureStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

export function upsertOrganizationArchitectureProfile(profile: OrganizationArchitectureProfile): void {
  const store = readIndustryArchitectureStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeIndustryArchitectureStore({
    ...store,
    profiles: [...next, { ...profile, updatedAt: new Date().toISOString() }],
  });
}

export function ensureOrganizationArchitectureProfile(
  organizationId: string,
  industryId?: IndustryId
): OrganizationArchitectureProfile {
  const existing = getOrganizationArchitectureProfile(organizationId);
  if (existing) return existing;
  const profile = buildInitialOrganizationProfile(organizationId, industryId);
  upsertOrganizationArchitectureProfile(profile);
  return profile;
}

export function installDepartmentPack(organizationId: string, packId: string): OrganizationArchitectureProfile {
  const profile = ensureOrganizationArchitectureProfile(organizationId);
  const next = installPackOnProfile(profile, packId);
  upsertOrganizationArchitectureProfile(next);
  void import('../monetization-architecture/store').then((m) => {
    m.recordDepartmentPackPurchase(organizationId, packId);
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('studio-os-headquarters-expanded', {
        detail: { organizationId, packId },
      })
    );
  }
  return next;
}

export function setOrganizationIndustry(organizationId: string, industryId: IndustryId): OrganizationArchitectureProfile {
  const existing = getOrganizationArchitectureProfile(organizationId);
  if (!existing) {
    const profile = buildInitialOrganizationProfile(organizationId, industryId);
    upsertOrganizationArchitectureProfile(profile);
    return profile;
  }
  const rebuilt = buildInitialOrganizationProfile(organizationId, industryId);
  const preservedInstalled = existing.installedPacks.filter(
    (p) => !rebuilt.installedPacks.some((r) => r.packId === p.packId)
  );
  let merged = rebuilt;
  for (const record of preservedInstalled) {
    merged = mergePackIntoProfile(merged, record.packId);
  }
  upsertOrganizationArchitectureProfile(merged);
  return merged;
}

export function listAllOrganizationProfiles(): OrganizationArchitectureProfile[] {
  return readIndustryArchitectureStore().profiles;
}
