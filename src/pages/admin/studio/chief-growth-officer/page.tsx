import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ChiefGrowthOfficerWorkspace } from '../../../../components/admin/studio/chief-growth-officer/ChiefGrowthOfficerWorkspace';

const CHIEF_GROWTH_OFFICER_SUBTITLE =
  'Lifelong guardian of sustainable growth — stronger not simply bigger. Intentional, ethical, relationship-driven growth aligned with the founder\'s promise.';

export default function AdminStudioChiefGrowthOfficerPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="CHIEF GROWTH OFFICER"
      subtitle={CHIEF_GROWTH_OFFICER_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/chief-technology-officer')}
      navGroupId="overview"
    >
      <ChiefGrowthOfficerWorkspace />
      <AdminStudioDisclaimerFooter>
        CHIEF GROWTH OFFICER V1.0 · SUSTAINABLE GROWTH GUARDIAN · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
