import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ConfidenceEngineWorkspace } from '../../../../components/admin/studio/confidence-engine/ConfidenceEngineWorkspace';

const SUBTITLE =
  'Confidence Engine™ — measure, communicate, and explain how confident Studio Intelligence™ is before every recommendation. Confidence is a conversation, not a percentage.';

export default function AdminStudioConfidenceEnginePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="CONFIDENCE ENGINE™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/decision-audit')}
      navGroupId="intelligence"
    >
      <ConfidenceEngineWorkspace />
      <AdminStudioDisclaimerFooter>
        CONFIDENCE ENGINE™ V1.0 · M152 · VISIBLE INTELLIGENCE · CONFIDENCE IS A CONVERSATION
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
