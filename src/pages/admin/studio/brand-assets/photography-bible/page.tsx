import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { PhotographyBibleWorkspace } from '../../../../../components/admin/studio/product-photography-bible/PhotographyBibleWorkspace';
import { PHOTOGRAPHY_BIBLE_SUBTITLE } from '../../../../../utils/adminStudioProductPhotographyBibleDemo';
import { adminStudioBrandAssetsPath } from '../../../../../utils/adminStudioRoutes';

export default function AdminStudioPhotographyBiblePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="PHOTOGRAPHY BIBLE"
      subtitle={PHOTOGRAPHY_BIBLE_SUBTITLE}
      breadcrumbParentLabel="BRAND ASSETS"
      breadcrumbParentPath={adminStudioBrandAssetsPath()}
      onBack={() => navigate(adminStudioBrandAssetsPath())}
      navGroupId="visuals"
      breadcrumbPageTitle="PHOTOGRAPHY BIBLE"
    >
      <PhotographyBibleWorkspace />
      <AdminStudioDisclaimerFooter>
        PHOTOGRAPHY BIBLE · CREATIVE DNA v1.0 · APPROVED / LOCKED · ASSET FACTORY MANUFACTURES FROM DNA · NO MANUAL IMAGE-BY-IMAGE MANAGEMENT
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
