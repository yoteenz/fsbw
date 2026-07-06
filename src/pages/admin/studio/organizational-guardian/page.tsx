import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { OrganizationalGuardianWorkspace } from '../../../../components/admin/studio/organizational-guardian/OrganizationalGuardianWorkspace';

const SUBTITLE =
  'Organizational Guardian™ — the highest oversight layer. Continuously watches the entire organization not to control it, but to protect it. The silent protector of operational excellence.';

export default function AdminStudioOrganizationalGuardianPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="ORGANIZATIONAL GUARDIAN™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/confidence-engine')}
      navGroupId="intelligence"
    >
      <OrganizationalGuardianWorkspace />
      <AdminStudioDisclaimerFooter>
        ORGANIZATIONAL GUARDIAN™ V1.0 · M153 · SILENT PROTECTOR · PROTECT BEFORE REACTING
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
