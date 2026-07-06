import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ExperienceQaWorkspace } from '../../../../components/admin/studio/experience-qa/ExperienceQaWorkspace';

const SUBTITLE =
  'Experience QA™ — evaluates the emotional quality of every interaction inside Studio OS. Software can function perfectly and still provide a poor experience.';

export default function AdminStudioExperienceQaPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="EXPERIENCE QA™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/prompt-qa')}
      navGroupId="intelligence"
    >
      <ExperienceQaWorkspace />
      <AdminStudioDisclaimerFooter>
        EXPERIENCE QA™ V1.0 · M156 · OPTIMIZES FOR CONFIDENCE, NOT CLICKS · EFFORTLESS · TRUSTWORTHY · CALM
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
