import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { OrganizationalSelfImprovementWorkspace } from '../../../../components/admin/studio/organizational-self-improvement/OrganizationalSelfImprovementWorkspace';

const ORGANIZATIONAL_SELF_IMPROVEMENT_SUBTITLE =
  'Continuous organizational evolution — the organization reflects, learns, and strengthens itself every day.';

export default function AdminStudioOrganizationalSelfImprovementPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="ORGANIZATIONAL SELF-IMPROVEMENT"
      subtitle={ORGANIZATIONAL_SELF_IMPROVEMENT_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/organizational-workflow-orchestration')}
      navGroupId="overview"
    >
      <OrganizationalSelfImprovementWorkspace />
      <AdminStudioDisclaimerFooter>
        ORGANIZATIONAL SELF-IMPROVEMENT V1.0 · CONTINUOUS EVOLUTION · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
