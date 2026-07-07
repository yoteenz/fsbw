import { OrganizationalConsciousnessWorkspace } from '../../../../components/admin/studio/organizational-consciousness/OrganizationalConsciousnessWorkspace';
import { AdminStudioModulePageShell } from '../../../../components/admin/studio/AdminStudioModulePageShell';

export default function AdminStudioOrganizationalConsciousnessPage() {
  return (
    <AdminStudioModulePageShell moduleId="organizational-consciousness">
      <OrganizationalConsciousnessWorkspace />
    </AdminStudioModulePageShell>
  );
}
