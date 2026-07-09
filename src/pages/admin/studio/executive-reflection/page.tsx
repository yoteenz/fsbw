import { Navigate, useParams } from 'react-router-dom';
import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { ExecutiveReflectionSuiteWorkspace } from '../../../../components/admin/studio/executive-reflection-suite';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';
import { isValidErsRoomPath } from '../../../../studio-os-core/genesis';

/**
 * Executive Reflection Suite™ — Headquarters reflection wing.
 * `/admin/studio/executive-reflection` and sub-rooms.
 */
export default function AdminStudioExecutiveReflectionSuitePage() {
  useRequireAdminPageAccess();
  const { workspace } = useWorkspace();
  const { roomSlug } = useParams<{ roomSlug?: string }>();

  if (!workspace.studioEnabled) {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceShell(workspace.id)} replace />;
  }

  if (roomSlug && !isValidErsRoomPath(roomSlug)) {
    return <Navigate to="/admin/studio/executive-reflection" replace />;
  }

  return (
    <DepartmentGoldenBuildShell>
      <ExecutiveReflectionSuiteWorkspace />
    </DepartmentGoldenBuildShell>
  );
}
