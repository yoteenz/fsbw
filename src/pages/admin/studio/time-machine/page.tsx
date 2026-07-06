import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { TimeMachineWorkspace } from '../../../../components/admin/studio/time-machine/TimeMachineWorkspace';

const SUBTITLE =
  'Time Machine™ — replay any workflow, automation, AI recommendation, or organizational event exactly as it occurred. Understand WHY — not just what happened.';

export default function AdminStudioTimeMachinePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="TIME MACHINE™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/executive-trust-dashboard')}
      navGroupId="intelligence"
    >
      <TimeMachineWorkspace />
      <AdminStudioDisclaimerFooter>
        TIME MACHINE™ V1.0 · M148 · ORGANIZATIONAL REPLAY · UNDERSTAND WHY NOT WHAT · EXPERIENCE IT AGAIN
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
