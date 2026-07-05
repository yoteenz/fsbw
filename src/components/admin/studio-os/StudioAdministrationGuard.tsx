import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { canAccessStudioAdministration, getAssignedOrganizationWorkspaceId } from '../../../studio-os-core/application/portfolio-access';
import { ORGANIZATION_ROUTES, isStudioAdministrationPath } from '../../../studio-os-core/application/routes';
import { activateWorkspaceContext } from '../../../studio-os-core/workspace/context-bridge';

/**
 * Restricts Studio Administration routes to portfolio owners.
 * Organization operators are redirected to their headquarters entry.
 */
export default function StudioAdministrationGuard() {
  const { pathname } = useLocation();

  if (!isStudioAdministrationPath(pathname)) {
    return <Outlet />;
  }

  if (canAccessStudioAdministration()) {
    return <Outlet />;
  }

  const assignedId = getAssignedOrganizationWorkspaceId();
  activateWorkspaceContext(assignedId);
  return <Navigate to={ORGANIZATION_ROUTES.headquartersEntry} replace />;
}
