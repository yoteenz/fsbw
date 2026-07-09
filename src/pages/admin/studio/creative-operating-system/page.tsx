import { Navigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { CreativeOperatingSystemWorkspace } from '../../../../components/admin/studio/creative-operating-system';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';
import { isValidXcosRoomPath, recordCreativeOperatingSystemOpened } from '../../../../studio-os-core/genesis';

/**
 * Creative Operating System™ — autonomous creative organization inside Studio Intelligence™.
 * `/admin/studio/creative-operating-system` and subsystem rooms.
 */
export default function AdminCreativeOperatingSystemPage() {
  useRequireAdminPageAccess();
  const { workspace } = useWorkspace();
  const { roomSlug } = useParams<{ roomSlug?: string }>();

  useEffect(() => {
    recordCreativeOperatingSystemOpened();
  }, []);

  if (!workspace.studioEnabled) {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceShell(workspace.id)} replace />;
  }

  if (roomSlug && !isValidXcosRoomPath(roomSlug)) {
    return <Navigate to="/admin/studio/creative-operating-system" replace />;
  }

  return (
    <DepartmentGoldenBuildShell>
      <CreativeOperatingSystemWorkspace />
    </DepartmentGoldenBuildShell>
  );
}
