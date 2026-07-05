import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { OrganizationalAutonomyFrameworkWorkspace } from '../../../../components/admin/studio/organizational-autonomy-framework/OrganizationalAutonomyFrameworkWorkspace';

const ORGANIZATIONAL_AUTONOMY_SUBTITLE =
  'Constitutional system governing how organizations safely execute work — autonomy earned through trust, aligned with founder intent.';

export default function AdminStudioOrganizationalAutonomyFrameworkPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="ORGANIZATIONAL AUTONOMY FRAMEWORK"
      subtitle={ORGANIZATIONAL_AUTONOMY_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/organizational-intelligence')}
      navGroupId="overview"
    >
      <OrganizationalAutonomyFrameworkWorkspace />
      <AdminStudioDisclaimerFooter>
        ORGANIZATIONAL AUTONOMY FRAMEWORK V1.0 · TRUSTED STEWARDSHIP · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
