import { PredictiveOrganizationWorkspace } from '../../../../components/admin/studio/predictive-organization/PredictiveOrganizationWorkspace';
import { AdminStudioModulePageShell } from '../../../../components/admin/studio/AdminStudioModulePageShell';

export default function AdminStudioPredictiveOrganizationPage() {
  return (
    <AdminStudioModulePageShell moduleId="predictive-organization">
      <PredictiveOrganizationWorkspace />
    </AdminStudioModulePageShell>
  );
}
