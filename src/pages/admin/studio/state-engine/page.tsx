import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { StateEngineWorkspace } from '../../../../components/admin/studio/state-engine/StateEngineWorkspace';

const SUBTITLE =
  'State Engine™ — centralized lifecycle management for every object. Clearly defined states, intentional transitions, complete history. Consistency creates confidence. Confidence creates trust.';

export default function AdminStudioStateEnginePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="STATE ENGINE™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/workflow-engine')}
      navGroupId="intelligence"
    >
      <StateEngineWorkspace />
      <AdminStudioDisclaimerFooter>
        STATE ENGINE™ V1.0 · M139 · LIFECYCLE MANAGEMENT · COMPLETE HISTORY · POLICY ENFORCED
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
