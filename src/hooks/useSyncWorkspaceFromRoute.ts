import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import { NDXBOOK_WORKSPACE_ID } from '../studio-os-core/ndxbook/constants';

/** Map Studio OS routes to platform workspace ids — active org follows URL, not storage defaults. */
function resolveWorkspaceIdFromPath(pathname: string): string | null {
  if (
    pathname.includes('/studio/ndxbook') ||
    pathname.includes('/workspace/ai-media') ||
    pathname.includes('brand=ndxbook')
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

/** Keep active workspace aligned with organization routes before paint. */
export function useSyncWorkspaceFromRoute(): void {
  const { pathname } = useLocation();
  const { workspaceId, setActiveWorkspace } = useWorkspace();

  useLayoutEffect(() => {
    const routeWorkspaceId = resolveWorkspaceIdFromPath(pathname);
    if (routeWorkspaceId && routeWorkspaceId !== workspaceId) {
      setActiveWorkspace(routeWorkspaceId);
    }
  }, [pathname, workspaceId, setActiveWorkspace]);
}
