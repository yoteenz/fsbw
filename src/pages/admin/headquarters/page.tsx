import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import { useCampusTransition } from '../../../components/admin/studio-os/campus/CampusTransitionProvider';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { STUDIO_OS_PLATFORM } from '../../../studio-os-core/config/platform';
import { ORGANIZATION_ROUTES, STUDIO_ADMINISTRATION_ROUTES } from '../../../studio-os-core/application/routes';
import {
  canAccessStudioAdministration,
  getAssignedOrganizationWorkspaceId,
  requireOrganizationWorkspaceId,
} from '../../../studio-os-core/application/portfolio-access';
import { useWorkspace } from '../../../studio-os-core/context/WorkspaceProvider';
import { loadWorkspace } from '../../../studio-os-core/workspace/loader';
import { workspaceStudioModulePath } from '../../../studio-os-core/workspace/routes';
import LoadingScreen from '../../../components/base/LoadingScreen';

/**
 * Organization headquarters entry — launches assigned organization inside Studio OS.
 * Portfolio owners must enter organizations from Studio Command Center, not here.
 */
export default function AdminHeadquartersEntryPage() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const { travelToWorkspace } = useCampusTransition();
  const { workspaceId, enterWorkspace } = useWorkspace();
  const assignedId = getAssignedOrganizationWorkspaceId();
  const portfolioWithoutOrg = canAccessStudioAdministration() && !assignedId;
  const resolvedOrgId = assignedId ?? requireOrganizationWorkspaceId();
  const orgWorkspace = loadWorkspace(resolvedOrgId)?.schema;

  useEffect(() => {
    if (portfolioWithoutOrg) return;
    if (workspaceId !== resolvedOrgId) {
      enterWorkspace(resolvedOrgId);
    }
  }, [portfolioWithoutOrg, resolvedOrgId, enterWorkspace, workspaceId]);

  useEffect(() => {
    if (portfolioWithoutOrg) return;
    travelToWorkspace(resolvedOrgId, { missionControl: true, showBriefing: false });
  }, [portfolioWithoutOrg, resolvedOrgId, travelToWorkspace]);

  if (portfolioWithoutOrg) {
    return <Navigate to={STUDIO_ADMINISTRATION_ROUTES.commandCenter} replace />;
  }

  const missionControlPath = workspaceStudioModulePath(resolvedOrgId, 'mission-control');

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
                {orgWorkspace?.displayName ?? resolvedOrgId.toUpperCase()} · ENTERING {STUDIO_OS_PLATFORM.name.toUpperCase()}
              </p>
              <p className="mt-3 text-[8px] font-futura" style={{ fontWeight: 515, color: '#333', lineHeight: 1.45 }}>
                Launching organization headquarters — Mission Control, production, publishing, and intelligence scoped to this company only.
              </p>
              <LoadingScreen />
              <button
                type="button"
                onClick={() => navigate(missionControlPath)}
                className="mt-4 w-full py-2 text-[8px] font-futura border border-black"
                style={{ fontWeight: 515, background: '#fff' }}
              >
                ENTER MISSION CONTROL
              </button>
              <button
                type="button"
                onClick={() => navigate(ORGANIZATION_ROUTES.studioOverview)}
                className="mt-2 w-full py-2 text-[8px] font-futura border border-black"
                style={{ fontWeight: 515, background: '#fff' }}
              >
                OPEN HEADQUARTERS OVERVIEW
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
