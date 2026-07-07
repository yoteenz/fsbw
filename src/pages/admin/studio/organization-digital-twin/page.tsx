import { OrganizationDigitalTwinWorkspace } from '../../../../components/admin/studio/organization-digital-twin/OrganizationDigitalTwinWorkspace';
import { AdminStudioModulePageShell } from '../../../../components/admin/studio/AdminStudioModulePageShell';

export default function AdminStudioOrganizationDigitalTwinPage() {
  return (
    <AdminStudioModulePageShell moduleId="organization-digital-twin">
      <OrganizationDigitalTwinWorkspace />
    </AdminStudioModulePageShell>
  );
}
