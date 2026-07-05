import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { LeadershipModesWorkspace } from '../../../../components/admin/studio/leadership-modes/LeadershipModesWorkspace';

const LEADERSHIP_MODES_SUBTITLE =
  'Founder & executive mode — Studio OS adapts to how you want to lead today, not the other way around.';

export default function AdminStudioLeadershipModesPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="LEADERSHIP MODES"
      subtitle={LEADERSHIP_MODES_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/organizational-maturity-model')}
      navGroupId="overview"
    >
      <LeadershipModesWorkspace />
      <AdminStudioDisclaimerFooter>
        LEADERSHIP MODES V1.0 · FOUNDER & EXECUTIVE MODE · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
