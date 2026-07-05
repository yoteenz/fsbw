import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ScreeningRoomWorkspace } from '../../../../components/admin/studio/screening-room/ScreeningRoomWorkspace';

const SUBTITLE =
  'Luxury review theater — experience every production before publication. Private cinema · not a dashboard.';

export default function AdminStudioScreeningRoomPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="SCREENING ROOM"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/render-queue')}
      navGroupId="production"
    >
      <ScreeningRoomWorkspace />
      <AdminStudioDisclaimerFooter>
        SCREENING ROOM V1.0 · PRIVATE CINEMA · DEMO PLACEHOLDER · FOUNDER JUDGMENT FINAL
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
