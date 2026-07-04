import { useNavigate, useParams } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../components/admin/studio/AdminStudioStageShell';
import { KnowledgeHubProfilePage } from '../../../../../components/admin/studio/knowledge-hub/KnowledgeHubWorkspace';
import { adminStudioKnowledgeHubPath } from '../../../../../utils/adminStudioRoutes';

export default function AdminStudioKnowledgeHubProfilePage() {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="OBJECT PROFILE"
      subtitle="KNOWLEDGE HUB · EVERY OBJECT EXPLAINS ITSELF"
      breadcrumbParentLabel="KNOWLEDGE HUB"
      breadcrumbParentPath={adminStudioKnowledgeHubPath()}
      onBack={() => navigate(adminStudioKnowledgeHubPath())}
      navGroupId="intelligence"
      hideNavTabs
    >
      {profileId ? <KnowledgeHubProfilePage profileId={profileId} /> : null}
    </AdminStudioStageShell>
  );
}
