import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ArchitectStudioWorkspace } from '../../../../components/admin/studio/architect-studio/ArchitectStudioWorkspace';

const ARCHITECT_STUDIO_SUBTITLE =
  'Living headquarters — arrive at work inside your company. Organization already in motion before you interact with anything.';

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
        LIVING HEADQUARTERS V1.5 · ARCHITECT STUDIO · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
