import { Navigate, useParams } from 'react-router-dom';
import { useRequireAdminPageAccess } from '../../../../../hooks/useRequireAdminPageAccess';
import { STUDIO_OS_ROUTES } from '../../../../../studio-os-core/workspace/routes';
import { isKnownWorkspaceId } from '../../../../../workspaces';
import { adminStudioNdxbookNewsroomPath } from '../../../../../utils/adminStudioRoutes';

/** Legacy workspace newsroom URL — canonical Page 001 pipeline lives at /admin/studio/ndxbook/newsroom. */
export default function AdminStudioOsWorkspaceNewsroomPage() {
  useRequireAdminPageAccess();
  const { workspaceId } = useParams<{ workspaceId: string }>();

  if (!workspaceId || !isKnownWorkspaceId(workspaceId)) {
    return <Navigate to={STUDIO_OS_ROUTES.entry} replace />;
  }

  if (workspaceId === 'ai-media') {
    return <Navigate to={adminStudioNdxbookNewsroomPath()} replace />;
  }

  return <Navigate to={STUDIO_OS_ROUTES.workspaceDashboard(workspaceId)} replace />;
}
