import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ArrivalExperienceWorkspace } from '../../../../components/admin/studio/arrival-experience/ArrivalExperienceWorkspace';

const ARRIVAL_EXPERIENCE_SUBTITLE =
  'Ceremonial headquarters welcome — arrive at your living organization, not a setup confirmation screen.';

export default function AdminStudioArrivalExperiencePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="ARRIVAL EXPERIENCE"
      subtitle={ARRIVAL_EXPERIENCE_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/company-onboarding-intelligence')}
      navGroupId="overview"
    >
      <ArrivalExperienceWorkspace />
      <AdminStudioDisclaimerFooter>
        ARRIVAL EXPERIENCE V1.0 · CEREMONIAL HEADQUARTERS WELCOME · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
