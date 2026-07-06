import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { PermissionEngineWorkspace } from '../../../../components/admin/studio/permission-engine/PermissionEngineWorkspace';

const SUBTITLE =
  'Permission Engine™ — enterprise authorization with capability-based access. Secure without complicated. Power intentional. Trust earned.';

export default function AdminStudioPermissionEnginePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="PERMISSION ENGINE™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/policy-engine')}
      navGroupId="intelligence"
    >
      <PermissionEngineWorkspace />
      <AdminStudioDisclaimerFooter>
        PERMISSION ENGINE™ V1.0 · M135 · CAPABILITY-BASED ACCESS · POWER INTENTIONAL · TRUST EARNED
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
