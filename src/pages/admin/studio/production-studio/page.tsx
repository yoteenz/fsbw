import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ProductionStudioWorkspace } from '../../../../components/admin/studio/production-studio/ProductionStudioWorkspace';

const PRODUCTION_STUDIO_SUBTITLE =
  'Cinematic production headquarters — every approved page becomes production-ready media. AI teams already working. Not a video editor — luxury creative control.';

export default function AdminStudioProductionStudioPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="PRODUCTION STUDIO"
      subtitle={PRODUCTION_STUDIO_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/production-builder')}
      navGroupId="production"
    >
      <ProductionStudioWorkspace />
      <AdminStudioDisclaimerFooter>
        PRODUCTION STUDIO V1.0 · CINEMATIC HEADQUARTERS · DEMO PLACEHOLDER · FOUNDER OVERRIDE ENABLED
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
