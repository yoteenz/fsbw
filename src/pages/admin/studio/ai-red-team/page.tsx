import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AiRedTeamWorkspace } from '../../../../components/admin/studio/ai-red-team/AiRedTeamWorkspace';

const SUBTITLE =
  'AI Red Team™ — internal adversarial layer that assumes everything is wrong until proven otherwise. Challenge, stress test, and expose weaknesses before users discover them.';

export default function AdminStudioAiRedTeamPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="AI RED TEAM™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/qa-simulation-engine')}
      navGroupId="intelligence"
    >
      <AiRedTeamWorkspace />
      <AdminStudioDisclaimerFooter>
        AI RED TEAM™ V1.0 · M146 · ASSUME WRONG UNTIL PROVEN · QUESTION EVERYTHING · STRENGTHEN BEFORE USERS DISCOVER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
