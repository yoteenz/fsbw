import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import { resolveWorkspaceIdFromRoute } from '../studio-os-core/workspace/route-workspace-resolver';

export function useSyncWorkspaceFromRoute(): void {
  const { pathname, search } = useLocation();
  const { workspaceId, setActiveWorkspace } = useWorkspace();

  useLayoutEffect(() => {
    const routeWorkspaceId = resolveWorkspaceIdFromRoute(pathname, search);
    if (routeWorkspaceId && routeWorkspaceId !== workspaceId) {
      setActiveWorkspace(routeWorkspaceId);
    }
  }, [pathname, search, workspaceId, setActiveWorkspace]);
}
