import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { PromptQaWorkspace } from '../../../../components/admin/studio/prompt-qa/PromptQaWorkspace';

const SUBTITLE =
  'Prompt QA™ — dedicated intelligence layer validating every prompt, Profession Brain™, workflow instruction, and AI reasoning chain before production.';

export default function AdminStudioPromptQaPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="PROMPT QA™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/design-compliance-engine')}
      navGroupId="intelligence"
    >
      <PromptQaWorkspace />
      <AdminStudioDisclaimerFooter>
        PROMPT QA™ V1.0 · M155 · MISSION-CRITICAL PROMPT INFRASTRUCTURE · PROFESSION BRAINS AS ASSETS
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
