import { Navigate, useParams } from 'react-router-dom';
import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { BrandDiscoveryEngineWorkspace } from '../../../../components/admin/studio/brand-discovery-engine';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';
import { isValidXbdRoomPath, recordBrandDiscoveryEngineOpened } from '../../../../studio-os-core/genesis';
import { useEffect } from 'react';

/**
 * Brand Discovery Engine™ — strategic Brand DNA discovery, registry, and intelligence layer.
 * `/admin/studio/brand-discovery-engine` and subsystem rooms.
 */
export default function AdminStudioBrandDiscoveryEnginePage() {
  useRequireAdminPageAccess();
  const { workspace } = useWorkspace();
  const { roomSlug } = useParams<{ roomSlug?: string }>();

  useEffect(() => {
    recordBrandDiscoveryEngineOpened();
  }, []);

  if (!workspace.studioEnabled) {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceShell(workspace.id)} replace />;
  }

  if (roomSlug && !isValidXbdRoomPath(roomSlug)) {
    return <Navigate to="/admin/studio/brand-discovery-engine" replace />;
  }

  return (
    <DepartmentGoldenBuildShell>
      <BrandDiscoveryEngineWorkspace />
    </DepartmentGoldenBuildShell>
  );
}
