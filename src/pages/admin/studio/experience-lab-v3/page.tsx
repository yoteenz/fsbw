import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { ExperienceLabErrorBoundary } from '../../../../components/admin/studio/experience-lab/ExperienceLabErrorBoundary';
import {
  ExperienceLabV3Shell,
  EXPERIENCE_LAB_V3_ROUTE,
} from '../../../../features/studio-world/experience-lab-v3';
import { useRequireStudioWorldAdmin } from '../../../../hooks/useRequireStudioWorldAdmin';

/**
 * Experience Lab V3™ — parallel experimental world-building OS.
 * V2 at /admin/studio/experience-lab-v2 remains frozen and untouched.
 */
export default function AdminStudioExperienceLabV3Page() {
  useRequireStudioWorldAdmin();

  return (
    <DepartmentGoldenBuildShell fixedViewport>
      <ExperienceLabErrorBoundary route={EXPERIENCE_LAB_V3_ROUTE}>
        <ExperienceLabV3Shell />
      </ExperienceLabErrorBoundary>
    </DepartmentGoldenBuildShell>
  );
}
