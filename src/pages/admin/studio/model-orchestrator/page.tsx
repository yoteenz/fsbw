import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ModelOrchestratorWorkspace } from '../../../../components/admin/studio/model-orchestrator/ModelOrchestratorWorkspace';

const SUBTITLE =
  'Model Orchestrator™ & AI Swap Engine™ — all AI requests flow through the orchestrator. Providers interchangeable; Studio Intelligence™ permanent.';

export default function AdminStudioModelOrchestratorPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="MODEL ORCHESTRATOR™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/mission-control')}
      navGroupId="intelligence"
    >
      <ModelOrchestratorWorkspace />
      <AdminStudioDisclaimerFooter>
        MODEL ORCHESTRATOR™ & AI SWAP ENGINE™ V1.0 · M123 · MODELS CAN CHANGE · STUDIO INTELLIGENCE™ REMAINS
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
