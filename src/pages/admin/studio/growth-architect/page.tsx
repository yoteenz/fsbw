import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { GrowthArchitectWorkspace } from '../../../../components/admin/studio/growth-architect/GrowthArchitectWorkspace';

const GROWTH_ARCHITECT_SUBTITLE =
  'Transform digital ecosystems into thriving businesses — sustainable growth OS, not random tactics. Compound value over decades.';

export default function AdminStudioGrowthArchitectPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="GROWTH ARCHITECT"
      subtitle={GROWTH_ARCHITECT_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/digital-architect')}
      navGroupId="overview"
    >
      <GrowthArchitectWorkspace />
      <AdminStudioDisclaimerFooter>
        GROWTH ARCHITECT V1.0 · SUSTAINABLE GROWTH OS · RELATIONSHIP-DRIVEN · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
