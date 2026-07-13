import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import {
  DepartmentGoldenBuildShell,
} from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { ExperienceLabErrorBoundary } from '../../../../components/admin/studio/experience-lab/ExperienceLabErrorBoundary';
import { ExperienceLabWorkspace } from '../../../../components/admin/studio/experience-lab/ExperienceLabWorkspace';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';

const EXPERIENCE_LAB_ROUTE = '/admin/studio/experience-lab';

/**
 * Experience Lab™ — permanent development environment for Studio Experience™.
 * `/admin/studio/experience-lab`
 */
export default function AdminStudioExperienceLabPage() {
  useRequireAdminPageAccess();
  const { workspace } = useWorkspace();

  useEffect(() => {
    void import('../../../../studio-os-core/genesis/experience-lab/engine')
      .then((mod) => mod.recordExperienceLabOpened())
      .catch((err) => {
        console.warn('[ExperienceLab] recordExperienceLabOpened failed', err);
      });
  }, []);

  if (!workspace.studioEnabled) {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceShell(workspace.id)} replace />;
  }

  return (
    <DepartmentGoldenBuildShell>
      <ExperienceLabErrorBoundary route={EXPERIENCE_LAB_ROUTE}>
        <ExperienceLabWorkspace />
      </ExperienceLabErrorBoundary>
    </DepartmentGoldenBuildShell>
  );
}
