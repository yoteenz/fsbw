import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import { NDXBOOK_WORKSPACE_ID } from '../studio-os-core/ndxbook/constants';

/** Map Studio OS routes to platform workspace ids — active org follows URL, not storage defaults. */
function resolveWorkspaceIdFromRoute(pathname: string, search: string): string | null {
  if (
    pathname.includes('/studio/ndxbook') ||
    pathname.includes('/studio-os/workspace/ai-media/') ||
    pathname.includes('/workspace/ai-media') ||
    search.includes('brand=ndxbook')
  ) {
    return NDXBOOK_WORKSPACE_ID;
  }
  if (pathname.includes('/workspace/frontal-slayer') || pathname.includes('/studio-os/workspace/frontal-slayer')) {
    return 'frontal-slayer';
  }
  if (pathname.includes('/workspace/vxd-inc') || pathname.includes('/studio-os/workspace/vxd-inc')) {
    return 'vxd-inc';
  }
  if (
    pathname.includes('/workspace/all-in-one-enterprise') ||
    pathname.includes('/studio-os/workspace/all-in-one-enterprise')
  ) {
    return 'all-in-one-enterprise';
  }
  return null;
}

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
