/**
 * Development/test fixtures — NOT auto-inserted into production user data.
 */

import type {
  Entitlement,
  OrganizationMembership,
  ProductionBudget,
  StudioWorldOrganization,
} from './types';

export const FIXTURE_USER_A = 'user-a@owner.test';
export const FIXTURE_USER_B = 'user-b@collaborator.test';

export const FIXTURE_ORG_OWNER: StudioWorldOrganization = {
  id: '00000000-0000-4000-8000-000000000001',
  slug: 'frontal-slayer',
  name: 'Frontal Slayer (Owner Organization)',
  organizationType: 'OWNER',
  status: 'active',
};

export const FIXTURE_ORG_AGENCY: StudioWorldOrganization = {
  id: '00000000-0000-4000-8000-000000000002',
  slug: 'founding-partner-agency',
  name: 'Founding Partner Agency',
  organizationType: 'AGENCY',
  status: 'active',
};

export const FIXTURE_ORG_UNRELATED: StudioWorldOrganization = {
  id: '00000000-0000-4000-8000-000000000003',
  slug: 'org-c-inaccessible',
  name: 'Organization C',
  organizationType: 'PARTNER',
  status: 'active',
};

export const FIXTURE_CLIENT_XYZ = {
  id: '00000000-0000-4000-8000-000000000010',
  organizationId: FIXTURE_ORG_AGENCY.id,
  clientKey: 'client-xyz',
  name: 'Client XYZ',
};

export const FIXTURE_MEMBERSHIPS: OrganizationMembership[] = [
  {
    id: 'm1',
    organizationId: FIXTURE_ORG_OWNER.id,
    userEmail: FIXTURE_USER_B,
    role: 'PRODUCTION_DIRECTOR',
    status: 'active',
  },
  {
    id: 'm2',
    organizationId: FIXTURE_ORG_AGENCY.id,
    userEmail: FIXTURE_USER_B,
    role: 'OWNER',
    status: 'active',
  },
];

export const FIXTURE_OWNER_ENTITLEMENTS: Entitlement[] = [
  {
    id: 'e1',
    organizationId: FIXTURE_ORG_OWNER.id,
    entitlementKey: 'PLATFORM_ACCESS',
    status: 'active',
    source: 'SYSTEM',
    startsAt: new Date(0).toISOString(),
  },
  {
    id: 'e2',
    organizationId: FIXTURE_ORG_OWNER.id,
    entitlementKey: 'PRODUCTION_ACCESS',
    status: 'active',
    source: 'SYSTEM',
    startsAt: new Date(0).toISOString(),
  },
  {
    id: 'e3',
    organizationId: FIXTURE_ORG_OWNER.id,
    entitlementKey: 'IMAGE_GENERATION',
    status: 'active',
    source: 'SYSTEM',
    startsAt: new Date(0).toISOString(),
  },
  {
    id: 'e4',
    organizationId: FIXTURE_ORG_OWNER.id,
    entitlementKey: 'VIDEO_GENERATION',
    status: 'active',
    source: 'SYSTEM',
    startsAt: new Date(0).toISOString(),
  },
];

/** Founding partner package: complimentary platform, metered production */
export const FIXTURE_AGENCY_ENTITLEMENTS: Entitlement[] = [
  {
    id: 'e5',
    organizationId: FIXTURE_ORG_AGENCY.id,
    entitlementKey: 'PLATFORM_ACCESS',
    status: 'active',
    source: 'FOUNDING_PARTNER',
    startsAt: new Date(0).toISOString(),
    metadata: { billingModel: 'complimentary_platform' },
  },
  {
    id: 'e6',
    organizationId: FIXTURE_ORG_AGENCY.id,
    entitlementKey: 'PRODUCTION_ACCESS',
    status: 'active',
    source: 'FOUNDING_PARTNER',
    startsAt: new Date(0).toISOString(),
    metadata: { billingModel: 'metered_production' },
  },
  {
    id: 'e7',
    organizationId: FIXTURE_ORG_AGENCY.id,
    entitlementKey: 'IMAGE_GENERATION',
    status: 'active',
    source: 'FOUNDING_PARTNER',
    startsAt: new Date(0).toISOString(),
  },
  // VIDEO_GENERATION intentionally omitted for scenario 5
  {
    id: 'e8',
    organizationId: FIXTURE_ORG_AGENCY.id,
    entitlementKey: 'COMMERCIAL_USE',
    status: 'active',
    source: 'FOUNDING_PARTNER',
    startsAt: new Date(0).toISOString(),
  },
];

export const FIXTURE_AGENCY_BUDGET: ProductionBudget = {
  id: 'b1',
  organizationId: FIXTURE_ORG_AGENCY.id,
  periodType: 'monthly',
  periodStart: new Date(Date.UTC(2026, 7, 1)).toISOString(),
  periodEnd: new Date(Date.UTC(2026, 8, 1)).toISOString(),
  softLimit: 240,
  hardLimit: 300,
  currency: 'USD',
  status: 'active',
};

export function membershipForUser(
  userEmail: string,
  organizationId: string
): OrganizationMembership | null {
  return (
    FIXTURE_MEMBERSHIPS.find(
      (m) => m.userEmail === userEmail && m.organizationId === organizationId && m.status === 'active'
    ) ?? null
  );
}

export function entitlementsForOrg(organizationId: string): Entitlement[] {
  if (organizationId === FIXTURE_ORG_OWNER.id) return FIXTURE_OWNER_ENTITLEMENTS;
  if (organizationId === FIXTURE_ORG_AGENCY.id) return FIXTURE_AGENCY_ENTITLEMENTS;
  return [];
}
