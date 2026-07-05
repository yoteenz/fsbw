import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ChiefDigitalOfficerWorkspace } from '../../../../components/admin/studio/chief-digital-officer/ChiefDigitalOfficerWorkspace';

const CHIEF_DIGITAL_OFFICER_SUBTITLE =
  'Lifelong guardian of the digital ecosystem — technology invisible, experience remembered. Clarity, craftsmanship, and resilience over complexity.';

export default function AdminStudioChiefDigitalOfficerPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="CHIEF DIGITAL OFFICER"
      subtitle={CHIEF_DIGITAL_OFFICER_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/chief-experience-officer')}
      navGroupId="overview"
    >
      <ChiefDigitalOfficerWorkspace />
      <AdminStudioDisclaimerFooter>
        CHIEF DIGITAL OFFICER V1.0 · DIGITAL ECOSYSTEM GUARDIAN · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
