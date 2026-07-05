import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { StrategyEngineWorkspace } from '../../../../components/admin/studio/strategy-engine/StrategyEngineWorkspace';

const STRATEGY_ENGINE_SUBTITLE =
  'Defines the game each company is playing — direction before execution. Studio Intelligence recommends · Chief of Staff prioritizes · Newsroom produces.';

export default function AdminStudioStrategyEnginePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="STRATEGY ENGINE"
      subtitle={STRATEGY_ENGINE_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/arrival-experience')}
      navGroupId="intelligence"
    >
      <StrategyEngineWorkspace />
      <AdminStudioDisclaimerFooter>
        STRATEGY ENGINE V1.0 · STRATEGY BOARD · INITIATIVES · ALIGNMENT · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
