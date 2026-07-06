import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { EngineeringExcellenceDashboardWorkspace } from '../../../../components/admin/studio/engineering-excellence-dashboard/EngineeringExcellenceDashboardWorkspace';

const SUBTITLE =
  'Engineering Excellence Dashboard™ — real-time executive overview of Studio OS health, quality, and readiness. The command center for discipline, consistency, craftsmanship, and long-term engineering health.';

export default function AdminStudioEngineeringExcellenceDashboardPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="ENGINEERING EXCELLENCE DASHBOARD™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/release-readiness')}
      navGroupId="intelligence"
    >
      <EngineeringExcellenceDashboardWorkspace />
      <AdminStudioDisclaimerFooter>
        ENGINEERING EXCELLENCE DASHBOARD™ V1.0 · M162 · EXCELLENCE IS A MINDSET · WORLD-CLASS HABITS FOR TEAMS OF ONE
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
