import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { RoleIntelligenceWorkspace } from '../../../../components/admin/studio/role-intelligence/RoleIntelligenceWorkspace';

const SUBTITLE =
  'Role Intelligence™ — Studio OS understands work, not titles. Responsibilities, workflows, decision authority, skills, documents, automations, and AI Employee counterparts per role. Role Evolution™ keeps definitions current as organizations grow.';

export default function AdminStudioRoleIntelligencePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="ROLE INTELLIGENCE™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/skill-graph')}
      navGroupId="intelligence"
    >
      <RoleIntelligenceWorkspace />
      <AdminStudioDisclaimerFooter>
        ROLE INTELLIGENCE™ V1.0 · M166 · UNDERSTAND WORK — NOT TITLES · ROLE EVOLUTION™
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
