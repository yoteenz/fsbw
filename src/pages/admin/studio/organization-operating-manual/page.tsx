import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { OrganizationOperatingManualWorkspace } from '../../../../components/admin/studio/organization-operating-manual/OrganizationOperatingManualWorkspace';

const SUBTITLE =
  'Organization Operating Manual™ — the living handbook automatically generated, organized, and continuously updated for every organization.';

export default function AdminStudioOrganizationOperatingManualPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="ORGANIZATION OPERATING MANUAL™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/mission-control')}
      navGroupId="intelligence"
    >
      <OrganizationOperatingManualWorkspace />
      <AdminStudioDisclaimerFooter>
        ORGANIZATION OPERATING MANUAL™ V1.0 · M120 · ONE ORGANIZATION · ONE HANDBOOK · ALWAYS CURRENT
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
