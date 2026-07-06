import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ComponentRegistryWorkspace } from '../../../../components/admin/studio/component-registry/ComponentRegistryWorkspace';

const SUBTITLE =
  'Component Registry™ — every reusable UI component registered as a managed platform asset. Assemble interfaces, never recreate.';

export default function AdminStudioComponentRegistryPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="COMPONENT REGISTRY™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/system-registry')}
      navGroupId="intelligence"
    >
      <ComponentRegistryWorkspace />
      <AdminStudioDisclaimerFooter>
        COMPONENT REGISTRY™ V1.0 · M128 · REUSE FIRST · MANAGED PLATFORM ASSETS
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
