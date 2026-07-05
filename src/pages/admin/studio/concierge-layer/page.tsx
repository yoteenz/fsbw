import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ConciergeLayerWorkspace } from '../../../../components/admin/studio/concierge-layer/ConciergeLayerWorkspace';

const CONCIERGE_LAYER_SUBTITLE =
  'Founder-facing guidance layer — executives govern the organization while concierges create a warm, luxurious, personally guided headquarters experience.';

export default function AdminStudioConciergeLayerPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="CONCIERGE LAYER"
      subtitle={CONCIERGE_LAYER_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/organizational-apprenticeship')}
      navGroupId="overview"
    >
      <ConciergeLayerWorkspace />
      <AdminStudioDisclaimerFooter>
        CONCIERGE LAYER V1.0 · FOUNDER GUIDANCE · HOSPITALITY · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
