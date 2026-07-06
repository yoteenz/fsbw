import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { OrganizationInaugurationWorkspace } from '../../../../components/admin/studio/organization-inauguration/OrganizationInaugurationWorkspace';
import {
  ORGANIZATION_INAUGURATION_PHILOSOPHY,
  ORGANIZATION_INAUGURATION_SUBTITLE,
} from '../../../../utils/adminStudioOrganizationInaugurationDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  adminStudioBusinessDiscoveryBlueprintPath,
  adminStudioCompanyOnboardingIntelligencePath,
} from '../../../../utils/adminStudioRoutes';

export default function AdminStudioOrganizationInaugurationPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="ORGANIZATION INAUGURATION"
      subtitle={ORGANIZATION_INAUGURATION_SUBTITLE}
      breadcrumbParentLabel="BUSINESS DISCOVERY BLUEPRINT"
      breadcrumbParentPath={adminStudioBusinessDiscoveryBlueprintPath()}
      onBack={() => navigate(adminStudioBusinessDiscoveryBlueprintPath())}
      navGroupId="settings"
    >
      <div className="p-3 mb-4 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          {ORGANIZATION_INAUGURATION_PHILOSOPHY}
        </p>
      </div>

      <OrganizationInaugurationWorkspace />

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={() => navigate(adminStudioBusinessDiscoveryBlueprintPath())}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          ← BUSINESS DISCOVERY BLUEPRINT
        </button>
        <button
          type="button"
          onClick={() => navigate(adminStudioCompanyOnboardingIntelligencePath())}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          ARRIVAL EXPERIENCE →
        </button>
      </div>

      <AdminStudioDisclaimerFooter>
        ORGANIZATION INAUGURATION · M90.5 · FOUNDER CEREMONY · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
