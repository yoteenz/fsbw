import { DepartmentGoldenBuildShell } from '../../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { StudioWarehouseRoom } from '../../../../components/admin/studio/warehouse/StudioWarehouseRoom';

/**
 * Studio Warehouse™ — immersive destination route.
 * No AdminStudioStageShell. Founder physically arrives at the warehouse campus.
 */
export default function AdminStudioWarehousePage() {
  return (
    <DepartmentGoldenBuildShell>
      <StudioWarehouseRoom />
    </DepartmentGoldenBuildShell>
  );
}
