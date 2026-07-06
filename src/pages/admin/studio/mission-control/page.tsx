import { Navigate, useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { MissionControlWorkspace } from '../../../../components/admin/studio/mission-control/MissionControlWorkspace';
import { MISSION_CONTROL_SUBTITLE } from '../../../../utils/adminStudioMissionControlDemo';
import { NDXBOOK_WORKSPACE_ID } from '../../../../studio-os-core/ndxbook/constants';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { adminStudioNdxbookMissionControlPath } from '../../../../utils/adminStudioRoutes';

export default function AdminStudioMissionControlPage() {
  const navigate = useNavigate();
  const { getModuleSubtitle, workspaceId } = useWorkspace();
  const subtitle = getModuleSubtitle('mission-control') ?? MISSION_CONTROL_SUBTITLE;

  if (workspaceId === NDXBOOK_WORKSPACE_ID) {
    return <Navigate to={adminStudioNdxbookMissionControlPath()} replace />;
  }

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
