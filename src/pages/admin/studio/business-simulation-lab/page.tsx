import { BusinessSimulationLabWorkspace } from '../../../../components/admin/studio/business-simulation-lab/BusinessSimulationLabWorkspace';
import { AdminStudioModulePageShell } from '../../../../components/admin/studio/AdminStudioModulePageShell';

export default function AdminStudioBusinessSimulationLabPage() {
  return (
    <AdminStudioModulePageShell moduleId="business-simulation-lab">
      <BusinessSimulationLabWorkspace />
    </AdminStudioModulePageShell>
  );
}
