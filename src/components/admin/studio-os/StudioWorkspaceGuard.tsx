import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useWorkspace } from '../../../studio-os-core/context/WorkspaceProvider';
import { STUDIO_OS_DEFAULT_WORKSPACE_ID } from '../../../studio-os-core/workspace/storage';
import { STUDIO_OS_ROUTES, workspaceStudioModulePath } from '../../../studio-os-core/workspace/routes';
import { isLegacyFrontalSlayerStudioPath } from '../../../studio-os-core/workspace/headquarters-module-resolver';
import { activateWorkspaceContext } from '../../../studio-os-core/workspace/context-bridge';
import { getCachedOrgMembership } from '../../../studio-os-core/auth/membership';
import { canSwitchOrganizations } from '../../../studio-os-core/application/portfolio-access';

/**
 * Route boundary enforcement:
 * - Legacy /admin/studio/* resolves to Frontal Slayer Headquarters context only.
 * - Non-FS organizations use workspace-scoped /admin/studio-os/workspace/:id/studio/* paths.
 */
export default function StudioWorkspaceGuard() {
  const { workspaceId, workspace, enterWorkspace } = useWorkspace();
  const { pathname } = useLocation();
  const legacyFsPath = isLegacyFrontalSlayerStudioPath(pathname);

  useEffect(() => {
    if (!legacyFsPath) return;
    if (workspaceId !== STUDIO_OS_DEFAULT_WORKSPACE_ID) {
      activateWorkspaceContext(STUDIO_OS_DEFAULT_WORKSPACE_ID);
      enterWorkspace(STUDIO_OS_DEFAULT_WORKSPACE_ID);
    }
  }, [legacyFsPath, workspaceId, enterWorkspace]);

  if (!workspace.studioEnabled && !legacyFsPath) {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceShell(workspaceId)} replace />;
  }

  if (legacyFsPath) {
    const assigned = getCachedOrgMembership();
    const mayUseLegacyFs =
      assigned.workspaceId === STUDIO_OS_DEFAULT_WORKSPACE_ID || canSwitchOrganizations();

    if (!mayUseLegacyFs) {
      const segment = pathname.replace('/admin/studio/', '').split('/')[0] ?? 'mission-control';
      return <Navigate to={workspaceStudioModulePath(assigned.workspaceId, segment)} replace />;
    }

    return <Outlet />;
  }

  if (
    workspaceId !== STUDIO_OS_DEFAULT_WORKSPACE_ID &&
    pathname.startsWith('/admin/studio/') &&
    !pathname.startsWith('/admin/studio-os')
  ) {
    const segment = pathname.replace('/admin/studio/', '').split('/')[0] ?? 'mission-control';
    return <Navigate to={workspaceStudioModulePath(workspaceId, segment)} replace />;
  }

  return <Outlet />;
}
