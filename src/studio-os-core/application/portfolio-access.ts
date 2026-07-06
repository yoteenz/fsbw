/**
 * Portfolio owner access — Studio Administration layer.
 * Organization scope resolved via Supabase membership (env fallback during migration).
 */

import { getCachedOrgMembership } from '../auth/membership';
import { tryGetStudioOsAuthProvider } from '../auth/provider';
import { STUDIO_OS_DEFAULT_WORKSPACE_ID } from '../workspace/storage';

function readPortfolioOwnerEmails(): string[] {
  const raw =
    (typeof import.meta !== 'undefined' &&
      (import.meta as { env?: { VITE_PORTFOLIO_OWNER_EMAILS?: string } }).env?.VITE_PORTFOLIO_OWNER_EMAILS) ||
    '';
  return String(raw)
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function resolvePortfolioOwnerFromEnv(email: string): boolean {
  const envOwners = readPortfolioOwnerEmails();
  return envOwners.length > 0 && envOwners.includes(email);
}

/** True when the signed-in user may access Studio Administration (portfolio control plane). */
export function isPortfolioOwner(user?: { email?: string } | null): boolean {
  const membership = getCachedOrgMembership();
  if (membership.isPortfolioOwner) return true;

  const provider = tryGetStudioOsAuthProvider();
  const resolvedUser = user ?? provider?.getCurrentUser() ?? null;
  if (!resolvedUser?.email) return false;

  const email = resolvedUser.email.trim().toLowerCase();
  if (provider?.isPortfolioOwnerEmail(email)) return true;
  return resolvePortfolioOwnerFromEnv(email);
}

export function canAccessStudioAdministration(): boolean {
  return isPortfolioOwner();
}

/** Organization workspace assigned to the current admin session — null means no default company. */
export function getAssignedOrganizationWorkspaceId(): string | null {
  return getCachedOrgMembership().workspaceId;
}

/**
 * Resolved organization for headquarters routes on the host deployment (e.g. fsbw → Frontal Slayer).
 * Studio Command Center stays platform-scoped; headquarters is always a company workspace.
 */
export function requireOrganizationWorkspaceId(): string {
  const assigned = getAssignedOrganizationWorkspaceId();
  if (assigned) return assigned;
  return STUDIO_OS_DEFAULT_WORKSPACE_ID;
}

/** Whether the user may switch between organizations in the workspace registry. */
export function canSwitchOrganizations(): boolean {
  return isPortfolioOwner();
}
