import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ExecutiveOrganizationWorkspace } from '../../../../components/admin/studio/executive-organization/ExecutiveOrganizationWorkspace';

const EXECUTIVE_ORGANIZATION_SUBTITLE =
  'The living leadership team — executives, departments, teams, and workers operating as one organization.';

export default function AdminStudioExecutiveOrganizationPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="EXECUTIVE ORGANIZATION"
      subtitle={EXECUTIVE_ORGANIZATION_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/chief-of-staff')}
      navGroupId="overview"
    >
      <ExecutiveOrganizationWorkspace />
      <AdminStudioDisclaimerFooter>
        EXECUTIVE ORGANIZATION V1.0 · LIVING LEADERSHIP TEAM · DEPARTMENT HQ · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
