import { Navigate, useParams } from 'react-router-dom';
import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { StudioOsDesignDnaWorkspace } from '../../../../components/admin/studio/studio-os-design-dna';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';
import { isValidDdnaRoomPath } from '../../../../studio-os-core/genesis';

/**
 * Studio OS Design DNA™ — permanent visual operating system.
 * `/admin/studio/design-dna` and 9 constitutional engine rooms.
 */
export default function AdminStudioDesignDnaPage() {
  useRequireAdminPageAccess();
  const { workspace } = useWorkspace();
  const { roomSlug } = useParams<{ roomSlug?: string }>();

  if (!workspace.studioEnabled) {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceShell(workspace.id)} replace />;
  }

  if (roomSlug && !isValidDdnaRoomPath(roomSlug)) {
    return <Navigate to="/admin/studio/design-dna" replace />;
  }

  return (
    <DepartmentGoldenBuildShell>
      <StudioOsDesignDnaWorkspace />
    </DepartmentGoldenBuildShell>
  );
}
