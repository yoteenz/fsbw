import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { SuccessionModeWorkspace } from '../../../../components/admin/studio/succession-mode/SuccessionModeWorkspace';
import {
  SUCCESSION_MODE_PAGE_PHILOSOPHY,
  SUCCESSION_MODE_PAGE_SUBTITLE,
} from '../../../../utils/adminStudioSuccessionModeDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  adminStudioCompanyHealthIndexPath,
  adminStudioProfessionBrainPath,
} from '../../../../utils/adminStudioRoutes';

export default function AdminStudioSuccessionModePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="SUCCESSION MODE™"
      subtitle={SUCCESSION_MODE_PAGE_SUBTITLE}
      breadcrumbParentLabel="PROFESSION BRAIN"
      breadcrumbParentPath={adminStudioProfessionBrainPath()}
      onBack={() => navigate(adminStudioProfessionBrainPath())}
      navGroupId="intelligence"
    >
      <div className="p-3 mb-4 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          {SUCCESSION_MODE_PAGE_PHILOSOPHY}
        </p>
      </div>

      <SuccessionModeWorkspace />

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
          onClick={() => navigate(adminStudioCompanyHealthIndexPath())}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          HEALTH INDEX →
        </button>
      </div>

      <AdminStudioDisclaimerFooter>
        SUCCESSION MODE™ V1.0 · PRESERVE EXPERTISE · BUILD LEGACY · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
