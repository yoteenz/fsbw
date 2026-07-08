import { useEffect } from 'react';
import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { InnovationLineageGalleryRoom } from '../../../../components/admin/studio/innovation-lineage-gallery/InnovationLineageGalleryRoom';

/**
 * Innovation Lineage Gallery™ — Museum Wing immersive exhibit hall.
 * Permanent living innovation graph — how every invention evolved.
 */
export default function AdminStudioInnovationLineageGalleryPage() {
  useEffect(() => {
    document.body.classList.add('innovation-lineage-gallery-active');
    return () => document.body.classList.remove('innovation-lineage-gallery-active');
  }, []);

  return (
    <DepartmentGoldenBuildShell>
      <InnovationLineageGalleryRoom />
    </DepartmentGoldenBuildShell>
  );
}
