import { readMonetizationArchitectureStore, writeMonetizationArchitectureStore, ensureOrganizationMonetizationProfile } from './store';
import type { MonetizationArchitectureStore } from './types';

export function bootstrapMonetizationArchitecturePlatform(): MonetizationArchitectureStore {
  const store = readMonetizationArchitectureStore();
  const knownOrgs = ['frontal-slayer', 'ai-media', 'vxd-inc', 'all-in-one-enterprise'];

  let profiles = [...store.profiles];
  for (const orgId of knownOrgs) {
    if (!profiles.some((p) => p.organizationId === orgId)) {
      profiles.push(ensureOrganizationMonetizationProfile(orgId));
    }
  }

  const next: MonetizationArchitectureStore = { profiles, version: store.version };
  if (profiles.length !== store.profiles.length) {
    writeMonetizationArchitectureStore(next);
  }
  return next;
}

export function bootstrapOrganizationMonetization(organizationId: string): void {
  ensureOrganizationMonetizationProfile(organizationId);
}
