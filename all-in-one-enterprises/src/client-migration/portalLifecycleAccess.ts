import type { ClientLifecycleState } from './types';
import { canAccessClientOffice } from './lifecycle';

export type PortalAccessDecision =
  | 'ALLOW_PORTAL'
  | 'REDIRECT_ACTIVATION'
  | 'REDIRECT_ACTIVATION_REVIEW'
  | 'BLOCK_NO_PORTAL';

export function evaluatePortalPathAccess(
  lifecycle: ClientLifecycleState | undefined,
  pathname: string,
): PortalAccessDecision {
  const state = lifecycle ?? 'KNOWN_UNMIGRATED';

  const isActivationRoute =
    pathname.includes('/office-activation/') ||
    pathname.includes('/portal/activation/') ||
    pathname.includes('/activation/review');

  if (state === 'INVITED') {
    return isActivationRoute ? 'ALLOW_PORTAL' : 'REDIRECT_ACTIVATION';
  }

  if (state === 'CLIENT_CONFIRMATION_REQUIRED') {
    return isActivationRoute ? 'ALLOW_PORTAL' : 'REDIRECT_ACTIVATION_REVIEW';
  }

  if (canAccessClientOffice(state)) {
    return 'ALLOW_PORTAL';
  }

  if (isActivationRoute && (state === 'PREBUILT' || state === 'MIGRATION_REVIEW_REQUIRED')) {
    return 'BLOCK_NO_PORTAL';
  }

  return 'BLOCK_NO_PORTAL';
}
