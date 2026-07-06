import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { StudioOsBrandTagline } from '../../../../components/admin/studio/brand/StudioOsBrandTagline';
import { ExpertMarketplaceWorkspace } from '../../../../components/admin/studio/expert-marketplace/ExpertMarketplaceWorkspace';
import {
  EXPERT_MARKETPLACE_PAGE_PHILOSOPHY,
  EXPERT_MARKETPLACE_PAGE_SUBTITLE,
} from '../../../../utils/adminStudioExpertMarketplaceDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  adminStudioMarketplacePath,
  adminStudioProfessionBrainPath,
} from '../../../../utils/adminStudioRoutes';

export default function AdminStudioExpertMarketplacePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="EXPERT MARKETPLACE™"
      subtitle={EXPERT_MARKETPLACE_PAGE_SUBTITLE}
      breadcrumbParentLabel="PROFESSION BRAIN"
      breadcrumbParentPath={adminStudioProfessionBrainPath()}
      onBack={() => navigate(adminStudioProfessionBrainPath())}
      navGroupId="intelligence"
    >
      <div className="p-3 mb-4 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <StudioOsBrandTagline systemId="expert-marketplace" />
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          {EXPERT_MARKETPLACE_PAGE_PHILOSOPHY}
        </p>
      </div>

      <ExpertMarketplaceWorkspace />

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={() => navigate(adminStudioProfessionBrainPath())}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          ← PROFESSION BRAIN
        </button>
        <button
          type="button"
          onClick={() => navigate(adminStudioMarketplacePath())}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          LEGACY MARKETPLACE →
        </button>
      </div>

      <AdminStudioDisclaimerFooter>
        EXPERT MARKETPLACE™ · M92 · PRESERVE EXPERTISE · BUILD LEGACY · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
