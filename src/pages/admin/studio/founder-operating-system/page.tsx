import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { FounderOperatingSystemWorkspace } from '../../../../components/admin/studio/founder-operating-system/FounderOperatingSystemWorkspace';

const SUBTITLE =
  'Founder Operating System™ — while Studio OS operates the organization, Founder OS operates the founder. Studio OS Version 1 culmination.';

export default function AdminStudioFounderOperatingSystemPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="FOUNDER OPERATING SYSTEM™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/mission-control')}
      navGroupId="intelligence"
    >
      <FounderOperatingSystemWorkspace />
      <AdminStudioDisclaimerFooter>
        FOUNDER OPERATING SYSTEM™ V1.0 · M118 · STUDIO OS V1 · PRESERVE EXPERTISE. BUILD LEGACY. EMPOWER VISIONARIES.
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
