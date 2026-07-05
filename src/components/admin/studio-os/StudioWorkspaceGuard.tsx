import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useWorkspace } from '../../../studio-os-core/context/WorkspaceProvider';
import { STUDIO_OS_DEFAULT_WORKSPACE_ID } from '../../../studio-os-core/workspace/storage';
import { STUDIO_OS_ROUTES, workspaceStudioModulePath } from '../../../studio-os-core/workspace/routes';

/**
 * Ensures Studio module routes only run for workspaces with studio enabled.
 * Non-default workspaces on legacy /admin/studio/* redirect to workspace-scoped routes.
 */
export default function StudioWorkspaceGuard() {
  const { workspaceId, workspace } = useWorkspace();
  const { pathname } = useLocation();

  if (!workspace.studioEnabled) {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceShell(workspaceId)} replace />;
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
