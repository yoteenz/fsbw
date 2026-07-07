import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { NdxbookProductionEngine } from '../../../../../components/admin/studio-os/ndxbook-production-engine/NdxbookProductionEngine';
import { useEnsureNdxbookWorkspaceOnMount } from '../../../../../hooks/useEnsureNdxbookWorkspace';
import { NDXBOOK_WORKSPACE_ID } from '../../../../../studio-os-core/ndxbook/constants';
import { ensureFounderPilotForOrganization } from '../../../../../studio-os-core/founder-pilot-mode';
import { adminStudioNdxbookMissionControlPath } from '../../../../../utils/adminStudioRoutes';

/**
 * NDXBook Production Wing — department-based Studio Production Engine for Project 001.
 */
export default function AdminStudioNdxbookNewsroomPage() {
  useEnsureNdxbookWorkspaceOnMount();
  ensureFounderPilotForOrganization(NDXBOOK_WORKSPACE_ID);
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="NDXBOOK PRODUCTION WING"
      subtitle="STUDIO PRODUCTION ENGINE · PROJECT 001 · DEPARTMENT WORKSPACES"
      breadcrumbParentLabel="HEADQUARTERS"
      breadcrumbParentPath={adminStudioNdxbookMissionControlPath()}
      onBack={() => navigate(adminStudioNdxbookMissionControlPath())}
      navGroupId="production"
    >
      <NdxbookProductionEngine workspaceId={NDXBOOK_WORKSPACE_ID} />
      <AdminStudioDisclaimerFooter>
        DEPARTMENT NAVIGATION · MASTER CONTENT ASSET PASSPORT · INSTAGRAM PILOT
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
