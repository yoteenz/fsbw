import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { ExperienceLabWorkspace } from '../../../../components/admin/studio/experience-lab';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';
import { recordExperienceLabOpened } from '../../../../studio-os-core/genesis';

/**
 * Experience Lab™ — permanent development environment for Studio Experience™.
 * `/admin/studio/experience-lab`
 */
export default function AdminStudioExperienceLabPage() {
  useRequireAdminPageAccess();
  const { workspace } = useWorkspace();

  useEffect(() => {
    recordExperienceLabOpened();
  }, []);

  if (!workspace.studioEnabled) {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceShell(workspace.id)} replace />;
  }

  return (
    <DepartmentGoldenBuildShell>
      <ExperienceLabWorkspace />
    </DepartmentGoldenBuildShell>
  );
}
