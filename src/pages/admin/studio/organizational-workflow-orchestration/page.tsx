import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { OrganizationalWorkflowOrchestrationWorkspace } from '../../../../components/admin/studio/organizational-workflow-orchestration/OrganizationalWorkflowOrchestrationWorkspace';

const ORGANIZATIONAL_WORKFLOW_ORCHESTRATION_SUBTITLE =
  'Cross-functional workflow choreography — coordinated teams, not disconnected automations. The living organization at work.';

export default function AdminStudioOrganizationalWorkflowOrchestrationPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="ORGANIZATIONAL WORKFLOW ORCHESTRATION"
      subtitle={ORGANIZATIONAL_WORKFLOW_ORCHESTRATION_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/organizational-delegation-engine')}
      navGroupId="overview"
    >
      <OrganizationalWorkflowOrchestrationWorkspace />
      <AdminStudioDisclaimerFooter>
        ORGANIZATIONAL WORKFLOW ORCHESTRATION V1.0 · CROSS-FUNCTIONAL CHOREOGRAPHY · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
