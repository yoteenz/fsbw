import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ChiefTechnologyOfficerWorkspace } from '../../../../components/admin/studio/chief-technology-officer/ChiefTechnologyOfficerWorkspace';

const CHIEF_TECHNOLOGY_OFFICER_SUBTITLE =
  'Lifelong guardian of engineering and infrastructure — resilient, secure, maintainable technology built to serve the organization for decades.';

export default function AdminStudioChiefTechnologyOfficerPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="CHIEF TECHNOLOGY OFFICER"
      subtitle={CHIEF_TECHNOLOGY_OFFICER_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/chief-digital-officer')}
      navGroupId="overview"
    >
      <ChiefTechnologyOfficerWorkspace />
      <AdminStudioDisclaimerFooter>
        CHIEF TECHNOLOGY OFFICER V1.0 · ENGINEERING GUARDIAN · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
