import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { RemembranceGardenWorkspace } from '../../../../components/admin/studio/remembrance-garden/RemembranceGardenWorkspace';

const REMEMBRANCE_GARDEN_SUBTITLE =
  'The most personal space on campus — honor the people, moments, and sacrifices that shaped your organization. Gratitude preserved, not mourning.';

export default function AdminStudioRemembranceGardenPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="REMEMBRANCE GARDEN"
      subtitle={REMEMBRANCE_GARDEN_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/founder-walk')}
      navGroupId="overview"
    >
      <RemembranceGardenWorkspace />
      <AdminStudioDisclaimerFooter>
        REMEMBRANCE GARDEN V1.0 · PRESERVE GRATITUDE · HONOR · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
