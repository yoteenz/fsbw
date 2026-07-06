import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useWorkspace } from '../../../studio-os-core/context/WorkspaceProvider';
import { STUDIO_OS_DEFAULT_WORKSPACE_ID, STUDIO_PLATFORM_WORKSPACE_ID } from '../../../studio-os-core/workspace/storage';
import { workspaceStudioModulePath } from '../../../studio-os-core/workspace/routes';
import { isLegacyFrontalSlayerStudioPath } from '../../../studio-os-core/workspace/headquarters-module-resolver';
import { activateWorkspaceContext } from '../../../studio-os-core/workspace/context-bridge';
import { getCachedOrgMembership } from '../../../studio-os-core/auth/membership';
import { canSwitchOrganizations } from '../../../studio-os-core/application/portfolio-access';
import { isPlatformAdministrationPath } from '../../../studio-os-core/application/platform-paths';
import { ORGANIZATION_ROUTES } from '../../../studio-os-core/application/routes';

/**
 * Route boundary enforcement:
 * - Studio Administration (/admin/studio-os/* except workspace/*) never inherits organization context.
 * - Legacy /admin/studio/* resolves to Frontal Slayer Headquarters only when explicitly assigned or switching.
 * - Non-FS organizations use workspace-scoped /admin/studio-os/workspace/:id/studio/* paths.
 */
export default function StudioWorkspaceGuard() {
  const { workspaceId, workspace, enterWorkspace } = useWorkspace();
  const { pathname, search } = useLocation();
  const legacyFsPath = isLegacyFrontalSlayerStudioPath(pathname);
  const platformPath = isPlatformAdministrationPath(pathname);
  const headquartersEntryPath = pathname === ORGANIZATION_ROUTES.headquartersEntry;

  useEffect(() => {
    if (platformPath && workspaceId !== STUDIO_PLATFORM_WORKSPACE_ID) {
      activateWorkspaceContext(STUDIO_PLATFORM_WORKSPACE_ID);
      enterWorkspace(STUDIO_PLATFORM_WORKSPACE_ID);
    }
  }, [platformPath, workspaceId, enterWorkspace]);

  useEffect(() => {
    if (platformPath || !legacyFsPath) return;
    const ndxbookRoute =
      pathname.includes('/studio/ndxbook') ||
      pathname.includes('/studio-os/workspace/ai-media/studio/ndxbook') ||
      search.includes('brand=ndxbook');
    if (ndxbookRoute) return;
    if (workspaceId !== STUDIO_OS_DEFAULT_WORKSPACE_ID) {
      activateWorkspaceContext(STUDIO_OS_DEFAULT_WORKSPACE_ID);
      enterWorkspace(STUDIO_OS_DEFAULT_WORKSPACE_ID);
    }
  }, [platformPath, legacyFsPath, workspaceId, enterWorkspace, pathname, search]);

  if (platformPath) {
    return <Outlet />;
  }

  if (!workspace.studioEnabled && !legacyFsPath && !headquartersEntryPath) {
    return <Navigate to={workspaceStudioModulePath(workspaceId, 'mission-control')} replace />;
  }

  if (legacyFsPath) {
    const assigned = getCachedOrgMembership();
    const mayUseLegacyFs =
      assigned.workspaceId === STUDIO_OS_DEFAULT_WORKSPACE_ID || canSwitchOrganizations();

    if (!mayUseLegacyFs && assigned.workspaceId) {
      const rest = pathname.replace('/admin/studio/', '') || 'mission-control';
      const target = `${workspaceStudioModulePath(assigned.workspaceId, rest)}${search}`;
      return <Navigate to={target} replace />;
    }

    return <Outlet />;
  }

  if (
    workspaceId !== STUDIO_OS_DEFAULT_WORKSPACE_ID &&
    pathname.startsWith('/admin/studio/') &&
    !pathname.startsWith('/admin/studio-os')
  ) {
    const rest = pathname.replace('/admin/studio/', '') || 'mission-control';
    const target = `${workspaceStudioModulePath(workspaceId, rest)}${search}`;
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
}
