import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { IdentityGraphWorkspace } from '../../../../components/admin/studio/identity-graph/IdentityGraphWorkspace';

const SUBTITLE =
  'Identity Graph™ — foundational people intelligence. Every person connected to your organization becomes a living profile with relationships, expertise, history, and organizational context.';

export default function AdminStudioIdentityGraphPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="IDENTITY GRAPH™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/relationship-memory')}
      navGroupId="intelligence"
    >
      <IdentityGraphWorkspace />
      <AdminStudioDisclaimerFooter>
        IDENTITY GRAPH™ V1.0 · M163 · PEOPLE ARE FIRST-CLASS CITIZENS · ORGANIZATIONS ARE BUILT FROM PEOPLE
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
