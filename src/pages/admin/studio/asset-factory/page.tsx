import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AssetFactoryWorkspace } from '../../../../components/admin/studio/asset-factory/AssetFactoryWorkspace';
import { ASSET_FACTORY_SUBTITLE } from '../../../../utils/adminStudioAssetFactoryDemo';

export default function AdminStudioAssetFactoryPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="ASSET FACTORY"
      subtitle={ASSET_FACTORY_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/mission-control')}
      navGroupId="visuals"
    >
      <AssetFactoryWorkspace />
      <AdminStudioDisclaimerFooter>
        MANUFACTURING SIMULATION · PROVIDERS NOT CONNECTED · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
