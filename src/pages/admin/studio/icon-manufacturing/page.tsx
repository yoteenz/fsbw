import { useRequireStudioWorldAdmin } from '../../../../hooks/useRequireStudioWorldAdmin';
import { IconManufacturingShell } from '../../../../features/studio-world/icons/icon-manufacturing/IconManufacturingShell';

/** Studio World Icon Manufacturing Pipeline — permanent icon production home. */
export default function AdminIconManufacturingPage() {
  useRequireStudioWorldAdmin();
  return <IconManufacturingShell />;
}
