import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { PolicyEngineWorkspace } from '../../../../components/admin/studio/policy-engine/PolicyEngineWorkspace';

const SUBTITLE =
  'Policy Engine™ — centralized rulebook governing how Studio OS behaves. Define policies once; every system follows automatically.';

export default function AdminStudioPolicyEnginePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="POLICY ENGINE™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/prompt-registry')}
      navGroupId="intelligence"
    >
      <PolicyEngineWorkspace />
      <AdminStudioDisclaimerFooter>
        POLICY ENGINE™ V1.0 · M134 · ORGANIZATIONAL LAW · DEFINE ONCE · ENFORCE EVERYWHERE
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
