import { useEffect } from 'react';
import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { InnovationExpeditionsHall } from '../../../../components/admin/studio/innovation-expeditions/InnovationExpeditionsHall';

/**
 * Innovation Expeditions™ — guided knowledge network hall.
 * Founders journey through real businesses, innovations, and decisions inside Studio World.
 */
export default function AdminStudioInnovationExpeditionsPage() {
  useEffect(() => {
    document.body.classList.add('innovation-expeditions-active');
    return () => document.body.classList.remove('innovation-expeditions-active');
  }, []);

  return (
    <DepartmentGoldenBuildShell>
      <InnovationExpeditionsHall />
    </DepartmentGoldenBuildShell>
  );
}
