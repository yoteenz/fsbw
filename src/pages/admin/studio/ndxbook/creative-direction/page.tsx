import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { CreativeDirectionStudioWorkspace } from '../../../../../components/admin/studio-os/creative-direction-studio/CreativeDirectionStudioWorkspace';
import { useEnsureNdxbookWorkspaceOnMount } from '../../../../../hooks/useEnsureNdxbookWorkspace';
import { NDXBOOK_WORKSPACE_ID } from '../../../../../studio-os-core/ndxbook/constants';
import { ensureFounderPilotForOrganization } from '../../../../../studio-os-core/founder-pilot-mode';
import {
  adminStudioNdxbookMissionControlPath,
  adminStudioNdxbookNewsroomDepartmentPath,
} from '../../../../../utils/adminStudioRoutes';

/** Creative Direction Studio™ — canonical creative layer for Page 001 (above Production Engine). */
export default function AdminStudioNdxbookCreativeDirectionPage() {
  useEnsureNdxbookWorkspaceOnMount();
  ensureFounderPilotForOrganization(NDXBOOK_WORKSPACE_ID);
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="CREATIVE DIRECTION STUDIO™"
      subtitle="PAGE 001 · LIVING CREATIVE BRAIN · ABOVE STUDIO PRODUCTION ENGINE"
      breadcrumbParentLabel="HEADQUARTERS"
      breadcrumbParentPath={adminStudioNdxbookMissionControlPath()}
      onBack={() => navigate(adminStudioNdxbookMissionControlPath())}
      navGroupId="production"
    >
      <CreativeDirectionStudioWorkspace />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => navigate(adminStudioNdxbookNewsroomDepartmentPath('discover'))}
          className="px-3 py-2 text-[7px] font-futura border"
          style={{ fontWeight: 515, borderColor: '#6366F1', color: '#6366F1' }}
        >
          CONTINUE TO DISCOVER DEPARTMENT →
        </button>
      </div>
      <AdminStudioDisclaimerFooter>
        CREATIVE DIRECTION · INSPIRATION LIBRARY · LIVING MOOD BOARD · PARALLEL TIMELINES
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
