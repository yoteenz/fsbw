import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ExperienceStudioWorkspace } from '../../../../components/admin/studio/experience-studio/ExperienceStudioWorkspace';

const EXPERIENCE_STUDIO_SUBTITLE =
  'Direct a world-class creative agency — Studio Intelligence™ as your Creative Director. Experiences, not pages.';

export default function AdminStudioDigitalArchitectPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="EXPERIENCE STUDIO"
      subtitle={EXPERIENCE_STUDIO_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/experience-architect')}
      navGroupId="overview"
      hideNavTabs
      pageHeading="EXPERIENCE STUDIO™"
    >
      <ExperienceStudioWorkspace />
      <AdminStudioDisclaimerFooter>
        EXPERIENCE STUDIO™ · DESIGN DNA · EXPERIENCE DNA · REMIX · AI CREATIVE DIRECTOR · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
