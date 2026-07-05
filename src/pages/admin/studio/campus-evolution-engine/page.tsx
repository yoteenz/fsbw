import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { CampusEvolutionEngineWorkspace } from '../../../../components/admin/studio/campus-evolution-engine/CampusEvolutionEngineWorkspace';

const CAMPUS_EVOLUTION_SUBTITLE =
  'Walk through decades of organizational growth — architecture earned through knowledge, leadership, relationships, and innovation.';

export default function AdminStudioCampusEvolutionEnginePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="CAMPUS EVOLUTION ENGINE"
      subtitle={CAMPUS_EVOLUTION_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/architect-studio')}
      navGroupId="overview"
    >
      <CampusEvolutionEngineWorkspace />
      <AdminStudioDisclaimerFooter>
        CAMPUS EVOLUTION ENGINE V1.0 · LIVING ARCHITECTURAL GROWTH · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
