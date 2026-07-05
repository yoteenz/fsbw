import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { OrganizationalDelegationEngineWorkspace } from '../../../../components/admin/studio/organizational-delegation-engine/OrganizationalDelegationEngineWorkspace';

const ORGANIZATIONAL_DELEGATION_SUBTITLE =
  'Founders delegate outcomes — the organization determines how they are achieved. Management transformed into leadership.';

export default function AdminStudioOrganizationalDelegationEnginePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="ORGANIZATIONAL DELEGATION ENGINE"
      subtitle={ORGANIZATIONAL_DELEGATION_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/organizational-autonomy-framework')}
      navGroupId="overview"
    >
      <OrganizationalDelegationEngineWorkspace />
      <AdminStudioDisclaimerFooter>
        ORGANIZATIONAL DELEGATION ENGINE V1.0 · OUTCOME DELEGATION · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
