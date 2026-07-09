import { Navigate, useParams } from 'react-router-dom';
import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { EvolutionRoomWorkspace } from '../../../../components/admin/studio/evolution-room';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';
import { isValidErRoomPath } from '../../../../studio-os-core/genesis';

/**
 * The Evolution Room™ — monthly executive strategy session.
 * `/admin/studio/evolution-room` and sub-rooms.
 */
export default function AdminStudioEvolutionRoomPage() {
  useRequireAdminPageAccess();
  const { workspace } = useWorkspace();
  const { roomSlug } = useParams<{ roomSlug?: string }>();

  if (!workspace.studioEnabled) {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceShell(workspace.id)} replace />;
  }

  if (roomSlug && !isValidErRoomPath(roomSlug)) {
    return <Navigate to="/admin/studio/evolution-room" replace />;
  }

  return (
    <DepartmentGoldenBuildShell>
      <EvolutionRoomWorkspace />
    </DepartmentGoldenBuildShell>
  );
}
