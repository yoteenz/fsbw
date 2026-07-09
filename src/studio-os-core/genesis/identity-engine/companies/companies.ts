import { addIdentityGraphEdge } from '../identity-graph/graph';
import { getOrganizationIdentity } from '../organizations/organizations';
import { registerOwnership } from '../ownership/ownership-registry';
import {
  createIdentityRecord,
  getIdentityRecord,
  listIdentitiesByType,
} from '../identity/registry';
import type { CreateCompanyInput, IdentityRecord } from '../types';

export function listCompanyIdentities(): IdentityRecord[] {
  return listIdentitiesByType('company');
}

export function getCompanyIdentity(identityId: string): IdentityRecord | undefined {
  const record = getIdentityRecord(identityId);
  return record?.identityType === 'company' ? record : undefined;
}

export function createCompanyIdentity(
  input: CreateCompanyInput,
  actorIdentityId: string | null = null
): IdentityRecord | undefined {
  const org = getOrganizationIdentity(input.organizationIdentityId);
  if (!org) return undefined;

  const company = createIdentityRecord(
    {
      identityType: 'company',
      displayName: input.displayName,
      officialName: input.officialName,
      purpose: 'Business operating unit',
      ownerIdentityId: input.stewardIdentityId,
      metadata: input.metadata,
      lifecycleState: 'active',
    },
    actorIdentityId
  );

  addIdentityGraphEdge(company.identityId, org.identityId, 'belongs_to', undefined, actorIdentityId);
  addIdentityGraphEdge(org.identityId, company.identityId, 'contains', undefined, actorIdentityId);

  registerOwnership({
    subjectIdentityId: company.identityId,
    stewardIdentityId: input.stewardIdentityId,
    organizationIdentityId: org.identityId,
    companyIdentityId: company.identityId,
    operatorIdentityIds: [input.stewardIdentityId],
  });

  return company;
}

export function listCompaniesInOrganization(organizationIdentityId: string): IdentityRecord[] {
  return listCompanyIdentities().filter((c) => c.organizationIds.includes(organizationIdentityId));
}
