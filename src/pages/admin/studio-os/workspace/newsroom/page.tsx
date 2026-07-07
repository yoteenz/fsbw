import { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { StudioPlatformLayout } from '../../../../../components/admin/studio-os/StudioPlatformLayout';
import { useRequireAdminPageAccess } from '../../../../../hooks/useRequireAdminPageAccess';
import { STUDIO_OS_ROUTES } from '../../../../../studio-os-core/workspace/routes';
import { useWorkspace } from '../../../../../studio-os-core/context/WorkspaceProvider';
import { isKnownWorkspaceId } from '../../../../../workspaces';
import { NdxbookNewsroom } from '../../../../../components/admin/studio-os/ndxbook-newsroom/NdxbookNewsroom';

export default function AdminStudioOsWorkspaceNewsroomPage() {
  useRequireAdminPageAccess();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const { setActiveWorkspace } = useWorkspace();

  useEffect(() => {
    if (workspaceId && isKnownWorkspaceId(workspaceId)) {
      setActiveWorkspace(workspaceId);
    }
  }, [workspaceId, setActiveWorkspace]);

  if (!workspaceId || !isKnownWorkspaceId(workspaceId)) {
    return <Navigate to={STUDIO_OS_ROUTES.entry} replace />;
  }

  if (workspaceId !== 'ai-media') {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceDashboard(workspaceId)} replace />;
  }

  return (
    <StudioPlatformLayout
      title="NEWSROOM"
      subtitle="NEWSROOM V1.0 · PRODUCTION ORCHESTRATION · OPERATIONAL DNA · DEMO PLACEHOLDER"
      onBack={() => navigate(STUDIO_OS_ROUTES.workspaceDashboard(workspaceId))}
      hideNav
    >
      <NdxbookNewsroom workspaceId={workspaceId} />
    </StudioPlatformLayout>
  );
}
