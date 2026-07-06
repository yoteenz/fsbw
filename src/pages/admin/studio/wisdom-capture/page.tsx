import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { WisdomCaptureWorkspace } from '../../../../components/admin/studio/wisdom-capture/WisdomCaptureWorkspace';

const WISDOM_CAPTURE_SUBTITLE =
  'Preserve small lessons, observations, and discoveries before they fade. Processes explain what — wisdom explains why.';

export default function AdminStudioWisdomCapturePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="WISDOM CAPTURE"
      subtitle={WISDOM_CAPTURE_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/memory-engine')}
      navGroupId="intelligence"
    >
      <WisdomCaptureWorkspace />
      <AdminStudioDisclaimerFooter>
        WISDOM CAPTURE™ V1.0 · ORGANIZATIONAL LEARNING · MILESTONE 101
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
