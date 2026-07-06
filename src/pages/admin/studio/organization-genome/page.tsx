import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { OrganizationGenomeWorkspace } from '../../../../components/admin/studio/organization-genome/OrganizationGenomeWorkspace';
import {
  ORGANIZATION_GENOME_PAGE_PHILOSOPHY,
  ORGANIZATION_GENOME_PAGE_SUBTITLE,
} from '../../../../utils/adminStudioOrganizationGenomeDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  adminStudioBusinessDiscoveryBlueprintPath,
  adminStudioProfessionBrainPath,
} from '../../../../utils/adminStudioRoutes';

export default function AdminStudioOrganizationGenomePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="ORGANIZATION GENOME™"
      subtitle={ORGANIZATION_GENOME_PAGE_SUBTITLE}
      breadcrumbParentLabel="BUSINESS DISCOVERY"
      breadcrumbParentPath={adminStudioBusinessDiscoveryBlueprintPath()}
      onBack={() => navigate(adminStudioBusinessDiscoveryBlueprintPath())}
      navGroupId="intelligence"
    >
      <div className="p-3 mb-4 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          {ORGANIZATION_GENOME_PAGE_PHILOSOPHY}
        </p>
      </div>

      <OrganizationGenomeWorkspace />

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={() => navigate(adminStudioBusinessDiscoveryBlueprintPath())}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          ← BLUEPRINT
        </button>
        <button
          type="button"
          onClick={() => navigate(adminStudioProfessionBrainPath())}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          PROFESSION BRAIN →
        </button>
      </div>

      <AdminStudioDisclaimerFooter>
        ORGANIZATION GENOME™ V1.0 · IDENTITY LAYER · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
