import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { SelfHealingEngineWorkspace } from '../../../../components/admin/studio/self-healing-engine/SelfHealingEngineWorkspace';

const SUBTITLE =
  'Self-Healing™ Engine — intelligently resilient operating system protection. Safely correct low-risk issues, prepare Recovery Plans™ for higher-risk situations, and maintain a permanent audit log.';

export default function AdminStudioSelfHealingEnginePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="SELF-HEALING™ ENGINE"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/predictive-qa')}
      navGroupId="intelligence"
    >
      <SelfHealingEngineWorkspace />
      <AdminStudioDisclaimerFooter>
        SELF-HEALING™ ENGINE V1.0 · M150 · INTELLIGENT RESILIENCE · NOT AUTONOMOUS CONTROL
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
