import { useNavigate, useSearchParams } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ProductionBuilderWorkspace } from '../../../../components/admin/studio/production-builder/ProductionBuilderWorkspace';
import { PRODUCTION_BUILDER_SUBTITLE } from '../../../../utils/adminStudioProductionBuilderDemo';

export default function AdminStudioProductionBuilderPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const packId = searchParams.get('packId');

  return (
    <AdminStudioStageShell
      title="PRODUCTION BUILDER"
      subtitle={PRODUCTION_BUILDER_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate(packId ? `/admin/studio/content-packs/${packId}` : '/admin/studio/overview')}
      navGroupId="production"
      hideNavTabs
    >
      <ProductionBuilderWorkspace />
      <AdminStudioDisclaimerFooter>
        VISUAL PRODUCTION ASSEMBLY · BRIDGES ASSET DIRECTOR + CONTENT PACKS · AI GENERATION NOT CONNECTED
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
