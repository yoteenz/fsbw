import { useEffect } from 'react';
import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { CareerHubWorkspace } from '../../../../components/admin/studio/career-worlds/CareerHubWorkspace';

/**
 * Career Worlds™ — persistent professional simulation engine.
 * Career Hub prototype (not Frontal Slayer Academy; not an LMS).
 */
export default function AdminStudioCareerWorldsPage() {
  useEffect(() => {
    document.body.classList.add('career-worlds-active');
    return () => document.body.classList.remove('career-worlds-active');
  }, []);

  return (
    <DepartmentGoldenBuildShell>
      <CareerHubWorkspace />
    </DepartmentGoldenBuildShell>
  );
}
