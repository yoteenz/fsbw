import { useEffect } from 'react';
import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { InstituteWorkspace } from '../../../../components/admin/studio/institute/InstituteWorkspace';

/**
 * The Institute of Knowledge™ — institutional knowledge governance platform.
 */
export default function AdminStudioInstitutePage() {
  useEffect(() => {
    document.body.classList.add('institute-of-knowledge-active');
    return () => document.body.classList.remove('institute-of-knowledge-active');
  }, []);

  return (
    <DepartmentGoldenBuildShell>
      <InstituteWorkspace />
    </DepartmentGoldenBuildShell>
  );
}
