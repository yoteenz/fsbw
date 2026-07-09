import { Navigate, useParams } from 'react-router-dom';
import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { ExperienceEngineDnaWorkspace } from '../../../../components/admin/studio/experience-engine-dna';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';
import { isValidXeeRoomPath } from '../../../../studio-os-core/genesis';

/**
 * Experience Engine™ — layered Experience DNA generator.
 * `/admin/studio/experience-engine` and registry + playground rooms.
 */
export default function AdminStudioExperienceEnginePage() {
  useRequireAdminPageAccess();
  const { workspace } = useWorkspace();
  const { roomSlug } = useParams<{ roomSlug?: string }>();

  if (!workspace.studioEnabled) {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceShell(workspace.id)} replace />;
  }

  if (roomSlug && !isValidXeeRoomPath(roomSlug)) {
    return <Navigate to="/admin/studio/experience-engine" replace />;
  }

  return (
    <DepartmentGoldenBuildShell>
      <ExperienceEngineDnaWorkspace />
    </DepartmentGoldenBuildShell>
  );
}
