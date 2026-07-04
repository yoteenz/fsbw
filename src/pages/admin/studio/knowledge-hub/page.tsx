import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { KnowledgeHubWorkspace } from '../../../../components/admin/studio/knowledge-hub/KnowledgeHubWorkspace';
import { KNOWLEDGE_HUB_SUBTITLE } from '../../../../utils/adminStudioKnowledgeHubDemo';

export default function AdminStudioKnowledgeHubPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="KNOWLEDGE HUB"
      subtitle={KNOWLEDGE_HUB_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/mission-control')}
      navGroupId="intelligence"
    >
      <KnowledgeHubWorkspace />
      <AdminStudioDisclaimerFooter>
        SELF-DOCUMENTING STUDIOOS · TAP ⓘ ON ANY PAGE · OWNER&apos;S MANUAL SYNCED WITH SOFTWARE
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
