import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { SystemRegistryWorkspace } from '../../../../components/admin/studio/system-registry/SystemRegistryWorkspace';

const SUBTITLE =
  'System Registry™ — the master directory of every object, service, module, feature, and system inside Studio OS.';

export default function AdminStudioSystemRegistryPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="SYSTEM REGISTRY™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/documentation-governance')}
      navGroupId="intelligence"
    >
      <SystemRegistryWorkspace />
      <AdminStudioDisclaimerFooter>
        SYSTEM REGISTRY™ V1.0 · M127 · MASTER DIRECTORY · NOTHING EXISTS ANONYMOUSLY
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
