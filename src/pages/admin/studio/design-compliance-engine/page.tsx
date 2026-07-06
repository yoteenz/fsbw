import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { DesignComplianceEngineWorkspace } from '../../../../components/admin/studio/design-compliance-engine/DesignComplianceEngineWorkspace';

const SUBTITLE =
  'Design Compliance Engine™ — Studio OS Creative Director. Continuously audits every interface for visual, structural, and experiential consistency with the Studio OS Design Language.';

export default function AdminStudioDesignComplianceEnginePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="DESIGN COMPLIANCE ENGINE™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/organizational-guardian')}
      navGroupId="intelligence"
    >
      <DesignComplianceEngineWorkspace />
      <AdminStudioDisclaimerFooter>
        DESIGN COMPLIANCE ENGINE™ V1.0 · M154 · CREATIVE DIRECTOR · DOES IT FEEL LIKE STUDIO OS?
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
