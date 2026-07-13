import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { ExperienceLabErrorBoundary } from '../../../../components/admin/studio/experience-lab/ExperienceLabErrorBoundary';
import { ExperienceLabV2Shell } from '../../../../features/studio-world/experience-lab-v2/ExperienceLabV2Shell';
import { useRequireStudioWorldAdmin } from '../../../../hooks/useRequireStudioWorldAdmin';
import { EXPERIENCE_LAB_V2_ROUTE } from '../../../../features/studio-world/experience-lab-v2/experience-lab-v2.types';

/**
 * Experience Lab V2™ — isolated React-first test environment.
 * Production route /admin/studio/experience-lab remains unchanged.
 */
export default function AdminStudioExperienceLabV2Page() {
  useRequireStudioWorldAdmin();

  return (
    <DepartmentGoldenBuildShell>
      <ExperienceLabErrorBoundary route={EXPERIENCE_LAB_V2_ROUTE}>
        <ExperienceLabV2Shell />
      </ExperienceLabErrorBoundary>
    </DepartmentGoldenBuildShell>
  );
}
