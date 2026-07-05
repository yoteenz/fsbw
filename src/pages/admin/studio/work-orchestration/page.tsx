import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { WorkOrchestrationWorkspace } from '../../../../components/admin/studio/work-orchestration/WorkOrchestrationWorkspace';

const WORK_ORCHESTRATION_SUBTITLE =
  'Founders lead outcomes — the organization orchestrates work. Tasks are implementation details, not the primary model.';

export default function AdminStudioWorkOrchestrationPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="WORK ORCHESTRATION"
      subtitle={WORK_ORCHESTRATION_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/campaign-engine')}
      navGroupId="production"
    >
      <WorkOrchestrationWorkspace />
      <AdminStudioDisclaimerFooter>
        WORK ORCHESTRATION V1.0 · INTELLIGENT EXECUTION · CoS ORCHESTRATION · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
