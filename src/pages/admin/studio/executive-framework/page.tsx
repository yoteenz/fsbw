import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ExecutiveFrameworkWorkspace } from '../../../../components/admin/studio/executive-framework/ExecutiveFrameworkWorkspace';

const EXECUTIVE_FRAMEWORK_SUBTITLE =
  'The constitutional foundation for every AI executive — coordinated leadership organization that expands founder capacity, not isolated assistants.';

export default function AdminStudioExecutiveFrameworkPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="EXECUTIVE FRAMEWORK"
      subtitle={EXECUTIVE_FRAMEWORK_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/founders-promise')}
      navGroupId="overview"
    >
      <ExecutiveFrameworkWorkspace />
      <AdminStudioDisclaimerFooter>
        EXECUTIVE FRAMEWORK V1.0 · LEADERSHIP ORGANIZATION · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
