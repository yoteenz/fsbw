import { Navigate } from 'react-router-dom';
import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { LiveValidationSystemWorkspace } from '../../../../components/admin/studio/live-validation-system';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';

/**
 * Live Validation System™ — Phase 2 continuous founder validation.
 * `/admin/studio/live-validation-system`
 */
export default function AdminStudioLiveValidationSystemPage() {
  useRequireAdminPageAccess();
  const { workspace } = useWorkspace();

  if (!workspace.studioEnabled) {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceShell(workspace.id)} replace />;
  }

  return (
    <DepartmentGoldenBuildShell>
      <LiveValidationSystemWorkspace />
    </DepartmentGoldenBuildShell>
  );
}
