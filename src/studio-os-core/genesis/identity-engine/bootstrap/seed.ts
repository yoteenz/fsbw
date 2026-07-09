import { createAiWorkerIdentity } from '../ai-workers/ai-workers';
import { createCompanyIdentity } from '../companies/companies';
import { recomputeIdentityIndexes } from '../identity/registry';
import { createCompanyMembership } from '../memberships/memberships';
import { mutateIdentityEngineStore, readIdentityEngineStore } from '../persistence';
import { createOrganizationIdentity } from '../organizations/organizations';
import { assignIdentityRole } from '../roles/role-engine';
import { createUserIdentity } from '../users/users';

function now(): string {
  return new Date().toISOString();
}

/**
 * Bootstrap generic platform identity fixtures — no brand-specific hardcoding.
 * Provides a minimal tenant/org/company/steward for engine self-validation.
 */
export function seedIdentityEngineStore(): void {
  const existing = readIdentityEngineStore();
  if (existing.seededAt && existing.identities.length > 0) {
    recomputeIdentityIndexes();
    return;
  }

  const timestamp = now();

  const steward = createUserIdentity({
    displayName: 'Platform Steward',
    officialName: 'Studio OS Platform Steward',
    identityType: 'user',
    metadata: { platformRole: 'steward', generic: true },
  });

  const org = createOrganizationIdentity(
    {
      displayName: 'Studio Platform Tenant',
      officialName: 'Studio Platform Tenant',
      stewardIdentityId: steward.identityId,
      metadata: { generic: true, purpose: 'platform-bootstrap' },
    },
    steward.identityId
  );

  assignIdentityRole({
    identityId: steward.identityId,
    roleTemplate: 'org_owner',
    scope: 'organization',
    scopeIdentityId: org.identityId,
    source: 'system',
    actorIdentityId: steward.identityId,
  });

  const company = createCompanyIdentity(
    {
      displayName: 'Demo Company',
      officialName: 'Demo Company',
      organizationIdentityId: org.identityId,
      stewardIdentityId: steward.identityId,
      metadata: { generic: true },
    },
    steward.identityId
  );

  if (company) {
    createCompanyMembership({
      actorIdentityId: steward.identityId,
      companyIdentityId: company.identityId,
      membershipType: 'founder',
      primary: true,
      actorIdentityIdForAudit: steward.identityId,
    });

    assignIdentityRole({
      identityId: steward.identityId,
      roleTemplate: 'company_admin',
      scope: 'company',
      scopeIdentityId: company.identityId,
      source: 'system',
      actorIdentityId: steward.identityId,
    });

    createAiWorkerIdentity(
      {
        displayName: 'Platform Concierge',
        officialName: 'Platform Concierge',
        ownerIdentityId: steward.identityId,
        organizationIdentityId: org.identityId,
        companyIdentityId: company.identityId,
        roleTemplate: 'concierge_operator',
        metadata: { generic: true, actorKind: 'ai' },
      },
      steward.identityId
    );
  }

  mutateIdentityEngineStore((store) => ({
    ...store,
    seededAt: timestamp,
    bootstrappedAt: timestamp,
  }));

  recomputeIdentityIndexes();
}

export function ensureIdentityEngineStore() {
  const store = readIdentityEngineStore();
  if (!store.seededAt || store.identities.length === 0) {
    seedIdentityEngineStore();
    return readIdentityEngineStore();
  }
  if (!store.bootstrappedAt) {
    mutateIdentityEngineStore((current) => ({
      ...current,
      bootstrappedAt: now(),
    }));
  }
  recomputeIdentityIndexes();
  return readIdentityEngineStore();
}

export function recomputeIdentityEngine(): void {
  recomputeIdentityIndexes();
}
