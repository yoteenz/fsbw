import { LegacyVaultWorkspace } from '../../../../components/admin/studio/legacy-vault/LegacyVaultWorkspace';
import { AdminStudioModulePageShell } from '../../../../components/admin/studio/AdminStudioModulePageShell';

export default function AdminStudioLegacyVaultPage() {
  return (
    <AdminStudioModulePageShell moduleId="legacy-vault">
      <LegacyVaultWorkspace />
    </AdminStudioModulePageShell>
  );
}
