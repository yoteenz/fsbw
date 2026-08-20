/**
 * Studio World Production Governance — canonical scenario tests (XXI).
 */

import { describe, expect, it } from 'vitest';
import {
  canAccessOrganization,
  evaluateProductionGovernance,
  resolveBillingOwner,
  sumReservationCosts,
  sumUsageCosts,
} from './governance';
import {
  FIXTURE_AGENCY_BUDGET,
  FIXTURE_MEMBERSHIPS,
  FIXTURE_ORG_AGENCY,
  FIXTURE_ORG_OWNER,
  FIXTURE_ORG_UNRELATED,
  FIXTURE_USER_B,
  entitlementsForOrg,
  membershipForUser,
} from './fixtures';
import type { ProductionCostReservation, ProductionUsageEvent } from './types';

describe('Production Governance — collaborator scenarios', () => {
  const userB = FIXTURE_USER_B;

  it('Scenario 1: owner org Frontal Slayer campaign — billing owner = owner org', () => {
    const membership = membershipForUser(userB, FIXTURE_ORG_OWNER.id)!;
    expect(membership.role).toBe('PRODUCTION_DIRECTOR');

    const billingOwner = resolveBillingOwner({ organization: FIXTURE_ORG_OWNER });
    expect(billingOwner.billingOwnerId).toBe(FIXTURE_ORG_OWNER.id);

    const result = evaluateProductionGovernance({
      request: {
        context: {
          operatorUserId: userB,
          operatorEmail: userB,
          organizationId: FIXTURE_ORG_OWNER.id,
          organizationSlug: FIXTURE_ORG_OWNER.slug,
          campaignId: 'campaign-a',
        },
        operationType: 'IMAGE_GENERATION',
        provider: 'simulated',
        estimatedCost: 2.5,
      },
      organization: FIXTURE_ORG_OWNER,
      membership,
      entitlements: entitlementsForOrg(FIXTURE_ORG_OWNER.id),
      budget: null,
      actualUsage: 0,
      reservedUsage: 0,
    });

    expect(result.allowed).toBe(true);
    expect(result.billingOwner.billingOwnerId).toBe(FIXTURE_ORG_OWNER.id);
    expect(result.decision).not.toBe('BLOCKED_ENTITLEMENT');
  });

  it('Scenario 2: agency org Client XYZ campaign — billing owner = agency org', () => {
    const membership = membershipForUser(userB, FIXTURE_ORG_AGENCY.id)!;
    const billingOwner = resolveBillingOwner({ organization: FIXTURE_ORG_AGENCY });
    expect(billingOwner.billingOwnerId).toBe(FIXTURE_ORG_AGENCY.id);
    expect(billingOwner.billingOwnerId).not.toBe(FIXTURE_ORG_OWNER.id);

    const result = evaluateProductionGovernance({
      request: {
        context: {
          operatorUserId: userB,
          operatorEmail: userB,
          organizationId: FIXTURE_ORG_AGENCY.id,
          organizationSlug: FIXTURE_ORG_AGENCY.slug,
          clientId: 'client-xyz-id',
          campaignId: 'campaign-b',
        },
        operationType: 'IMAGE_GENERATION',
        provider: 'simulated',
        estimatedCost: 4,
      },
      organization: FIXTURE_ORG_AGENCY,
      membership,
      entitlements: entitlementsForOrg(FIXTURE_ORG_AGENCY.id),
      budget: FIXTURE_AGENCY_BUDGET,
      actualUsage: 50,
      reservedUsage: 0,
    });

    expect(result.allowed).toBe(true);
    expect(result.billingOwner.billingOwnerId).toBe(FIXTURE_ORG_AGENCY.id);
  });

  it('Scenario 3: unrelated organization C — access denied', () => {
    const membership = membershipForUser(userB, FIXTURE_ORG_UNRELATED.id);
    expect(membership).toBeNull();
    expect(canAccessOrganization(membership)).toBe(false);
  });

  it('Scenario 4: agency hard budget blocks $12 request at $295 usage', () => {
    const membership = membershipForUser(userB, FIXTURE_ORG_AGENCY.id)!;
    const result = evaluateProductionGovernance({
      request: {
        context: {
          operatorUserId: userB,
          operatorEmail: userB,
          organizationId: FIXTURE_ORG_AGENCY.id,
          organizationSlug: FIXTURE_ORG_AGENCY.slug,
        },
        operationType: 'IMAGE_GENERATION',
        provider: 'simulated',
        estimatedCost: 12,
      },
      organization: FIXTURE_ORG_AGENCY,
      membership,
      entitlements: entitlementsForOrg(FIXTURE_ORG_AGENCY.id),
      budget: FIXTURE_AGENCY_BUDGET,
      actualUsage: 295,
      reservedUsage: 0,
    });

    expect(result.allowed).toBe(false);
    expect(result.decision).toBe('BLOCKED_BUDGET');
  });

  it('Scenario 5: agency lacks VIDEO_GENERATION — blocked before provider', () => {
    const membership = membershipForUser(userB, FIXTURE_ORG_AGENCY.id)!;
    const result = evaluateProductionGovernance({
      request: {
        context: {
          operatorUserId: userB,
          operatorEmail: userB,
          organizationId: FIXTURE_ORG_AGENCY.id,
          organizationSlug: FIXTURE_ORG_AGENCY.slug,
        },
        operationType: 'VIDEO_GENERATION',
        provider: 'simulated',
        estimatedCost: 8,
      },
      organization: FIXTURE_ORG_AGENCY,
      membership,
      entitlements: entitlementsForOrg(FIXTURE_ORG_AGENCY.id),
      budget: FIXTURE_AGENCY_BUDGET,
      actualUsage: 0,
      reservedUsage: 0,
    });

    expect(result.allowed).toBe(false);
    expect(result.decision).toBe('BLOCKED_ENTITLEMENT');
  });

  it('Scenario 6: failed reservation does not count as completed usage', () => {
    const events: ProductionUsageEvent[] = [
      {
        id: 'u1',
        operatorUserId: userB,
        organizationId: FIXTURE_ORG_AGENCY.id,
        billingOwnerType: 'organization',
        billingOwnerId: FIXTURE_ORG_AGENCY.id,
        provider: 'simulated',
        operationType: 'IMAGE_GENERATION',
        estimatedCost: 5,
        currency: 'USD',
        costSource: 'INTERNAL_ESTIMATE',
        status: 'failed',
        createdAt: new Date().toISOString(),
      },
    ];
    const reservations: ProductionCostReservation[] = [
      {
        id: 'r1',
        organizationId: FIXTURE_ORG_AGENCY.id,
        billingOwnerId: FIXTURE_ORG_AGENCY.id,
        idempotencyKey: 'idem-fail-1',
        estimatedCost: 5,
        currency: 'USD',
        status: 'released',
        operationType: 'IMAGE_GENERATION',
      },
    ];

    expect(sumUsageCosts(events)).toBe(0);
    expect(sumReservationCosts(reservations)).toBe(0);
  });

  it('same operator can belong to multiple organizations', () => {
    const orgs = FIXTURE_MEMBERSHIPS.filter((m) => m.userEmail === userB).map((m) => m.organizationId);
    expect(orgs).toContain(FIXTURE_ORG_OWNER.id);
    expect(orgs).toContain(FIXTURE_ORG_AGENCY.id);
  });

  it('complimentary platform access does not imply unlimited compute — budget still enforced', () => {
    const agencyEntitlements = entitlementsForOrg(FIXTURE_ORG_AGENCY.id);
    expect(agencyEntitlements.some((e) => e.entitlementKey === 'PLATFORM_ACCESS')).toBe(true);
    expect(agencyEntitlements.some((e) => e.source === 'FOUNDING_PARTNER')).toBe(true);

    const membership = membershipForUser(userB, FIXTURE_ORG_AGENCY.id)!;
    const blocked = evaluateProductionGovernance({
      request: {
        context: {
          operatorUserId: userB,
          operatorEmail: userB,
          organizationId: FIXTURE_ORG_AGENCY.id,
          organizationSlug: FIXTURE_ORG_AGENCY.slug,
        },
        operationType: 'IMAGE_GENERATION',
        provider: 'simulated',
        estimatedCost: 50,
      },
      organization: FIXTURE_ORG_AGENCY,
      membership,
      entitlements: agencyEntitlements,
      budget: FIXTURE_AGENCY_BUDGET,
      actualUsage: 280,
      reservedUsage: 0,
    });
    expect(blocked.decision).toBe('BLOCKED_BUDGET');
  });
});
