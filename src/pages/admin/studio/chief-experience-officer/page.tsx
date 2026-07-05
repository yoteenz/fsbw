import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ChiefExperienceOfficerWorkspace } from '../../../../components/admin/studio/chief-experience-officer/ChiefExperienceOfficerWorkspace';

const CHIEF_EXPERIENCE_OFFICER_SUBTITLE =
  'Lifelong guardian of customer experience — strengthen trust, delight, and belonging across every touchpoint. Humanity, not interfaces.';

export default function AdminStudioChiefExperienceOfficerPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="CHIEF EXPERIENCE OFFICER"
      subtitle={CHIEF_EXPERIENCE_OFFICER_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/chief-brand-officer')}
      navGroupId="overview"
    >
      <ChiefExperienceOfficerWorkspace />
      <AdminStudioDisclaimerFooter>
        CHIEF EXPERIENCE OFFICER V2.0 · CUSTOMER EXPERIENCE GUARDIAN · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
