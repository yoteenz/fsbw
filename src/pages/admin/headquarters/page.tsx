import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import { useCampusTransition } from '../../../components/admin/studio-os/campus/CampusTransitionProvider';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { STUDIO_OS_PLATFORM } from '../../../studio-os-core/config/platform';
import { ORGANIZATION_ROUTES } from '../../../studio-os-core/application/routes';
import { getAssignedOrganizationWorkspaceId } from '../../../studio-os-core/application/portfolio-access';
import { useWorkspace } from '../../../studio-os-core/context/WorkspaceProvider';
import { FRONTAL_SLAYER_WORKSPACE } from '../../../workspaces/frontal-slayer/config';
import LoadingScreen from '../../../components/base/LoadingScreen';

/**
 * Frontal Slayer admin entry — launches Headquarters inside Studio OS.
 * Regular organization users never see workspace registry or other organizations.
 */
export default function AdminHeadquartersEntryPage() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const { travelToWorkspace } = useCampusTransition();
  const { workspaceId, enterWorkspace } = useWorkspace();
  const assignedId = getAssignedOrganizationWorkspaceId();

  useEffect(() => {
    if (workspaceId !== assignedId) {
      enterWorkspace(assignedId);
    }
  }, [assignedId, enterWorkspace, workspaceId]);

  useEffect(() => {
    travelToWorkspace(assignedId, { missionControl: true, showBriefing: false });
  }, [assignedId, travelToWorkspace]);

  return (
    <div className="min-h-screen relative">
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/marble-half.png')`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="relative z-10 uppercase" style={{ textTransform: 'uppercase' }}>
        <AdminHeader
          title="HEADQUARTERS"
          showBack
          onBack={() => navigate('/admin/dashboard')}
          breadcrumbParentLabel="ADMIN"
          breadcrumbParentPath="/admin/dashboard"
        />
        <div className="pb-8 px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-white/60 backdrop-blur-sm border border-black p-4 shadow-lg" style={{ borderWidth: '1.3px' }}>
              <p className="text-red-500 font-bold text-xl tracking-wider" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: '#EB1C24' }}>
                HEADQUARTERS
              </p>
              <p className="mt-2 text-[10px] font-futura" style={{ fontWeight: 515, color: '#808080', lineHeight: 1.4 }}>
                {FRONTAL_SLAYER_WORKSPACE.displayName} · ENTERING {STUDIO_OS_PLATFORM.name.toUpperCase()}
              </p>
              <p className="mt-3 text-[8px] font-futura" style={{ fontWeight: 515, color: '#333', lineHeight: 1.45 }}>
                Launching your organization headquarters — mission control, production, publishing, and intelligence run on Studio OS.
              </p>
              <LoadingScreen />
              <button
                type="button"
                onClick={() => navigate(ORGANIZATION_ROUTES.missionControl)}
                className="mt-4 w-full py-2 text-[8px] font-futura border border-black"
                style={{ fontWeight: 515, background: '#fff' }}
              >
                ENTER HEADQUARTERS DIRECTLY
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
