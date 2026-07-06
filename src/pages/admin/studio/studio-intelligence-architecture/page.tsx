import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { StudioIntelligenceArchitectureWorkspace } from '../../../../components/admin/studio/studio-intelligence-architecture/StudioIntelligenceArchitectureWorkspace';

const SUBTITLE =
  'Studio Intelligence™ Architecture — model-agnostic intelligence layer. Studio OS owns organizational knowledge; AI models are reasoning engines, not the moat.';

export default function AdminStudioStudioIntelligenceArchitecturePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="STUDIO INTELLIGENCE™ ARCHITECTURE"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/mission-control')}
      navGroupId="intelligence"
    >
      <StudioIntelligenceArchitectureWorkspace />
      <AdminStudioDisclaimerFooter>
        STUDIO INTELLIGENCE™ ARCHITECTURE V1.0 · M122 · THE MOAT IS PRESERVED EXPERTISE — NOT THE MODEL
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
