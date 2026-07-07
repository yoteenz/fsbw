import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { IdentityTimelineWorkspace } from '../../../../components/admin/studio/identity-timeline/IdentityTimelineWorkspace';

const SUBTITLE =
  'Identity Timeline™ — every person has a permanent record of their journey inside Studio OS. Joined, trained, contributed, mentored, promoted, awarded, and led — the professional story preserved forever, not just the organization.';

export default function AdminStudioIdentityTimelinePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="IDENTITY TIMELINE™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/organizational-hierarchy')}
      navGroupId="intelligence"
    >
      <IdentityTimelineWorkspace />
      <AdminStudioDisclaimerFooter>
        IDENTITY TIMELINE™ V1.0 · M168 · PRESERVE EVERY PROFESSIONAL STORY
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
