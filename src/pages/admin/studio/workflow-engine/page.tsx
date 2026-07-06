import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { WorkflowEngineWorkspace } from '../../../../components/admin/studio/workflow-engine/WorkflowEngineWorkspace';

const SUBTITLE =
  'Workflow Engine™ — visual orchestration for every business process. Design visually, test before publish, evolve continuously. Organizational choreography of Studio OS.';

export default function AdminStudioWorkflowEnginePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="WORKFLOW ENGINE™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/plugin-sdk')}
      navGroupId="intelligence"
    >
      <WorkflowEngineWorkspace />
      <AdminStudioDisclaimerFooter>
        WORKFLOW ENGINE™ V1.0 · M138 · VISUAL ORCHESTRATION · TEST BEFORE PUBLISH · LIVING SYSTEMS
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
