import { Navigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { NarrativeIntelligenceWorkspace } from '../../../../components/admin/studio/narrative-intelligence';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';
import { isValidXniRoomPath, recordNarrativeIntelligenceOpened } from '../../../../studio-os-core/genesis';

/**
 * Narrative Intelligence™ — executive creative reasoning inside Studio Intelligence™.
 * `/admin/studio/narrative-intelligence` and subsystem rooms.
 */
export default function AdminStudioNarrativeIntelligencePage() {
  useRequireAdminPageAccess();
  const { workspace } = useWorkspace();
  const { roomSlug } = useParams<{ roomSlug?: string }>();

  useEffect(() => {
    recordNarrativeIntelligenceOpened();
  }, []);

  if (!workspace.studioEnabled) {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceShell(workspace.id)} replace />;
  }

  if (roomSlug && !isValidXniRoomPath(roomSlug)) {
    return <Navigate to="/admin/studio/narrative-intelligence" replace />;
  }

  return (
    <DepartmentGoldenBuildShell>
      <NarrativeIntelligenceWorkspace />
    </DepartmentGoldenBuildShell>
  );
}
