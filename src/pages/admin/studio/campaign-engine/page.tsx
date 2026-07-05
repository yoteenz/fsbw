import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { CampaignEngineWorkspace } from '../../../../components/admin/studio/campaign-engine/CampaignEngineWorkspace';

const CAMPAIGN_ENGINE_SUBTITLE =
  'Transforms strategy into coordinated execution — campaigns bridge initiatives and operational production.';

export default function AdminStudioCampaignEnginePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="CAMPAIGN ENGINE"
      subtitle={CAMPAIGN_ENGINE_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/strategy-engine')}
      navGroupId="production"
    >
      <CampaignEngineWorkspace />
      <AdminStudioDisclaimerFooter>
        CAMPAIGN ENGINE V1.0 · COORDINATED EXECUTION · DELIVERABLES · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
