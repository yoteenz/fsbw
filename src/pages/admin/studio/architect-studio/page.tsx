import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ArchitectStudioWorkspace } from '../../../../components/admin/studio/architect-studio/ArchitectStudioWorkspace';

const ARCHITECT_STUDIO_SUBTITLE =
  'Enter the innovation headquarters — five connected architect studios, one immersive campus, not disconnected dashboards.';

export default function AdminStudioArchitectStudioPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="ARCHITECT STUDIO"
      subtitle={ARCHITECT_STUDIO_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/company-genome')}
      navGroupId="overview"
    >
      <ArchitectStudioWorkspace />
      <AdminStudioDisclaimerFooter>
        ARCHITECT STUDIO V1.0 · IMMERSIVE INNOVATION HQ · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
