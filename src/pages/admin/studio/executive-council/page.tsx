import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ExecutiveCouncilWorkspace } from '../../../../components/admin/studio/executive-council/ExecutiveCouncilWorkspace';

const EXECUTIVE_COUNCIL_SUBTITLE =
  'Collaborative executive leadership — multiple Digital Executives evaluate major decisions. Chief Concierge delivers unified briefings. Many minds. One briefing.';

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
        EXECUTIVE COUNCIL V2.0 · COLLABORATIVE LEADERSHIP · MILESTONE 99
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
