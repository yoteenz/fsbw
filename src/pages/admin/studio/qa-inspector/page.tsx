import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { QaInspectorWorkspace } from '../../../../components/admin/studio/qa-inspector/QaInspectorWorkspace';

const SUBTITLE =
  'QA Inspector™ — intelligent continuous audit without human intervention. Every issue receives severity, confidence, root cause, and recommended solution. Recommends only — the organization decides.';

export default function AdminStudioQaInspectorPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="QA INSPECTOR™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/qa-headquarters')}
      navGroupId="intelligence"
    >
      <QaInspectorWorkspace />
      <AdminStudioDisclaimerFooter>
        QA INSPECTOR™ V1.0 · M143 · CONTINUOUS AUDIT · NEVER SILENTLY MODIFIES · ORGANIZATION DECIDES
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
