import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { LeadershipDnaWorkspace } from '../../../../components/admin/studio/leadership-dna/LeadershipDnaWorkspace';

const LEADERSHIP_DNA_SUBTITLE =
  'The founder operating blueprint — decision framework, approval patterns, and leadership philosophy that trains every executive AI.';

export default function AdminStudioLeadershipDnaPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="LEADERSHIP DNA"
      subtitle={LEADERSHIP_DNA_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/memory-bible')}
      navGroupId="intelligence"
    >
      <LeadershipDnaWorkspace />
      <AdminStudioDisclaimerFooter>
        LEADERSHIP DNA V1.0 · FOUNDER OPERATING BLUEPRINT · CoS PRIMARY TRAINING · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
