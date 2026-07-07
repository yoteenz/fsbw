import { AutonomousPreparationWorkspace } from '../../../../components/admin/studio/autonomous-preparation/AutonomousPreparationWorkspace';
import { AdminStudioModulePageShell } from '../../../../components/admin/studio/AdminStudioModulePageShell';

export default function AdminStudioAutonomousPreparationPage() {
  return (
    <AdminStudioModulePageShell moduleId="autonomous-preparation">
      <AutonomousPreparationWorkspace />
    </AdminStudioModulePageShell>
  );
}
