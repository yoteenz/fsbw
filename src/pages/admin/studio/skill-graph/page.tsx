import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { SkillGraphWorkspace } from '../../../../components/admin/studio/skill-graph/SkillGraphWorkspace';

const SUBTITLE =
  'Skill Graph™ — maps every capability across the organization. Who knows what, who can teach, who needs help, who should collaborate. Skills as searchable assets.';

export default function AdminStudioSkillGraphPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="SKILL GRAPH™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/professional-profile')}
      navGroupId="intelligence"
    >
      <SkillGraphWorkspace />
      <AdminStudioDisclaimerFooter>
        SKILL GRAPH™ V1.0 · M165 · SEARCHABLE ORGANIZATIONAL ASSETS · KNOWLEDGE NO LONGER INVISIBLE
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
