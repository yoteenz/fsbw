import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { OrganizationalInheritanceWorkspace } from '../../../../components/admin/studio/organizational-inheritance/OrganizationalInheritanceWorkspace';

const ORGANIZATIONAL_INHERITANCE_SUBTITLE =
  'Inherit proven organizational genetics — companies launch with accumulated wisdom and evolve independently.';

export default function AdminStudioOrganizationalInheritancePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="ORGANIZATIONAL INHERITANCE"
      subtitle={ORGANIZATIONAL_INHERITANCE_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/executive-organization')}
      navGroupId="overview"
    >
      <OrganizationalInheritanceWorkspace />
      <AdminStudioDisclaimerFooter>
        ORGANIZATIONAL INHERITANCE V1.0 · GENETIC BLENDING · INSTITUTIONAL LIBRARY · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
