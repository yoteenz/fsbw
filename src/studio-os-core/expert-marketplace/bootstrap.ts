import { readExpertMarketplaceStore, bootstrapExpertMarketplaceForOrg } from './store';

const KNOWN_ORGS = ['frontal-slayer', 'ai-media', 'vxd-inc', 'all-in-one-enterprise'];

export function bootstrapExpertMarketplacePlatform() {
  for (const orgId of KNOWN_ORGS) {
    if (!readExpertMarketplaceStore().profiles.some((p) => p.organizationId === orgId)) {
      bootstrapExpertMarketplaceForOrg(orgId);
    }
  }
  return readExpertMarketplaceStore();
}
