import { STUDIO_PLATFORM_WORKSPACE_ID } from '../platform/schema';

/** True when the route belongs to Studio Administration (platform), not an organization headquarters. */
export function isPlatformAdministrationPath(pathname: string): boolean {
  if (!pathname.startsWith('/admin/studio-os')) return false;
  if (pathname.startsWith('/admin/studio-os/workspace/')) return false;
  return true;
}

export function isOrganizationWorkspacePath(pathname: string): boolean {
  return pathname.startsWith('/admin/studio-os/workspace/');
}

/** Whether the active workspace context should remain neutral (no organization). */
export function shouldUsePlatformWorkspaceContext(pathname: string): boolean {
  return isPlatformAdministrationPath(pathname);
}

export function isPlatformWorkspaceId(workspaceId: string): boolean {
  return workspaceId === STUDIO_PLATFORM_WORKSPACE_ID;
}
