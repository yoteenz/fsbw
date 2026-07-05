import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { OrganizationalIntelligenceWorkspace } from '../../../../components/admin/studio/organizational-intelligence/OrganizationalIntelligenceWorkspace';

const ORGANIZATIONAL_INTELLIGENCE_SUBTITLE =
  'Collective mind of the company — observe, learn, connect, reflect, predict. Accumulated wisdom that compounds every day.';

export default function AdminStudioOrganizationalIntelligencePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="ORGANIZATIONAL INTELLIGENCE"
      subtitle={ORGANIZATIONAL_INTELLIGENCE_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/executive-council')}
      navGroupId="overview"
    >
      <OrganizationalIntelligenceWorkspace />
      <AdminStudioDisclaimerFooter>
        ORGANIZATIONAL INTELLIGENCE V1.0 · COLLECTIVE MIND · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
