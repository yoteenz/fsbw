import { AmbientAwarenessWorkspace } from '../../../../components/admin/studio/ambient-awareness/AmbientAwarenessWorkspace';
import { AdminStudioModulePageShell } from '../../../../components/admin/studio/AdminStudioModulePageShell';

export default function AdminStudioAmbientAwarenessPage() {
  return (
    <AdminStudioModulePageShell moduleId="ambient-awareness">
      <AmbientAwarenessWorkspace />
    </AdminStudioModulePageShell>
  );
}
