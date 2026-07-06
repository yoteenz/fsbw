import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { QaSimulationEngineWorkspace } from '../../../../components/admin/studio/qa-simulation-engine/QaSimulationEngineWorkspace';

const SUBTITLE =
  'QA Simulation Engine™ — Studio OS\'s practice field. Simulate customer, employee, administrator, expert, and founder journeys before anything reaches production.';

export default function AdminStudioQaSimulationEnginePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="QA SIMULATION ENGINE™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/qa-inspector')}
      navGroupId="intelligence"
    >
      <QaSimulationEngineWorkspace />
      <AdminStudioDisclaimerFooter>
        QA SIMULATION ENGINE™ V1.0 · M144 · PRACTICE FIELD · REHEARSE BEFORE USERS ENCOUNTER IT
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
