import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { OrganizationalApprenticeshipWorkspace } from '../../../../components/admin/studio/organizational-apprenticeship/OrganizationalApprenticeshipWorkspace';

const ORGANIZATIONAL_APPRENTICESHIP_SUBTITLE =
  'Permanent learning and trust-building — every new intelligence apprentices before earning authority. Trust is earned through stewardship, never configured.';

export default function AdminStudioOrganizationalApprenticeshipPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="ORGANIZATIONAL APPRENTICESHIP"
      subtitle={ORGANIZATIONAL_APPRENTICESHIP_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/studio-institute')}
      navGroupId="overview"
    >
      <OrganizationalApprenticeshipWorkspace />
      <AdminStudioDisclaimerFooter>
        ORGANIZATIONAL APPRENTICESHIP V1.0 · STEWARDSHIP · EARNED TRUST · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
