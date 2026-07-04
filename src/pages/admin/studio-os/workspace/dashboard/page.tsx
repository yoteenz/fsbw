import { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import AdminHeader from '../../../components/AdminHeader';
import { useRequireAdminPageAccess } from '../../../../../hooks/useRequireAdminPageAccess';
import { STUDIO_OS_PLATFORM } from '../../../../../studio-os-core/config/platform';
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
    <div className="min-h-screen relative uppercase" style={{ textTransform: 'uppercase' }}>
      <div className="fixed inset-0 -z-10" style={{ backgroundImage: `url('/assets/marble-half.png')`, backgroundSize: 'contain', backgroundRepeat: 'repeat' }} />
      <AdminHeader
        title={record.name}
        showBack
        onBack={() => navigate(STUDIO_OS_ROUTES.entry)}
        breadcrumbParentLabel={STUDIO_OS_PLATFORM.name}
        breadcrumbParentPath={STUDIO_OS_ROUTES.entry}
      />
      <div className="pb-8 px-4 max-w-2xl mx-auto">
        <WorkspaceDashboard
          workspace={record}
          executiveTeam={team}
          promotionItems={store.promotionPipeline}
          onAdvancePromotion={advancePromotion}
        />
      </div>
    </div>
  );
}
