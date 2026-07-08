import { useEffect } from 'react';
import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { InnovationConstellationsObservatory } from '../../../../components/admin/studio/innovation-constellations/InnovationConstellationsObservatory';

/**
 * Innovation Constellations™ — living knowledge universe observatory.
 * Visual exploration of humanity's collective business intelligence inside Studio World.
 */
export default function AdminStudioInnovationConstellationsPage() {
  useEffect(() => {
    document.body.classList.add('innovation-constellations-active');
    return () => document.body.classList.remove('innovation-constellations-active');
  }, []);

  return (
    <DepartmentGoldenBuildShell>
      <InnovationConstellationsObservatory />
    </DepartmentGoldenBuildShell>
  );
}
