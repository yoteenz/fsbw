import { useLayoutEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { canAccessStudioAdministration, getAssignedOrganizationWorkspaceId } from '../../../studio-os-core/application/portfolio-access';
import { ORGANIZATION_ROUTES, isStudioAdministrationPath } from '../../../studio-os-core/application/routes';
import { activateWorkspaceContext } from '../../../studio-os-core/workspace/context-bridge';
import { STUDIO_PLATFORM_WORKSPACE_ID } from '../../../studio-os-core/platform/schema';

/**
 * Restricts Studio Administration routes to portfolio owners.
 * Organization operators are redirected to their headquarters entry.
 */
export default function StudioAdministrationGuard() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    if (!isStudioAdministrationPath(pathname)) return;
    if (canAccessStudioAdministration()) {
      activateWorkspaceContext(STUDIO_PLATFORM_WORKSPACE_ID);
      return;
    }
    const assignedId = getAssignedOrganizationWorkspaceId();
    if (assignedId) {
      activateWorkspaceContext(assignedId);
    }
  }, [pathname]);

  if (!isStudioAdministrationPath(pathname)) {
    return <Outlet />;
  }

  if (canAccessStudioAdministration()) {
    return <Outlet />;
  }

  return <Navigate to={ORGANIZATION_ROUTES.headquartersEntry} replace />;
}
