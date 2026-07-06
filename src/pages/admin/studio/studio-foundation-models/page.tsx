import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { StudioFoundationModelsWorkspace } from '../../../../components/admin/studio/studio-foundation-models/StudioFoundationModelsWorkspace';

const SUBTITLE =
  'Studio Foundation Models™ & Profession Models™ — long-term Studio-owned intelligence roadmap. Model-agnostic now; Studio Models™ are the destination.';

export default function AdminStudioFoundationModelsPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="STUDIO FOUNDATION MODELS™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/mission-control')}
      navGroupId="intelligence"
    >
      <StudioFoundationModelsWorkspace />
      <AdminStudioDisclaimerFooter>
        STUDIO FOUNDATION MODELS™ & PROFESSION MODELS™ V1.0 · M124 · PRESERVE EXPERTISE · BUILD LEGACY · OWN THE INTELLIGENCE LAYER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
