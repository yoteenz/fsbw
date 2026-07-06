import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ExecutiveTimelineWorkspace } from '../../../../components/admin/studio/executive-timeline/ExecutiveTimelineWorkspace';

const SUBTITLE =
  'Executive Timeline™ — permanent visual history of your organization. Explore how you arrived here, replay milestones, and turn history into actionable intelligence.';

export default function AdminStudioExecutiveTimelinePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="EXECUTIVE TIMELINE"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/mission-control')}
      navGroupId="overview"
    >
      <ExecutiveTimelineWorkspace />
      <AdminStudioDisclaimerFooter>
        EXECUTIVE TIMELINE™ V1.0 · PERMANENT ORGANIZATIONAL HISTORY · M116 · PRESERVE THE JOURNEY FOREVER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
