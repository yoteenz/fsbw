import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { FounderWalkWorkspace } from '../../../../components/admin/studio/founder-walk/FounderWalkWorkspace';

const FOUNDER_WALK_SUBTITLE =
  'The emotional spine of the campus — preserve your journey as a living marble pathway, not a digital trophy case.';

export default function AdminStudioFounderWalkPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="FOUNDER WALK"
      subtitle={FOUNDER_WALK_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/campus-evolution-engine')}
      navGroupId="overview"
    >
      <FounderWalkWorkspace />
      <AdminStudioDisclaimerFooter>
        FOUNDER WALK V1.0 · EMOTIONAL SPINE · LEGACY SYSTEM · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
