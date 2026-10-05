import { describe, expect, it } from 'vitest';
import {
  assertStructuralGraphValid,
  validateInboxContainer,
  validateProductGraph,
  validateRoleProjections,
  validateRouteMetaRegistry,
} from './validators';
import { getRouteMetaRegistry, getRuntimeProductGraph } from './runtimeGraph';
import { canViewCarrierPay, canViewGrossMargin, canViewShipperCharge } from '../brokerage/brokerageRules';
import { evaluateRouteAccess, canAccessResourceScope, canStaffAccessSystemAdmin } from '../auth/routeAccess';

describe('Wave 0 product graph', () => {
  it('loads runtime graph from forensic canonical source', () => {
    const graph = getRuntimeProductGraph();
    expect(graph.families).toHaveLength(18);
    expect(graph.role_projections).toHaveLength(4);
    expect(graph.nodes.length).toBeGreaterThan(200);
  });

  it('passes product graph validator', () => {
    expect(validateProductGraph()).toEqual([]);
    expect(validateRouteMetaRegistry()).toEqual([]);
    expect(validateRoleProjections()).toEqual([]);
    expect(validateInboxContainer()).toEqual([]);
    expect(() => assertStructuralGraphValid()).not.toThrow();
  });

  it('covers active material routes with meta entries', () => {
    const registry = getRouteMetaRegistry();
    expect(registry.entries.length).toBeGreaterThan(200);
    const inbox = registry.entries.find((e) => e.path === '/portal/inbox' || e.path.endsWith('/portal/inbox'));
    expect(inbox?.container).toBe('INBOX');
    expect(inbox?.family_id).toBe('F17');
  });
});

describe('Guard test matrix (policy)', () => {
  it('denies anon on protected customer route expectation', () => {
    const decision = evaluateRouteAccess({ guard: 'CUSTOMER', session: null, isDemoUnauthenticated: false });
    expect(decision).toBe('REDIRECT_LOGIN');
  });

  it('denies customer A from customer B org resource', () => {
    expect(
      canAccessResourceScope({
        actorOrgId: 'org-a',
        resourceOrgId: 'org-b',
        actorUserId: 'user-a',
        sameTenantRequired: true,
      }),
    ).toBe(false);
  });

  it('denies shipper from carrier pay and carrier from shipper charge views', () => {
    expect(canViewCarrierPay('shipper')).toBe(false);
    expect(canViewShipperCharge('carrier')).toBe(false);
    expect(canViewGrossMargin('shipper')).toBe(false);
    expect(canViewGrossMargin('carrier')).toBe(false);
  });

  it('denies non-admin staff from system admin areas', () => {
    expect(canStaffAccessSystemAdmin('dispatcher')).toBe(false);
    expect(canStaffAccessSystemAdmin('super_admin')).toBe(true);
  });

  it('denies provider without membership', () => {
    const decision = evaluateRouteAccess({
      guard: 'PROVIDER',
      session: {
        user: { id: 'u1' } as never,
        session: {} as never,
        profile: null,
        organization: null,
        membershipRole: null,
        internalRole: null,
        isInternal: false,
        emailVerified: true,
        fleetcareProviderId: null,
        driverProfileId: null,
      },
      isDemoUnauthenticated: false,
    });
    expect(decision).toBe('REDIRECT_PORTAL');
  });

  it('allows authorized provider membership', () => {
    const decision = evaluateRouteAccess({
      guard: 'PROVIDER',
      session: {
        user: { id: 'u1' } as never,
        session: {} as never,
        profile: null,
        organization: null,
        membershipRole: null,
        internalRole: null,
        isInternal: false,
        emailVerified: true,
        fleetcareProviderId: 'prov-1',
        driverProfileId: null,
      },
      isDemoUnauthenticated: false,
    });
    expect(decision).toBe('ALLOW');
  });
});
