import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { RenderQueueWorkspace } from '../../../../components/admin/studio/render-queue/RenderQueueWorkspace';

const RENDER_QUEUE_SUBTITLE =
  'Centralized render queue — every production moves through a visible pipeline. The founder never wonders what AI is doing. The heartbeat of the production floor.';

export default function AdminStudioRenderQueuePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="RENDER QUEUE"
      subtitle={RENDER_QUEUE_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/production-studio')}
      navGroupId="production"
    >
      <RenderQueueWorkspace />
      <AdminStudioDisclaimerFooter>
        RENDER QUEUE V1.0 · LIVE PRODUCTION FLOOR · DEMO PLACEHOLDER · PAUSE · RESUME · BATCH ENABLED
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
