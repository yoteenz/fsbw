import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { PromptRegistryWorkspace } from '../../../../components/admin/studio/prompt-registry/PromptRegistryWorkspace';

const SUBTITLE =
  'Prompt Registry™ — centralized management for every AI prompt, instruction set, and reasoning template. Versioned, searchable, testable, reusable.';

export default function AdminStudioPromptRegistryPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="PROMPT REGISTRY™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/automation-registry')}
      navGroupId="intelligence"
    >
      <PromptRegistryWorkspace />
      <AdminStudioDisclaimerFooter>
        PROMPT REGISTRY™ V1.0 · M133 · PROMPTS ARE CODE · NO HIDDEN PROMPT TEXT
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
