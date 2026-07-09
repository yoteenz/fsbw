import { Navigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { StudioProductionSystemWorkspace } from '../../../../components/admin/studio/studio-production-system';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';
import { isValidXpsRoomPath, recordStudioProductionSystemOpened } from '../../../../studio-os-core/genesis';

/**
 * Studio Production System™ — autonomous AI production company inside Studio Intelligence™.
 * `/admin/studio/studio-production` and subsystem rooms.
 */
export default function AdminStudioProductionSystemPage() {
  useRequireAdminPageAccess();
  const { workspace } = useWorkspace();
  const { roomSlug } = useParams<{ roomSlug?: string }>();

  useEffect(() => {
    recordStudioProductionSystemOpened();
  }, []);

  if (!workspace.studioEnabled) {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceShell(workspace.id)} replace />;
  }

  if (roomSlug && !isValidXpsRoomPath(roomSlug)) {
    return <Navigate to="/admin/studio/studio-production" replace />;
  }

  return (
    <DepartmentGoldenBuildShell>
      <StudioProductionSystemWorkspace />
    </DepartmentGoldenBuildShell>
  );
}
