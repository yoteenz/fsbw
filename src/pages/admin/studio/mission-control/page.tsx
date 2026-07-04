import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { MissionControlWorkspace } from '../../../../components/admin/studio/mission-control/MissionControlWorkspace';
import { MISSION_CONTROL_SUBTITLE } from '../../../../utils/adminStudioMissionControlDemo';
import { useWorkspace } from '../../../../studio-os/context/WorkspaceProvider';

export default function AdminStudioMissionControlPage() {
  const navigate = useNavigate();
  const { getModuleSubtitle } = useWorkspace();
  const subtitle = getModuleSubtitle('mission-control') ?? MISSION_CONTROL_SUBTITLE;

  return (
    <AdminStudioStageShell
      title="MISSION CONTROL"
      subtitle={subtitle}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/dashboard')}
      navGroupId="overview"
    >
      <MissionControlWorkspace />
      <AdminStudioDisclaimerFooter>
        EXECUTIVE OPERATING ROOM · DEMO PLACEHOLDER · CONNECTORS NOT CONNECTED
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
