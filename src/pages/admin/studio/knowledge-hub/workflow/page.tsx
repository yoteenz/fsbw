import { useNavigate, useParams } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../components/admin/studio/AdminStudioStageShell';
import { KnowledgeHubWorkflowPage } from '../../../../../components/admin/studio/knowledge-hub/KnowledgeHubWorkspace';
import { adminStudioKnowledgeHubPath } from '../../../../../utils/adminStudioRoutes';

export default function AdminStudioKnowledgeHubWorkflowRoutePage() {
  const { workflowId } = useParams<{ workflowId: string }>();
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="WORKFLOW GUIDE"
      subtitle="ILLUSTRATED PRODUCTION PATH"
      breadcrumbParentLabel="KNOWLEDGE HUB"
      breadcrumbParentPath={adminStudioKnowledgeHubPath()}
      onBack={() => navigate(adminStudioKnowledgeHubPath())}
      navGroupId="intelligence"
      hideNavTabs
    >
      {workflowId ? <KnowledgeHubWorkflowPage workflowId={workflowId} /> : null}
    </AdminStudioStageShell>
  );
}
