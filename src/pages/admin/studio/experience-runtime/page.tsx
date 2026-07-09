import { Navigate, useParams } from 'react-router-dom';
import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { ExperienceRuntimeWorkspace } from '../../../../components/admin/studio/experience-runtime';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';
import { isValidXerRoomPath } from '../../../../studio-os-core/genesis';

/**
 * Experience Runtime™ — real-time experience assembly from layered DNA.
 * `/admin/studio/experience-runtime` and runtime subsystem rooms.
 */
export default function AdminStudioExperienceRuntimePage() {
  useRequireAdminPageAccess();
  const { workspace } = useWorkspace();
  const { roomSlug } = useParams<{ roomSlug?: string }>();

  if (!workspace.studioEnabled) {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceShell(workspace.id)} replace />;
  }

  if (roomSlug && !isValidXerRoomPath(roomSlug)) {
    return <Navigate to="/admin/studio/experience-runtime" replace />;
  }

  return (
    <DepartmentGoldenBuildShell>
      <ExperienceRuntimeWorkspace />
    </DepartmentGoldenBuildShell>
  );
}
