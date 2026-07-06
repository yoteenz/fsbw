import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { RegressionEngineWorkspace } from '../../../../components/admin/studio/regression-engine/RegressionEngineWorkspace';

const SUBTITLE =
  'Regression Engine™ — continuously verifies that every new change does not unintentionally break existing functionality. Studio OS remembers everything that has ever worked.';

export default function AdminStudioRegressionEnginePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="REGRESSION ENGINE™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/performance-monitor')}
      navGroupId="intelligence"
    >
      <RegressionEngineWorkspace />
      <AdminStudioDisclaimerFooter>
        REGRESSION ENGINE™ V1.0 · M160 · NEVER REPEAT THE SAME MISTAKE TWICE · HISTORICAL MEMORY™
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
