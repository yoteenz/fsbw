import { useEffect } from 'react';
import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { InnovationDistrictRoom } from '../../../../components/admin/studio/innovation-district/InnovationDistrictRoom';

/**
 * Innovation District™ — Collaborative Innovation Network™ campus.
 * Founders co-invent, publish joint IP, and distribute royalties automatically.
 */
export default function AdminStudioInnovationDistrictPage() {
  useEffect(() => {
    document.body.classList.add('innovation-district-active');
    return () => document.body.classList.remove('innovation-district-active');
  }, []);

  return (
    <DepartmentGoldenBuildShell>
      <InnovationDistrictRoom />
    </DepartmentGoldenBuildShell>
  );
}
