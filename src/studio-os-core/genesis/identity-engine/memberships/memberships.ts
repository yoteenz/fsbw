import { appendIdentityAuditEntry } from '../audit/history';
import { addIdentityGraphEdge } from '../identity-graph/graph';
import { getCompanyIdentity } from '../companies/companies';
import { getOrganizationIdentity } from '../organizations/organizations';
import { recomputeIdentityIndexes } from '../identity/registry';
import { mutateIdentityEngineStore, readIdentityEngineStore } from '../persistence';
import type { MembershipStatus } from '../constants';
import type { CompanyMembership } from '../types';

function now(): string {
  return new Date().toISOString();
}

function createMembershipId(): string {
  return `MBR-${Date.now().toString(36)}`;
}

/** Company Membership™ */
export function listCompanyMemberships(): CompanyMembership[] {
  return [...readIdentityEngineStore().memberships];
}

export function listMembershipsForActor(actorIdentityId: string): CompanyMembership[] {
  return listCompanyMemberships().filter((m) => m.actorIdentityId === actorIdentityId);
}

export function listMembershipsForCompany(companyIdentityId: string): CompanyMembership[] {
  return listCompanyMemberships().filter((m) => m.companyIdentityId === companyIdentityId);
}

export function createCompanyMembership(input: {
  actorIdentityId: string;
  companyIdentityId: string;
  membershipType: CompanyMembership['membershipType'];
  primary?: boolean;
  actorIdentityIdForAudit?: string | null;
}): CompanyMembership | undefined {
  const company = getCompanyIdentity(input.companyIdentityId);
  if (!company) return undefined;

  const orgId = company.organizationIds[0];
  if (!orgId) return undefined;

  const org = getOrganizationIdentity(orgId);
  if (!org) return undefined;

  const timestamp = now();
  const membership: CompanyMembership = {
    membershipId: createMembershipId(),
    actorIdentityId: input.actorIdentityId,
    companyIdentityId: input.companyIdentityId,
    organizationIdentityId: org.identityId,
    membershipType: input.membershipType,
    status: 'active',
    primary: input.primary ?? false,
    joinedAt: timestamp,
  };

  mutateIdentityEngineStore((store) => {
    let memberships = [...store.memberships, membership];
    if (membership.primary) {
      memberships = memberships.map((m) =>
        m.actorIdentityId === input.actorIdentityId && m.membershipId !== membership.membershipId
          ? { ...m, primary: false }
          : m
      );
    }
    return { ...store, memberships };
  });

  addIdentityGraphEdge(
    input.actorIdentityId,
    company.identityId,
    'belongs_to',
    { membershipType: input.membershipType },
    input.actorIdentityIdForAudit ?? null
  );

  appendIdentityAuditEntry({
    identityId: input.actorIdentityId,
    action: 'membership_created',
    actorIdentityId: input.actorIdentityIdForAudit ?? null,
    nextSnapshot: { membership },
  });

  recomputeIdentityIndexes();
  return membership;
}

export function terminateCompanyMembership(
  membershipId: string,
  actorIdentityId: string | null = null
): CompanyMembership | undefined {
  const timestamp = now();
  let updated: CompanyMembership | undefined;

  mutateIdentityEngineStore((store) => {
    const memberships = store.memberships.map((m) => {
      if (m.membershipId !== membershipId) return m;
      updated = { ...m, status: 'terminated' as MembershipStatus, terminatedAt: timestamp };
      return updated;
    });
    return { ...store, memberships };
  });

  if (updated) {
    appendIdentityAuditEntry({
      identityId: updated.actorIdentityId,
      action: 'membership_terminated',
      actorIdentityId,
      previousSnapshot: { membershipId },
    });
    recomputeIdentityIndexes();
  }

  return updated;
}

export function getPrimaryMembership(actorIdentityId: string): CompanyMembership | undefined {
  return listMembershipsForActor(actorIdentityId).find(
    (m) => m.primary && (m.status === 'active' || m.status === 'pending')
  );
}
