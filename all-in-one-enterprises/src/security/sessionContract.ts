import type { AioMembershipRole, AioInternalRole } from '../data/supabase/database.types';
import type { AioAuthSession } from '../auth/authService';

/**
 * Safe session surface for UI and client authorization — no raw JWT / refresh token.
 */
export interface AioSessionContract {
  userId: string;
  authState: 'authenticated' | 'anonymous';
  emailVerified: boolean;
  activeOrganizationId: string | null;
  organizationIds: string[];
  membershipRole: AioMembershipRole | null;
  internalRole: AioInternalRole | null;
  isInternal: boolean;
  portalProjection: 'CUSTOMER' | 'SHIPPER' | 'DRIVER' | 'FLEETCARE_PROVIDER' | 'AIO_OFFICE' | null;
  fleetcareProviderId: string | null;
  driverProfileId: string | null;
  permissions: string[];
}

export function resolvePortalProjection(session: AioAuthSession | null): AioSessionContract['portalProjection'] {
  if (!session?.user) return null;
  if (session.isInternal) return 'AIO_OFFICE';
  if (session.fleetcareProviderId) return 'FLEETCARE_PROVIDER';
  if (session.driverProfileId) return 'DRIVER';
  if (session.organization?.organizationType === 'shipper') return 'SHIPPER';
  return 'CUSTOMER';
}

export function toSessionContract(session: AioAuthSession | null): AioSessionContract {
  if (!session?.user) {
    return {
      userId: '',
      authState: 'anonymous',
      emailVerified: false,
      activeOrganizationId: null,
      organizationIds: [],
      membershipRole: null,
      internalRole: null,
      isInternal: false,
      portalProjection: null,
      fleetcareProviderId: null,
      driverProfileId: null,
      permissions: [],
    };
  }

  const orgId = session.organization?.id ?? null;
  return {
    userId: session.user.id,
    authState: 'authenticated',
    emailVerified: session.emailVerified,
    activeOrganizationId: orgId,
    organizationIds: orgId ? [orgId] : [],
    membershipRole: session.membershipRole,
    internalRole: session.internalRole,
    isInternal: session.isInternal,
    portalProjection: resolvePortalProjection(session),
    fleetcareProviderId: session.fleetcareProviderId,
    driverProfileId: session.driverProfileId,
    permissions: [],
  };
}

export type AuthSecurityErrorCode =
  | 'UNAUTHENTICATED'
  | 'UNAUTHORIZED'
  | 'TENANT_MISMATCH'
  | 'RESOURCE_NOT_FOUND'
  | 'SESSION_EXPIRED'
  | 'MEMBERSHIP_REVOKED'
  | 'ROLE_MISMATCH'
  | 'RLS_DENIED';

export function mapSupabaseErrorToSecurityCode(message: string): AuthSecurityErrorCode {
  const lower = message.toLowerCase();
  if (lower.includes('jwt') || lower.includes('not authenticated')) return 'UNAUTHENTICATED';
  if (lower.includes('permission denied') || lower.includes('row-level security')) return 'RLS_DENIED';
  if (lower.includes('invalid') && lower.includes('token')) return 'SESSION_EXPIRED';
  return 'UNAUTHORIZED';
}
