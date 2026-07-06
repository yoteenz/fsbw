import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { DesignGenomeWorkspace } from '../../../../components/admin/studio/design-genome/DesignGenomeWorkspace';

const SUBTITLE =
  'Organizational visual memory — learn design thinking · preserve identity · promote naturally · consult before building · every organization maintains its own independent genome.';

export default function AdminStudioDesignGenomePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="DESIGN GENOME"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/design-dna-canon')}
      navGroupId="intelligence"
    >
      <DesignGenomeWorkspace />
      <AdminStudioDisclaimerFooter>
        DESIGN GENOME V1.0 · DEMO · ORGANIZATION-SCOPED VISUAL MEMORY · AUTO-CAPTURE PLACEHOLDER · NO SCREENSHOT LIBRARY
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
