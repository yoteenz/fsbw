import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ExecutiveTimelineWorkspace } from '../../../../components/admin/studio/executive-timeline/ExecutiveTimelineWorkspace';

const SUBTITLE =
  'Temporal intelligence layer for Studio OS — not a calendar. Living organizational timeline with dependencies, concierge commands, and founder personal life integration.';

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
        EXECUTIVE TIMELINE V1.0 · TEMPORAL INTELLIGENCE · DEMO PLACEHOLDER · DON&apos;T MANAGE YOUR CALENDAR — LEAD YOUR ORGANIZATION
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
