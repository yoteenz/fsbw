import { useEffect } from 'react';
import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { HeadquartersPrinciplesWorkspace } from '../../../../components/admin/studio/headquarters-principles/HeadquartersPrinciplesWorkspace';

/**
 * Headquarters Principles™ — ARTICLE-C04 constitutional platform governance.
 */
export default function AdminStudioHeadquartersPrinciplesPage() {
  useEffect(() => {
    document.body.classList.add('headquarters-principles-active');
    return () => document.body.classList.remove('headquarters-principles-active');
  }, []);

  return (
    <DepartmentGoldenBuildShell>
      <HeadquartersPrinciplesWorkspace />
    </DepartmentGoldenBuildShell>
  );
}
