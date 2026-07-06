import { Link, useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { NdxbookMissionControl } from '../../../../../components/admin/studio-os/ndxbook-mission-control/NdxbookMissionControl';
import {
  ndxbookDistributionQuickLink,
  ndxbookSocialsQuickLink,
} from '../../../../../components/admin/studio-os/ndxbook-mission-control/ndxbookMissionActionRoutes';
import { useEnsureNdxbookWorkspaceOnMount } from '../../../../../hooks/useEnsureNdxbookWorkspace';
import { adminStudioNdxbookPath } from '../../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../../utils/adminStudioTheme';
import { NDXBOOK_WORKSPACE_ID } from '../../../../../studio-os-core/ndxbook/constants';
import { ensureFounderPilotForOrganization } from '../../../../../studio-os-core/founder-pilot-mode';
import { useStudioModuleNav } from '../../../../../studio-os-core/organization-context';

export default function AdminStudioNdxbookMissionControlPage() {
  useEnsureNdxbookWorkspaceOnMount();
  ensureFounderPilotForOrganization(NDXBOOK_WORKSPACE_ID);
  const navigate = useNavigate();
  const { toModule } = useStudioModuleNav();

  return (
    <AdminStudioStageShell
      title="NDXBOOK HEADQUARTERS"
      subtitle="AI MEDIA OPERATING CENTER · REVIEW · APPROVE · PUBLISH"
      breadcrumbParentLabel="NDXBOOK"
      breadcrumbParentPath={adminStudioNdxbookPath()}
      onBack={() => navigate(adminStudioNdxbookPath())}
      navGroupId="intelligence"
    >
      <div className="flex flex-wrap gap-1 mb-3">
        <Link
          to={ndxbookDistributionQuickLink(toModule)}
          className="flex-1 py-2 text-[7px] font-futura uppercase border text-center"
          style={{
            fontWeight: 515,
            color: '#FFF',
            background: '#6366F1',
            borderColor: ADMIN_STUDIO_THEME.panelBorder,
            textDecoration: 'none',
            display: 'block',
          }}
        >
          REVIEW & POST CONTENT →
        </Link>
        <Link
          to={ndxbookSocialsQuickLink(toModule)}
          className="flex-1 py-2 text-[7px] font-futura uppercase border text-center"
          style={{
            fontWeight: 515,
            color: ADMIN_STUDIO_THEME.textSecondary,
            borderColor: ADMIN_STUDIO_THEME.panelBorder,
            textDecoration: 'none',
            display: 'block',
          }}
        >
          SOCIAL CONNECTORS →
        </Link>
      </div>

      <NdxbookMissionControl workspaceId={NDXBOOK_WORKSPACE_ID} accentColor="#6366F1" />

      <AdminStudioDisclaimerFooter>
        NDXBOOK HEADQUARTERS · ADMIN APPROVAL REQUIRED · NO AUTO-PUBLISH
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
