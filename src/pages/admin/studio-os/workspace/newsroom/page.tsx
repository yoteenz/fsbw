import { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import AdminHeader from '../../../components/AdminHeader';
import { useRequireAdminPageAccess } from '../../../../../hooks/useRequireAdminPageAccess';
import { STUDIO_OS_PLATFORM } from '../../../../../studio-os-core/config/platform';
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
    <div className="min-h-screen relative uppercase" style={{ textTransform: 'uppercase' }}>
      <div className="fixed inset-0 -z-10" style={{ backgroundImage: `url('/assets/marble-half.png')`, backgroundSize: 'contain', backgroundRepeat: 'repeat' }} />
      <AdminHeader
        title="NEWSROOM"
        showBack
        onBack={() => navigate(STUDIO_OS_ROUTES.workspaceDashboard(workspaceId))}
        breadcrumbParentLabel={STUDIO_OS_PLATFORM.name}
        breadcrumbParentPath={STUDIO_OS_ROUTES.entry}
      />
      <div className="pb-8 px-4 max-w-2xl mx-auto">
        <NdxbookNewsroom workspaceId={workspaceId} />
        <p className="text-[6px] font-futura mt-4 text-center" style={{ color: '#808080' }}>
          NEWSROOM V1.0 · PRODUCTION ORCHESTRATION · OPERATIONAL DNA · DEMO PLACEHOLDER
        </p>
      </div>
    </div>
  );
}
