import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ReleaseReadinessWorkspace } from '../../../../components/admin/studio/release-readiness/ReleaseReadinessWorkspace';

const SUBTITLE =
  'Release Readiness™ — the final approval gate before any feature, workflow, Profession Brain™, automation, or system update reaches production. Confident before deployment—not hopeful afterward.';

export default function AdminStudioReleaseReadinessPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="RELEASE READINESS™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/regression-engine')}
      navGroupId="intelligence"
    >
      <ReleaseReadinessWorkspace />
      <AdminStudioDisclaimerFooter>
        RELEASE READINESS™ V1.0 · M161 · PRODUCTION IS A PRIVILEGE · EVERY RELEASE EARNS THE RIGHT TO REACH USERS
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
