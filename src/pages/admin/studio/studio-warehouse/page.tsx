import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { StudioWarehouseRoom } from '../../../../components/admin/studio/warehouse/StudioWarehouseRoom';

/**
 * Studio Archives™ — immersive flagship headquarters route.
 * No AdminStudioStageShell. Founder walks the monumental campus.
 */
export default function AdminStudioWarehousePage() {
  return (
    <DepartmentGoldenBuildShell>
      <StudioWarehouseRoom />
    </DepartmentGoldenBuildShell>
  );
}
