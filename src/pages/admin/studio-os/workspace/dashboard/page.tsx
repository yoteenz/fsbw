import { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { StudioPlatformLayout } from '../../../../../components/admin/studio-os/StudioPlatformLayout';
import { useRequireAdminPageAccess } from '../../../../../hooks/useRequireAdminPageAccess';
import { STUDIO_OS_ROUTES } from '../../../../../studio-os-core/workspace/routes';
import { useWorkspace } from '../../../../../studio-os-core/context/WorkspaceProvider';
import { getRegistryWorkspaceById } from '../../../../../studio-os-core/workspace-creation/registry';
import { isKnownWorkspaceId } from '../../../../../workspaces';
import { useWorkspaceCreationEngine } from '../../../../../hooks/useWorkspaceCreationEngine';
import { WorkspaceDashboard } from '../../../../../components/admin/studio-os/workspace-creation/WorkspaceDashboard';

export default function AdminStudioOsWorkspaceDashboardPage() {
  useRequireAdminPageAccess();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const { setActiveWorkspace } = useWorkspace();
  const { store, getExecutiveTeam, advancePromotion } = useWorkspaceCreationEngine();

  useEffect(() => {
    if (workspaceId && isKnownWorkspaceId(workspaceId)) {
      setActiveWorkspace(workspaceId);
    }
  }, [workspaceId, setActiveWorkspace]);

  if (!workspaceId || !isKnownWorkspaceId(workspaceId)) {
    return <Navigate to={STUDIO_OS_ROUTES.entry} replace />;
  }

  const record = getRegistryWorkspaceById(workspaceId);
  if (!record) {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceShell(workspaceId)} replace />;
  }

  const team = getExecutiveTeam(record);

  return (
    <StudioPlatformLayout
      title={record.name}
      subtitle="WORKSPACE DASHBOARD · EXECUTIVE TEAM · PROMOTION PIPELINE"
      onBack={() => navigate(STUDIO_OS_ROUTES.entry)}
      hideNav
    >
      <WorkspaceDashboard
        workspace={record}
        executiveTeam={team}
        promotionItems={store.promotionPipeline}
        onAdvancePromotion={advancePromotion}
      />
    </StudioPlatformLayout>
  );
}
