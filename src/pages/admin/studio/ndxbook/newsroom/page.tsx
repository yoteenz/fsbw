import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { NdxbookNewsroom } from '../../../../../components/admin/studio-os/ndxbook-newsroom/NdxbookNewsroom';
import { useEnsureNdxbookWorkspaceOnMount } from '../../../../../hooks/useEnsureNdxbookWorkspace';
import { NDXBOOK_WORKSPACE_ID } from '../../../../../studio-os-core/ndxbook/constants';
import { ensureFounderPilotForOrganization } from '../../../../../studio-os-core/founder-pilot-mode';
import { adminStudioNdxbookMissionControlPath } from '../../../../../utils/adminStudioRoutes';

/**
 * NDXBook Newsroom — Page 001 create · Studio Intelligence review · approve · schedule · publish.
 * Production Floor tab shows the PAGE 001 PIPELINE panel at the top.
 */
export default function AdminStudioNdxbookNewsroomPage() {
  useEnsureNdxbookWorkspaceOnMount();
  ensureFounderPilotForOrganization(NDXBOOK_WORKSPACE_ID);
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="NDXBOOK NEWSROOM"
      subtitle="PRODUCTION FLOOR · REVIEW · APPROVE · PUBLISH PAGE 001"
      breadcrumbParentLabel="HEADQUARTERS"
      breadcrumbParentPath={adminStudioNdxbookMissionControlPath()}
      onBack={() => navigate(adminStudioNdxbookMissionControlPath())}
      navGroupId="production"
    >
      <NdxbookNewsroom workspaceId={NDXBOOK_WORKSPACE_ID} />
      <AdminStudioDisclaimerFooter>
        PAGE 001 PIPELINE · INSTAGRAM ONLY · STUDIO INTELLIGENCE GATE · ADMIN APPROVAL REQUIRED
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
