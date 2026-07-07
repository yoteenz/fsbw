import { FounderCognitiveLoadWorkspace } from '../../../../components/admin/studio/founder-cognitive-load/FounderCognitiveLoadWorkspace';
import { AdminStudioModulePageShell } from '../../../../components/admin/studio/AdminStudioModulePageShell';

export default function AdminStudioFounderCognitiveLoadPage() {
  return (
    <AdminStudioModulePageShell moduleId="founder-cognitive-load">
      <FounderCognitiveLoadWorkspace />
    </AdminStudioModulePageShell>
  );
}
