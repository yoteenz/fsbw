import { RelationshipMemoryWorkspace } from '../../../../components/admin/studio/relationship-memory/RelationshipMemoryWorkspace';
import { AdminStudioModulePageShell } from '../../../../components/admin/studio/AdminStudioModulePageShell';

export default function AdminStudioRelationshipMemoryPage() {
  return (
    <AdminStudioModulePageShell moduleId="relationship-memory">
      <RelationshipMemoryWorkspace />
    </AdminStudioModulePageShell>
  );
}
