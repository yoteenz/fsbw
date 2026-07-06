import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { DocumentationRegistryWorkspace } from '../../../../components/admin/studio/documentation-registry/DocumentationRegistryWorkspace';

const SUBTITLE =
  'Documentation Registry™ — single source of truth for all Studio OS documentation. Register once. Sync everywhere.';

export default function AdminStudioDocumentationRegistryPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="DOCUMENTATION REGISTRY™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/knowledge-hub')}
      navGroupId="intelligence"
    >
      <DocumentationRegistryWorkspace />
      <AdminStudioDisclaimerFooter>
        DOCUMENTATION REGISTRY™ V1.0 · M126 · ONE SOURCE · MANY CONSUMERS · ALWAYS SYNCHRONIZED
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
