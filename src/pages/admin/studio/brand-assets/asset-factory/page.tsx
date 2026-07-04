import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { BrandAssetsAssetFactoryWorkspace } from '../../../../../components/admin/studio/brand-assets-asset-factory/BrandAssetsAssetFactoryWorkspace';
import { BRAND_ASSETS_ASSET_FACTORY_SUBTITLE } from '../../../../../utils/adminStudioBrandAssetsAssetFactoryDemo';
import { adminStudioBrandAssetsPath } from '../../../../../utils/adminStudioRoutes';

export default function AdminStudioBrandAssetsAssetFactoryPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="ASSET FACTORY"
      subtitle={BRAND_ASSETS_ASSET_FACTORY_SUBTITLE}
      breadcrumbParentLabel="BRAND ASSETS"
      breadcrumbParentPath={adminStudioBrandAssetsPath()}
      onBack={() => navigate(adminStudioBrandAssetsPath())}
      navGroupId="visuals"
      breadcrumbPageTitle="ASSET FACTORY"
    >
      <BrandAssetsAssetFactoryWorkspace />
      <AdminStudioDisclaimerFooter>
        PHOTOGRAPHY BIBLE → IDEogram BG REMOVAL → CROP DERIVATIVES → SUPABASE · SOFT WAVE POC · NO CUSTOMER-FACING CHANGES
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
