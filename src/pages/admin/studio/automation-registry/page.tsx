import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AutomationRegistryWorkspace } from '../../../../components/admin/studio/automation-registry/AutomationRegistryWorkspace';

const SUBTITLE =
  'Automation Registry™ — every automation registered as an organizational asset. Visible, searchable, auditable, manageable.';

export default function AdminStudioAutomationRegistryPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="AUTOMATION REGISTRY™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/event-bus')}
      navGroupId="intelligence"
    >
      <AutomationRegistryWorkspace />
      <AdminStudioDisclaimerFooter>
        AUTOMATION REGISTRY™ V1.0 · M132 · TRANSPARENT AUTOMATION · NOTHING EXECUTES WITHOUT REGISTRATION
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
