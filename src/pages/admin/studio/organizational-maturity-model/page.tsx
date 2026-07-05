import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { OrganizationalMaturityModelWorkspace } from '../../../../components/admin/studio/organizational-maturity-model/OrganizationalMaturityModelWorkspace';

const ORGANIZATIONAL_MATURITY_MODEL_SUBTITLE =
  'Master progression system — the right systems at the right time. Maturity earned, not unlocked.';

export default function AdminStudioOrganizationalMaturityModelPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="ORGANIZATIONAL MATURITY MODEL"
      subtitle={ORGANIZATIONAL_MATURITY_MODEL_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/organizational-governance-safeguards')}
      navGroupId="overview"
    >
      <OrganizationalMaturityModelWorkspace />
      <AdminStudioDisclaimerFooter>
        ORGANIZATIONAL MATURITY MODEL V1.0 · MASTER PROGRESSION SYSTEM · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
