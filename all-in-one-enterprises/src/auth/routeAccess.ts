import type { AioAuthSession } from './authService';
import type { RouteGuardKind } from '../product-graph/types';

export type AccessDecision = 'ALLOW' | 'DENY' | 'REDIRECT_LOGIN' | 'REDIRECT_PORTAL' | 'REDIRECT_HOME';

export interface RouteAccessContext {
  guard: RouteGuardKind;
  session: AioAuthSession | null;
  isDemoUnauthenticated: boolean;
}

export function evaluateRouteAccess(ctx: RouteAccessContext): AccessDecision {
  const { guard, session, isDemoUnauthenticated } = ctx;

  if (guard === 'NONE') return 'ALLOW';

  if (isDemoUnauthenticated) {
    return guard === 'CUSTOMER' || guard === 'SHIPPER' ? 'ALLOW' : 'ALLOW';
  }

  if (!session?.user) {
    return 'REDIRECT_LOGIN';
  }

  switch (guard) {
    case 'OFFICE':
      if (!session.isInternal) return 'REDIRECT_PORTAL';
      return 'ALLOW';
    case 'CUSTOMER':
    case 'SHIPPER':
      if (session.isInternal) return 'ALLOW';
      return 'ALLOW';
    case 'PROVIDER':
      if (session.isInternal && !session.fleetcareProviderId) return 'REDIRECT_PORTAL';
      if (!session.fleetcareProviderId) return 'REDIRECT_PORTAL';
      return 'ALLOW';
    case 'DRIVER':
      if (session.isInternal && !session.driverProfileId) return 'REDIRECT_PORTAL';
      if (!session.driverProfileId) return 'REDIRECT_PORTAL';
      return 'ALLOW';
    default:
      return 'ALLOW';
  }
}

/** Tenant / resource scope policy checks (pure — used in guard test matrix). */
export function canAccessResourceScope(input: {
  actorOrgId: string | null;
  resourceOrgId: string;
  actorUserId: string;
  resourceOwnerUserId?: string;
  sameTenantRequired: boolean;
}): boolean {
  if (!input.sameTenantRequired) return true;
  if (!input.actorOrgId) return false;
  if (input.actorOrgId !== input.resourceOrgId) return false;
  if (input.resourceOwnerUserId && input.resourceOwnerUserId !== input.actorUserId) {
    return false;
  }
  return true;
}

export function canStaffAccessSystemAdmin(internalRole: string | null): boolean {
  return internalRole === 'super_admin' || internalRole === 'administrator';
}
