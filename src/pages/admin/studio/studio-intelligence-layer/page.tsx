import { Navigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { StudioIntelligenceLayerWorkspace } from '../../../../components/admin/studio/studio-intelligence-layer';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';
import { isValidXsilRoomPath, recordStudioIntelligenceLayerOpened } from '../../../../studio-os-core/genesis';

/**
 * Studio Intelligence Layer™ — executive reasoning infrastructure.
 * `/admin/studio/studio-intelligence-layer` and subsystem rooms.
 */
export default function AdminStudioIntelligenceLayerPage() {
  useRequireAdminPageAccess();
  const { workspace } = useWorkspace();
  const { roomSlug } = useParams<{ roomSlug?: string }>();

  useEffect(() => {
    recordStudioIntelligenceLayerOpened();
  }, []);

  if (!workspace.studioEnabled) {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceShell(workspace.id)} replace />;
  }

  if (roomSlug && !isValidXsilRoomPath(roomSlug)) {
    return <Navigate to="/admin/studio/studio-intelligence-layer" replace />;
  }

  return (
    <DepartmentGoldenBuildShell>
      <StudioIntelligenceLayerWorkspace />
    </DepartmentGoldenBuildShell>
  );
}
