import { CrossOrganizationIntelligenceWorkspace } from '../../../../components/admin/studio/cross-organization-intelligence/CrossOrganizationIntelligenceWorkspace';
import { AdminStudioModulePageShell } from '../../../../components/admin/studio/AdminStudioModulePageShell';

export default function AdminStudioCrossOrgIntelligencePage() {
  return (
    <AdminStudioModulePageShell moduleId="cross-organization-intelligence">
      <CrossOrganizationIntelligenceWorkspace />
    </AdminStudioModulePageShell>
  );
}
