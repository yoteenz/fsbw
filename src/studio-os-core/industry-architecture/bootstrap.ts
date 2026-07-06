import { ensureOrganizationArchitectureProfile, readIndustryArchitectureStore, writeIndustryArchitectureStore } from './store';
import { buildInitialOrganizationProfile } from './install-engine';
import type { IndustryArchitectureStore } from './types';

/** Seed default architecture profiles for known production workspaces. */
export function bootstrapIndustryArchitecturePlatform(): IndustryArchitectureStore {
  const store = readIndustryArchitectureStore();
  const knownOrgs = ['frontal-slayer', 'ai-media', 'vxd-inc', 'all-in-one-enterprise'];

  let profiles = [...store.profiles];
  for (const orgId of knownOrgs) {
    if (!profiles.some((p) => p.organizationId === orgId)) {
      profiles.push(buildInitialOrganizationProfile(orgId));
    }
  }

  const next: IndustryArchitectureStore = { profiles, version: store.version };
  if (profiles.length !== store.profiles.length) {
    writeIndustryArchitectureStore(next);
  }
  return next;
}

export function bootstrapOrganizationArchitecture(organizationId: string): void {
  ensureOrganizationArchitectureProfile(organizationId);
}
