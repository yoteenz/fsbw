import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AssetDirectorHubDashboard } from '../../../../components/admin/studio/asset-director/AssetDirectorHubDashboard';
import { ADMIN_STUDIO_ASSET_DIRECTOR_SUBTITLE } from '../../../../utils/adminStudioAssetDirectorDemo';

export default function AdminStudioAssetDirectorPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="ASSET DIRECTOR"
      subtitle={ADMIN_STUDIO_ASSET_DIRECTOR_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/overview')}
      navGroupId="visuals"
    >
      <AssetDirectorHubDashboard />
      <AdminStudioDisclaimerFooter>
        VISUAL ASSET MANAGEMENT · PLACEHOLDER PREVIEWS · AI GENERATION NOT CONNECTED
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
