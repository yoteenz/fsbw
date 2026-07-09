import { Navigate, useParams } from 'react-router-dom';
import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { ArchitectsPromptLibraryWorkspace } from '../../../../components/admin/studio/architects-prompt-library';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';
import { isValidAplRoomPath } from '../../../../studio-os-core/genesis';

/**
 * The Architect's Prompt Library™ — Institute of Knowledge™ wing.
 * `/admin/studio/prompt-library` and 12 subsystem rooms.
 */
export default function AdminStudioPromptLibraryPage() {
  useRequireAdminPageAccess();
  const { workspace } = useWorkspace();
  const { roomSlug } = useParams<{ roomSlug?: string }>();

  if (!workspace.studioEnabled) {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceShell(workspace.id)} replace />;
  }

  if (roomSlug && !isValidAplRoomPath(roomSlug)) {
    return <Navigate to="/admin/studio/prompt-library" replace />;
  }

  return (
    <DepartmentGoldenBuildShell>
      <ArchitectsPromptLibraryWorkspace />
    </DepartmentGoldenBuildShell>
  );
}
