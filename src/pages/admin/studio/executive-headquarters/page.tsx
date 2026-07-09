import { Navigate } from 'react-router-dom';
import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { ExecutiveHeadquartersWorkspace } from '../../../../components/admin/studio/executive-headquarters';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';

/**
 * Executive Headquarters™ — Studio OS Launch Stack Sprint 1 flagship experience.
 * `/admin/studio/executive-headquarters` and `/admin/studio/executive-headquarters/:roomSlug`
 */
export default function AdminStudioExecutiveHeadquartersPage() {
  useRequireAdminPageAccess();
  const { workspace } = useWorkspace();

  if (!workspace.studioEnabled) {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceShell(workspace.id)} replace />;
  }

  return (
    <DepartmentGoldenBuildShell>
      <ExecutiveHeadquartersWorkspace />
    </DepartmentGoldenBuildShell>
  );
}
