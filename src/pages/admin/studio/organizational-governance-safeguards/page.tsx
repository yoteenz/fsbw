import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { OrganizationalGovernanceSafeguardsWorkspace } from '../../../../components/admin/studio/organizational-governance-safeguards/OrganizationalGovernanceSafeguardsWorkspace';

const ORGANIZATIONAL_GOVERNANCE_SAFEGUARDS_SUBTITLE =
  'Constitutional stewardship — invisible safeguards that preserve trust while enabling confident progress.';

export default function AdminStudioOrganizationalGovernanceSafeguardsPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="ORGANIZATIONAL GOVERNANCE & SAFEGUARDS"
      subtitle={ORGANIZATIONAL_GOVERNANCE_SAFEGUARDS_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/organizational-self-improvement')}
      navGroupId="overview"
    >
      <OrganizationalGovernanceSafeguardsWorkspace />
      <AdminStudioDisclaimerFooter>
        ORGANIZATIONAL GOVERNANCE & SAFEGUARDS V1.0 · CONSTITUTIONAL STEWARDSHIP · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
