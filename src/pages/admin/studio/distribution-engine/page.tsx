import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { DistributionEngineWorkspace } from '../../../../components/admin/studio/distribution-engine/DistributionEngineWorkspace';

const DISTRIBUTION_ENGINE_SUBTITLE =
  'Maximize the impact, lifespan, reach, and value of every knowledge asset. One source of truth — dozens of platform experiences.';

export default function AdminStudioDistributionEnginePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="DISTRIBUTION ENGINE"
      subtitle={DISTRIBUTION_ENGINE_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/work-orchestration')}
      navGroupId="distribution"
    >
      <DistributionEngineWorkspace />
      <AdminStudioDisclaimerFooter>
        DISTRIBUTION ENGINE V1.0 · KNOWLEDGE ASSETS · CHANNEL OPTIMIZATION · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
