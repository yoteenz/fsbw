import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { InteractionEngineWorkspace } from '../../../../components/admin/studio/interaction-engine/InteractionEngineWorkspace';

const SUBTITLE =
  'Interaction Engine™ — the behavioral source of truth for Studio OS. Every interaction feels familiar, intentional, and consistent.';

export default function AdminStudioInteractionEnginePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="INTERACTION ENGINE™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/design-token-engine')}
      navGroupId="intelligence"
    >
      <InteractionEngineWorkspace />
      <AdminStudioDisclaimerFooter>
        INTERACTION ENGINE™ V1.0 · M130 · BEHAVIORAL SOURCE OF TRUTH · PLATFORM COHESION
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
