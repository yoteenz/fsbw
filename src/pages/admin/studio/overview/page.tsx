import { Navigate } from 'react-router-dom';
import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { StudioCommandCenterRoom } from '../../../../components/admin/studio/command-center/StudioCommandCenterRoom';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';

/**
 * Studio Command Center™ — `/admin/studio/overview`
 * Executive Atrium™ arrival space. Not a webpage.
 */
export default function AdminStudioOverviewPage() {
  useRequireAdminPageAccess();
  const { workspace } = useWorkspace();

  if (!workspace.studioEnabled) {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceShell(workspace.id)} replace />;
  }

  return (
    <DepartmentGoldenBuildShell>
      <StudioCommandCenterRoom />
    </DepartmentGoldenBuildShell>
  );
}
