import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { CampaignOrchestratorWorkspace } from '../../../../components/admin/studio/campaign-orchestrator/CampaignOrchestratorWorkspace';
import { CAMPAIGN_ORCHESTRATOR_SUBTITLE } from '../../../../utils/adminStudioCampaignOrchestratorDemo';

export default function AdminStudioCampaignOrchestratorPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="CAMPAIGN ORCHESTRATOR"
      subtitle={CAMPAIGN_ORCHESTRATOR_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/overview')}
      navGroupId="distribution"
    >
      <CampaignOrchestratorWorkspace />
      <AdminStudioDisclaimerFooter>
        OPERATIONAL PLANNER · HUMAN APPROVAL REQUIRED AT EVERY GATE · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
