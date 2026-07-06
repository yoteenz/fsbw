import { ensureInaugurationFromBlueprint, readOrganizationInaugurationStore } from './store';

const KNOWN_ORGS = ['frontal-slayer', 'ai-media', 'vxd-inc', 'all-in-one-enterprise'];

export function bootstrapOrganizationInaugurationPlatform() {
  const store = readOrganizationInaugurationStore();
  for (const orgId of KNOWN_ORGS) {
    if (!store.profiles.some((p) => p.organizationId === orgId)) {
      ensureInaugurationFromBlueprint(orgId);
    }
  }
  return readOrganizationInaugurationStore();
}

export function bootstrapOrganizationInauguration(organizationId: string): void {
  ensureInaugurationFromBlueprint(organizationId);
}
