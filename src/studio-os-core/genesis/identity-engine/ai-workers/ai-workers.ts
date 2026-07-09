import { addIdentityGraphEdge } from '../identity-graph/graph';
import { createCompanyMembership } from '../memberships/memberships';
import { getOrganizationIdentity } from '../organizations/organizations';
import { assignIdentityRole } from '../roles/role-engine';
import {
  createIdentityRecord,
  getIdentityRecord,
  listIdentitiesByType,
  setIdentityLifecycleState,
} from '../identity/registry';
import type { CreateAiWorkerInput, IdentityRecord } from '../types';

/** AI worker actor identities */
export function listAiWorkerIdentities(): IdentityRecord[] {
  return listIdentitiesByType('ai_worker');
}

export function getAiWorkerIdentity(identityId: string): IdentityRecord | undefined {
  const record = getIdentityRecord(identityId);
  return record?.identityType === 'ai_worker' ? record : undefined;
}

export function createAiWorkerIdentity(
  input: CreateAiWorkerInput,
  actorIdentityId: string | null = null
): IdentityRecord | undefined {
  const org = getOrganizationIdentity(input.organizationIdentityId);
  if (!org) return undefined;

  const worker = createIdentityRecord(
    {
      identityType: 'ai_worker',
      displayName: input.displayName,
      officialName: input.officialName,
      purpose: 'Digital worker actor identity',
      ownerIdentityId: input.ownerIdentityId,
      metadata: {
        ...input.metadata,
        actorKind: 'ai',
        organizationIdentityId: input.organizationIdentityId,
        companyIdentityId: input.companyIdentityId ?? null,
      },
      lifecycleState: 'active',
    },
    actorIdentityId
  );

  addIdentityGraphEdge(worker.identityId, org.identityId, 'belongs_to', undefined, actorIdentityId);
  addIdentityGraphEdge(input.ownerIdentityId, worker.identityId, 'operates', undefined, actorIdentityId);

  if (input.companyIdentityId) {
    createCompanyMembership({
      actorIdentityId: worker.identityId,
      companyIdentityId: input.companyIdentityId,
      membershipType: 'ai_worker',
      actorIdentityIdForAudit: actorIdentityId,
    });
  }

  if (input.roleTemplate) {
    assignIdentityRole({
      identityId: worker.identityId,
      roleTemplate: input.roleTemplate,
      scope: input.companyIdentityId ? 'company' : 'organization',
      scopeIdentityId: input.companyIdentityId ?? org.identityId,
      source: 'system',
      actorIdentityId,
    });
  }

  return worker;
}

export function pauseAiWorkerIdentity(
  identityId: string,
  actorIdentityId: string | null = null
): IdentityRecord | undefined {
  const worker = getAiWorkerIdentity(identityId);
  if (!worker) return undefined;
  return setIdentityLifecycleState(identityId, 'suspended', actorIdentityId);
}

export function retireAiWorkerIdentity(
  identityId: string,
  actorIdentityId: string | null = null
): IdentityRecord | undefined {
  const worker = getAiWorkerIdentity(identityId);
  if (!worker) return undefined;
  return setIdentityLifecycleState(identityId, 'archived', actorIdentityId);
}

export function listAiWorkersInOrganization(organizationIdentityId: string): IdentityRecord[] {
  return listAiWorkerIdentities().filter((w) =>
    w.organizationIds.includes(organizationIdentityId)
  );
}
