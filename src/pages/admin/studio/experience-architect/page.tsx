import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ExperienceArchitectWorkspace } from '../../../../components/admin/studio/experience-architect/ExperienceArchitectWorkspace';

const EXPERIENCE_ARCHITECT_SUBTITLE =
  'Emotional design for every touchpoint — how people feel from discovery to legacy. Optimize for memorability.';

export default function AdminStudioExperienceArchitectPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="EXPERIENCE ARCHITECT"
      subtitle={EXPERIENCE_ARCHITECT_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/brand-architect')}
      navGroupId="overview"
    >
      <ExperienceArchitectWorkspace />
      <AdminStudioDisclaimerFooter>
        EXPERIENCE ARCHITECT V1.0 · EMOTIONAL DESIGN · MEMORABILITY · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
