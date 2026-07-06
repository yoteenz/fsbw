import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { InnovationLabWorkspace } from '../../../../components/admin/studio/innovation-lab/InnovationLabWorkspace';

const SUBTITLE =
  'Innovation Lab™ — permanent research, invention, and strategic ideation. Continuously create ideas from everything Studio OS knows.';

export default function AdminStudioInnovationLabPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="INNOVATION LAB™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/mission-control')}
      navGroupId="intelligence"
    >
      <InnovationLabWorkspace />
      <AdminStudioDisclaimerFooter>
        INNOVATION LAB™ V1.0 · M119 · PERMANENT ORGANIZATIONAL INNOVATION CAPABILITY
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
