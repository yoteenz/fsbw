import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { OrganizationPulseWorkspace } from '../../../../components/admin/studio/organization-pulse/OrganizationPulseWorkspace';

const ORGANIZATION_PULSE_SUBTITLE =
  'Continuous organizational well-being — monitor the pulse in real time. How is our organization really doing? Organizationally.';

export default function AdminStudioOrganizationPulsePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="ORGANIZATION PULSE"
      subtitle={ORGANIZATION_PULSE_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/mission-control')}
      navGroupId="overview"
    >
      <OrganizationPulseWorkspace />
      <AdminStudioDisclaimerFooter>
        ORGANIZATION PULSE™ V1.0 · LIVING SYSTEM MONITORING · MILESTONE 100
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
