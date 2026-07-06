import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { PluginSdkWorkspace } from '../../../../components/admin/studio/plugin-sdk/PluginSdkWorkspace';

const SUBTITLE =
  'Plugin SDK™ — extensible platform for organizations, developers, and partners. Every plugin becomes a first-class Studio OS citizen. Future innovation from the ecosystem.';

export default function AdminStudioPluginSdkPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="PLUGIN SDK™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/workspace-runtime')}
      navGroupId="intelligence"
    >
      <PluginSdkWorkspace />
      <AdminStudioDisclaimerFooter>
        PLUGIN SDK™ V1.0 · M137 · EXTENSIBLE PLATFORM · SANDBOXED PLUGINS · MARKETPLACE READY
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
