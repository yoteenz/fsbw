import { AnticipationEngineWorkspace } from '../../../../components/admin/studio/anticipation-engine/AnticipationEngineWorkspace';
import { AdminStudioModulePageShell } from '../../../../components/admin/studio/AdminStudioModulePageShell';

export default function AdminStudioAnticipationEnginePage() {
  return (
    <AdminStudioModulePageShell moduleId="anticipation-engine">
      <AnticipationEngineWorkspace />
    </AdminStudioModulePageShell>
  );
}
