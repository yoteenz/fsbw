import { Navigate } from 'react-router-dom';
import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { FounderAcceptanceTestingWorkspace } from '../../../../components/admin/studio/founder-acceptance-testing';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';

/**
 * Founder Acceptance Testing™ — Studio OS internal validation framework.
 * `/admin/studio/founder-acceptance-testing`
 */
export default function AdminStudioFounderAcceptanceTestingPage() {
  useRequireAdminPageAccess();
  const { workspace } = useWorkspace();

  if (!workspace.studioEnabled) {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceShell(workspace.id)} replace />;
  }

  return (
    <DepartmentGoldenBuildShell>
      <FounderAcceptanceTestingWorkspace />
    </DepartmentGoldenBuildShell>
  );
}
