import {
  ensureOrganizationProfessionBrainProfile,
  readProfessionBrainStore,
} from './store';

const KNOWN_ORGS: Array<{ id: string; name: string }> = [
  { id: 'frontal-slayer', name: 'Frontal Slayer' },
  { id: 'ai-media', name: 'NDXBOOK' },
  { id: 'vxd-inc', name: 'VXD Inc.' },
  { id: 'all-in-one-enterprise', name: 'All In One Enterprise' },
];

export function bootstrapProfessionBrainPlatform() {
  for (const org of KNOWN_ORGS) {
    if (!readProfessionBrainStore().profiles.some((p) => p.organizationId === org.id)) {
      ensureOrganizationProfessionBrainProfile(org.id, org.name);
    }
  }
  return readProfessionBrainStore();
}

export function bootstrapOrganizationProfessionBrain(organizationId: string): void {
  const seed = KNOWN_ORGS.find((o) => o.id === organizationId);
  ensureOrganizationProfessionBrainProfile(organizationId, seed?.name);
}
