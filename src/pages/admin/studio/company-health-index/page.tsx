import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { CompanyHealthIndexWorkspace } from '../../../../components/admin/studio/company-health-index/CompanyHealthIndexWorkspace';
import {
  COMPANY_HEALTH_INDEX_PAGE_PHILOSOPHY,
  COMPANY_HEALTH_INDEX_PAGE_SUBTITLE,
} from '../../../../utils/adminStudioCompanyHealthIndexDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { adminStudioMissionControlPath } from '../../../../utils/adminStudioRoutes';

export default function AdminStudioCompanyHealthIndexPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="COMPANY HEALTH INDEX™"
      subtitle={COMPANY_HEALTH_INDEX_PAGE_SUBTITLE}
      breadcrumbParentLabel="MISSION CONTROL"
      breadcrumbParentPath={adminStudioMissionControlPath()}
      onBack={() => navigate(adminStudioMissionControlPath())}
      navGroupId="overview"
    >
      <div className="p-3 mb-4 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          {COMPANY_HEALTH_INDEX_PAGE_PHILOSOPHY}
        </p>
      </div>

      <CompanyHealthIndexWorkspace />

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={() => navigate(adminStudioMissionControlPath())}
          className="w-full py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          ← MISSION CONTROL
        </button>
      </div>

      <AdminStudioDisclaimerFooter>
        COMPANY HEALTH INDEX™ V1.0 · HEALTHIER NOT LARGER · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
