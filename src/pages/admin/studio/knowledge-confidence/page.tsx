import { KnowledgeConfidenceWorkspace } from '../../../../components/admin/studio/knowledge-confidence/KnowledgeConfidenceWorkspace';
import { AdminStudioModulePageShell } from '../../../../components/admin/studio/AdminStudioModulePageShell';

export default function AdminStudioKnowledgeConfidencePage() {
  return (
    <AdminStudioModulePageShell moduleId="knowledge-confidence">
      <KnowledgeConfidenceWorkspace />
    </AdminStudioModulePageShell>
  );
}
