import { useEffect } from 'react';
import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { ConstitutionHallRoom } from '../../../../components/admin/studio/constitution-hall/ConstitutionHallRoom';

/**
 * Constitution Hall™ — Studio Command Center™ governance chamber.
 * Permanent constitutional framework — not settings, not documentation.
 */
export default function AdminStudioConstitutionHallPage() {
  useEffect(() => {
    document.body.classList.add('constitution-hall-active');
    return () => document.body.classList.remove('constitution-hall-active');
  }, []);

  return (
    <DepartmentGoldenBuildShell>
      <ConstitutionHallRoom />
    </DepartmentGoldenBuildShell>
  );
}
