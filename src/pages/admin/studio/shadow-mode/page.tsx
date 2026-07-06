import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ShadowModeWorkspace } from '../../../../components/admin/studio/shadow-mode/ShadowModeWorkspace';

const SHADOW_MODE_SUBTITLE =
  'Digital Concierges observe before they act — trust earned through observation, not automation. Learn before you lead.';

export default function AdminStudioShadowModePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="SHADOW MODE"
      subtitle={SHADOW_MODE_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/concierge-layer')}
      navGroupId="intelligence"
    >
      <ShadowModeWorkspace />
      <AdminStudioDisclaimerFooter>
        SHADOW MODE™ V1.0 · OBSERVATION BEFORE AUTOMATION · MILESTONE 102
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
