import { Navigate, Outlet } from 'react-router-dom';
import { useWorkspace } from '../../../studio-os/context/WorkspaceProvider';
import { STUDIO_OS_DEFAULT_WORKSPACE_ID } from '../../../studio-os/workspace/storage';
import { STUDIO_OS_ROUTES } from '../../../studio-os/workspace/routes';

/**
 * Ensures Studio module routes only run for workspaces with studio enabled.
 * Placeholder workspaces redirect to their workspace shell.
 */
export default function StudioWorkspaceGuard() {
  const { workspaceId, workspace } = useWorkspace();

  if (!workspace.studioEnabled || workspaceId !== STUDIO_OS_DEFAULT_WORKSPACE_ID) {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceShell(workspaceId)} replace />;
  }

  return <Outlet />;
}
