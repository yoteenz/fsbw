import {
  ensureOrganizationDiscoveryBlueprint,
  readBusinessDiscoveryBlueprintStore,
} from './store';
import type { BusinessDiscoveryBlueprintStore } from './types';

const KNOWN_ORGS: Array<{ id: string; name: string; industryId: string }> = [
  { id: 'frontal-slayer', name: 'Frontal Slayer', industryId: 'beauty' },
  { id: 'ai-media', name: 'NDXBOOK', industryId: 'creator' },
  { id: 'vxd-inc', name: 'VXD Inc.', industryId: 'agency' },
  { id: 'all-in-one-enterprise', name: 'All In One Enterprise', industryId: 'agency' },
];

export function bootstrapBusinessDiscoveryBlueprintPlatform(): BusinessDiscoveryBlueprintStore {
  const store = readBusinessDiscoveryBlueprintStore();
  let changed = false;

  for (const org of KNOWN_ORGS) {
    if (!store.blueprints.some((b) => b.organizationId === org.id)) {
      ensureOrganizationDiscoveryBlueprint(org.id, org.name, org.industryId);
      changed = true;
    }
  }

  if (changed) {
    return readBusinessDiscoveryBlueprintStore();
  }
  return store;
}

export function bootstrapOrganizationDiscoveryBlueprint(organizationId: string): void {
  const seed = KNOWN_ORGS.find((o) => o.id === organizationId);
  ensureOrganizationDiscoveryBlueprint(organizationId, seed?.name, seed?.industryId);
}
