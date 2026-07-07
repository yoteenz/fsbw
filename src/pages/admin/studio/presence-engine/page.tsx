import { PresenceEngineWorkspace } from '../../../../components/admin/studio/presence-engine/PresenceEngineWorkspace';
import { AdminStudioModulePageShell } from '../../../../components/admin/studio/AdminStudioModulePageShell';

export default function AdminStudioPresenceEnginePage() {
  return (
    <AdminStudioModulePageShell moduleId="presence-engine">
      <PresenceEngineWorkspace />
    </AdminStudioModulePageShell>
  );
}
