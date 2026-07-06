import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { DesignTokenEngineWorkspace } from '../../../../components/admin/studio/design-token-engine/DesignTokenEngineWorkspace';

const SUBTITLE =
  'Design Token Engine™ — the visual source of truth for Studio OS. Design consistency is automatic.';

export default function AdminStudioDesignTokenEnginePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="DESIGN TOKEN ENGINE™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/component-registry')}
      navGroupId="intelligence"
    >
      <DesignTokenEngineWorkspace />
      <AdminStudioDisclaimerFooter>
        DESIGN TOKEN ENGINE™ V1.0 · M129 · VISUAL SOURCE OF TRUTH · DESIGN BIBLE PROTECTED
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
