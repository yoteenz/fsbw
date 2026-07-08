import { useEffect } from 'react';
import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { ExperienceObservatoryRoom } from '../../../../components/admin/studio/experience-observatory/ExperienceObservatoryRoom';

/**
 * Experience Observatory™ — Creative Director living observatory inside Studio Command Center™.
 */
export default function AdminStudioExperienceObservatoryPage() {
  useEffect(() => {
    document.body.classList.add('exp-observatory-active');
    return () => document.body.classList.remove('exp-observatory-active');
  }, []);

  return (
    <DepartmentGoldenBuildShell>
      <ExperienceObservatoryRoom />
    </DepartmentGoldenBuildShell>
  );
}
