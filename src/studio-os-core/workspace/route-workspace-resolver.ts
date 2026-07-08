import { NDXBOOK_WORKSPACE_ID } from '../ndxbook/constants';
import { isPlatformAdministrationPath } from '../application/platform-paths';
import { isLegacyFrontalSlayerStudioPath } from './headquarters-module-resolver';
import { STUDIO_OS_DEFAULT_WORKSPACE_ID, STUDIO_PLATFORM_WORKSPACE_ID } from './storage';

export function isNdxbookScopedRoute(pathname: string, search: string): boolean {
  return (
    pathname.includes('/studio/ndxbook') ||
    pathname.includes('/studio-os/workspace/ai-media/studio/ndxbook') ||
    pathname.includes('/studio-os/workspace/ai-media/') ||
    pathname.includes('/workspace/ai-media') ||
    search.includes('brand=ndxbook')
  );
}

/**
 * Resolve organization workspace from the current URL.
 * Returns null when the route does not imply a specific workspace (e.g. /admin/headquarters).
 */
export function resolveWorkspaceIdFromRoute(pathname: string, search: string): string | null {
  if (isPlatformAdministrationPath(pathname)) {
    return STUDIO_PLATFORM_WORKSPACE_ID;
  }

  const workspaceMatch = pathname.match(/\/admin\/studio-os\/workspace\/([^/]+)/);
  if (workspaceMatch?.[1]) {
    return workspaceMatch[1];
  }

  if (isNdxbookScopedRoute(pathname, search)) {
    return NDXBOOK_WORKSPACE_ID;
  }

  if (isLegacyFrontalSlayerStudioPath(pathname)) {
    return STUDIO_OS_DEFAULT_WORKSPACE_ID;
  }

  return null;
}

export type RouteMembershipContext = {
  isPortfolioOwner: boolean;
  workspaceId: string | null;
};

function resolveWorkspaceIdFromMembership(membership: RouteMembershipContext): string {
  if (membership.isPortfolioOwner || !membership.workspaceId) {
    return STUDIO_PLATFORM_WORKSPACE_ID;
  }
  return membership.workspaceId;
}

/** Bootstrap workspace: URL wins over membership defaults on hard refresh. */
export function resolveBootstrapWorkspaceId(
  pathname: string,
  search: string,
  membership: RouteMembershipContext
): string {
  return resolveWorkspaceIdFromRoute(pathname, search) ?? resolveWorkspaceIdFromMembership(membership);
}
