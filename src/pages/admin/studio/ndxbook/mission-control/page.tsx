import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { NdxbookMissionControl } from '../../../../../components/admin/studio-os/ndxbook-mission-control/NdxbookMissionControl';
import { MissionQuickLink } from '../../../../../components/admin/studio-os/ndxbook-mission-control/MissionQuickLink';
import {
  ndxbookDistributionQuickLink,
  ndxbookModulePath,
  ndxbookSocialsQuickLink,
} from '../../../../../components/admin/studio-os/ndxbook-mission-control/ndxbookMissionActionRoutes';
import { useEnsureNdxbookWorkspaceOnMount } from '../../../../../hooks/useEnsureNdxbookWorkspace';
import { ADMIN_STUDIO_THEME } from '../../../../../utils/adminStudioTheme';
import { NDXBOOK_WORKSPACE_ID } from '../../../../../studio-os-core/ndxbook/constants';
import { ensureFounderPilotForOrganization } from '../../../../../studio-os-core/founder-pilot-mode';

export default function AdminStudioNdxbookMissionControlPage() {
  useEnsureNdxbookWorkspaceOnMount();
  ensureFounderPilotForOrganization(NDXBOOK_WORKSPACE_ID);
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="NDXBOOK HEADQUARTERS"
      subtitle="AI MEDIA OPERATING CENTER · REVIEW · APPROVE · PUBLISH"
      breadcrumbParentLabel="NDXBOOK"
      breadcrumbParentPath={ndxbookModulePath('ndxbook')}
      onBack={() => navigate(ndxbookModulePath('ndxbook'))}
      navGroupId="intelligence"
    >
      <div className="flex flex-wrap gap-1 mb-3">
        <MissionQuickLink
          to={ndxbookDistributionQuickLink()}
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
        </MissionQuickLink>
        <MissionQuickLink
          to={ndxbookSocialsQuickLink()}
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
        </MissionQuickLink>
      </div>

      <NdxbookMissionControl workspaceId={NDXBOOK_WORKSPACE_ID} accentColor="#6366F1" />

      <AdminStudioDisclaimerFooter>
        NDXBOOK HEADQUARTERS · ADMIN APPROVAL REQUIRED · NO AUTO-PUBLISH
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
