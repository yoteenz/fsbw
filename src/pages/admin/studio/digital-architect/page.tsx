import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { DigitalArchitectWorkspace } from '../../../../components/admin/studio/digital-architect/DigitalArchitectWorkspace';

const DIGITAL_ARCHITECT_SUBTITLE =
  'Digital solution architect — transform approved blueprints into unforgettable digital worlds. Purpose before templates.';

export default function AdminStudioDigitalArchitectPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="DIGITAL ARCHITECT"
      subtitle={DIGITAL_ARCHITECT_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/experience-architect')}
      navGroupId="overview"
    >
      <DigitalArchitectWorkspace />
      <AdminStudioDisclaimerFooter>
        DIGITAL ARCHITECT V2.0 · EXPERIENCE GALLERY · ECOSYSTEM DESIGN · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
