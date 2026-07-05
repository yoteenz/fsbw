import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { LeadershipManifestoFrameworkWorkspace } from '../../../../components/admin/studio/leadership-manifesto-framework/LeadershipManifestoFrameworkWorkspace';

const LEADERSHIP_MANIFESTO_FRAMEWORK_SUBTITLE =
  'The constitutional foundation inherited by every executive — shared leadership principles, unique discipline expertise, living organizational DNA.';

export default function AdminStudioLeadershipManifestoFrameworkPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="LEADERSHIP MANIFESTO FRAMEWORK"
      subtitle={LEADERSHIP_MANIFESTO_FRAMEWORK_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/executive-framework')}
      navGroupId="overview"
    >
      <LeadershipManifestoFrameworkWorkspace />
      <AdminStudioDisclaimerFooter>
        LEADERSHIP MANIFESTO FRAMEWORK V1.0 · CONSTITUTIONAL DNA · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
