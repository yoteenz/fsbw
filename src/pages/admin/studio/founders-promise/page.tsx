import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { FoundersPromiseWorkspace } from '../../../../components/admin/studio/founders-promise/FoundersPromiseWorkspace';

const FOUNDERS_PROMISE_SUBTITLE =
  'Your personal north star — the deeply personal commitment that defines why your company deserves to exist. Not marketing. Truth.';

export default function AdminStudioFoundersPromisePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="FOUNDER'S PROMISE"
      subtitle={FOUNDERS_PROMISE_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/remembrance-garden')}
      navGroupId="overview"
    >
      <FoundersPromiseWorkspace />
      <AdminStudioDisclaimerFooter>
        FOUNDER&apos;S PROMISE V1.0 · NORTH STAR · EMOTIONAL FOUNDATION · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
