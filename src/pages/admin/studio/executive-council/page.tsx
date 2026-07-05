import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ExecutiveCouncilWorkspace } from '../../../../components/admin/studio/executive-council/ExecutiveCouncilWorkspace';

const EXECUTIVE_COUNCIL_SUBTITLE =
  'Highest collaborative leadership body — every major decision evaluated through executive reasoning. Organizational wisdom over isolated recommendations.';

export default function AdminStudioExecutiveCouncilPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="EXECUTIVE COUNCIL"
      subtitle={EXECUTIVE_COUNCIL_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/chief-growth-officer')}
      navGroupId="overview"
    >
      <ExecutiveCouncilWorkspace />
      <AdminStudioDisclaimerFooter>
        EXECUTIVE COUNCIL V2.0 · COLLABORATIVE LEADERSHIP · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
