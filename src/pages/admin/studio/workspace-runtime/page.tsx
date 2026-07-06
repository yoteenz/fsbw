import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { WorkspaceRuntimeWorkspace } from '../../../../components/admin/studio/workspace-runtime/WorkspaceRuntimeWorkspace';

const SUBTITLE =
  'Workspace Runtime™ — isolated execution environment for every organization. Independent digital headquarters. Organizations share the platform. Never the runtime.';

export default function AdminStudioWorkspaceRuntimePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="WORKSPACE RUNTIME™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/permission-engine')}
      navGroupId="intelligence"
    >
      <WorkspaceRuntimeWorkspace />
      <AdminStudioDisclaimerFooter>
        WORKSPACE RUNTIME™ V1.0 · M136 · ISOLATED ORGANIZATION RUNTIMES · NEVER SHARED
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
