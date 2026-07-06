import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { LegacyNetworkWorkspace } from '../../../../components/admin/studio/legacy-network/LegacyNetworkWorkspace';

const SUBTITLE =
  'Legacy Network™ — permission-based global ecosystem where organizations voluntarily share expertise while retaining complete IP ownership.';

export default function AdminStudioLegacyNetworkPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="LEGACY NETWORK™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/mission-control')}
      navGroupId="intelligence"
    >
      <LegacyNetworkWorkspace />
      <AdminStudioDisclaimerFooter>
        LEGACY NETWORK™ V1.0 · M121 · PRESERVE EXPERTISE. BUILD LEGACY. · NOT A MARKETPLACE — A MOVEMENT
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
