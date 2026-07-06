import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { WorldKnowledgeEngineWorkspace } from '../../../../components/admin/studio/world-knowledge-engine/WorldKnowledgeEngineWorkspace';

const SUBTITLE =
  'World Knowledge Engine™ — continuously monitors the outside world and filters only the information that matters to your organization.';

export default function AdminStudioWorldKnowledgeEnginePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="WORLD KNOWLEDGE ENGINE™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/mission-control')}
      navGroupId="intelligence"
    >
      <WorldKnowledgeEngineWorkspace />
      <AdminStudioDisclaimerFooter>
        WORLD KNOWLEDGE ENGINE™ V1.0 · M117 · INFORMATION FINDS YOU · TRUSTED WINDOW INTO THE OUTSIDE WORLD
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
