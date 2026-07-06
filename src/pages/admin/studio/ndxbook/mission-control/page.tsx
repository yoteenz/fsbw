import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { NdxbookMissionControl } from '../../../../../components/admin/studio-os/ndxbook-mission-control/NdxbookMissionControl';
import { useEnsureNdxbookWorkspaceOnMount } from '../../../../../hooks/useEnsureNdxbookWorkspace';
import {
  adminStudioNdxbookDistributionPath,
  adminStudioNdxbookPath,
} from '../../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../../utils/adminStudioTheme';
import { NDXBOOK_WORKSPACE_ID } from '../../../../../studio-os-core/ndxbook/constants';

export default function AdminStudioNdxbookMissionControlPage() {
  useEnsureNdxbookWorkspaceOnMount();
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="NDXBOOK MISSION CONTROL"
      subtitle="AI MEDIA OPERATING CENTER · REVIEW · APPROVE · PUBLISH"
      breadcrumbParentLabel="NDXBOOK"
      breadcrumbParentPath={adminStudioNdxbookPath()}
      onBack={() => navigate(adminStudioNdxbookPath())}
      navGroupId="intelligence"
    >
      <div className="flex flex-wrap gap-1 mb-3">
        <button
          type="button"
          onClick={() => navigate(adminStudioNdxbookDistributionPath())}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: '#FFF', background: '#6366F1', borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          REVIEW & POST CONTENT →
        </button>
        <button
          type="button"
          onClick={() => navigate(`${adminStudioNdxbookPath()}?tab=socials`)}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          SOCIAL CONNECTORS →
        </button>
      </div>

      <NdxbookMissionControl workspaceId={NDXBOOK_WORKSPACE_ID} accentColor="#6366F1" />

      <AdminStudioDisclaimerFooter>
        NDXBOOK MISSION CONTROL · ADMIN APPROVAL REQUIRED · NO AUTO-PUBLISH
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
