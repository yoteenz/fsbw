import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { EventBusWorkspace } from '../../../../components/admin/studio/event-bus/EventBusWorkspace';

const SUBTITLE =
  'Event Bus™ — the communication backbone of Studio OS. Systems publish events; other systems decide whether to respond.';

export default function AdminStudioEventBusPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="EVENT BUS™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/interaction-engine')}
      navGroupId="intelligence"
    >
      <EventBusWorkspace />
      <AdminStudioDisclaimerFooter>
        EVENT BUS™ V1.0 · M131 · NERVOUS SYSTEM · PUBLISH SUBSCRIBE · LOOSELY COUPLED
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
