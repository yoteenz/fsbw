import { addIdentityGraphEdge } from '../identity-graph/graph';
import { registerOwnership } from '../ownership/ownership-registry';
import { readIdentityEngineStore } from '../persistence';
import {
  createIdentityRecord,
  getIdentityRecord,
  listIdentitiesByType,
} from '../identity/registry';
import type { CreateOrganizationInput, IdentityRecord } from '../types';

/** Organization Engine™ */
export function listOrganizationIdentities(): IdentityRecord[] {
  return listIdentitiesByType('organization');
}

export function getOrganizationIdentity(identityId: string): IdentityRecord | undefined {
  const record = getIdentityRecord(identityId);
  return record?.identityType === 'organization' ? record : undefined;
}

export function createOrganizationIdentity(
  input: CreateOrganizationInput,
  actorIdentityId: string | null = null
): IdentityRecord {
  const org = createIdentityRecord(
    {
      identityType: 'organization',
      displayName: input.displayName,
      officialName: input.officialName,
      purpose: 'Organization tenant boundary',
      ownerIdentityId: input.stewardIdentityId,
      metadata: input.metadata,
      lifecycleState: 'active',
    },
    actorIdentityId
  );

  registerOwnership({
    subjectIdentityId: org.identityId,
    stewardIdentityId: input.stewardIdentityId,
    organizationIdentityId: org.identityId,
    companyIdentityId: null,
    operatorIdentityIds: [input.stewardIdentityId],
  });

  addIdentityGraphEdge(input.stewardIdentityId, org.identityId, 'owns', undefined, actorIdentityId);

  return org;
}

export function listActorsInOrganization(organizationIdentityId: string): string[] {
  const memberships = readIdentityEngineStore().memberships.filter(
    (m) => m.organizationIdentityId === organizationIdentityId && m.status === 'active'
  );
  return memberships.map((m) => m.actorIdentityId);
}
