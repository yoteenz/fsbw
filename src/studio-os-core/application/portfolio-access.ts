/**
 * Portfolio owner access — Studio Administration layer.
 * Only portfolio owners may access workspace registry, cross-org intelligence, and platform settings.
 */

import { getCurrentUser, isAdminFounderAccount } from '../../utils/adminAuth';
import { STUDIO_OS_DEFAULT_WORKSPACE_ID } from '../workspace/storage';

function readPortfolioOwnerEmails(): string[] {
  const raw =
    (typeof import.meta !== 'undefined' && (import.meta as { env?: { VITE_PORTFOLIO_OWNER_EMAILS?: string } }).env?.VITE_PORTFOLIO_OWNER_EMAILS) ||
    '';
  const parsed = String(raw)
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return parsed;
}

/** True when the signed-in user may access Studio Administration (portfolio control plane). */
export function isPortfolioOwner(user: { email?: string } | null = getCurrentUser()): boolean {
  if (!user?.email) return false;
  if (isAdminFounderAccount(user)) return true;
  const email = user.email.trim().toLowerCase();
  const envOwners = readPortfolioOwnerEmails();
  return envOwners.length > 0 && envOwners.includes(email);
}

export function canAccessStudioAdministration(): boolean {
  return isPortfolioOwner();
}

/**
 * Organization workspace assigned to the current admin session.
 * Non-portfolio operators are scoped to a single organization (Frontal Slayer on this deployment).
 */
export function getAssignedOrganizationWorkspaceId(): string {
  return STUDIO_OS_DEFAULT_WORKSPACE_ID;
}

/** Whether the user may switch between organizations in the workspace registry. */
export function canSwitchOrganizations(): boolean {
  return isPortfolioOwner();
}
