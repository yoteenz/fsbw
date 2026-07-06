import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ProfessionalTrustFrameworkWorkspace } from '../../../../components/admin/studio/professional-trust-framework/ProfessionalTrustFrameworkWorkspace';
import {
  PROFESSIONAL_TRUST_PAGE_PHILOSOPHY,
  PROFESSIONAL_TRUST_PAGE_SUBTITLE,
} from '../../../../utils/adminStudioProfessionalTrustDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  adminStudioExpertMarketplacePath,
  adminStudioProfessionBrainPath,
} from '../../../../utils/adminStudioRoutes';

export default function AdminStudioProfessionalTrustFrameworkPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="PROFESSIONAL TRUST FRAMEWORK™"
      subtitle={PROFESSIONAL_TRUST_PAGE_SUBTITLE}
      breadcrumbParentLabel="PROFESSION BRAIN"
      breadcrumbParentPath={adminStudioProfessionBrainPath()}
      onBack={() => navigate(adminStudioProfessionBrainPath())}
      navGroupId="intelligence"
    >
      <div className="p-3 mb-4 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          {PROFESSIONAL_TRUST_PAGE_PHILOSOPHY}
        </p>
      </div>

      <ProfessionalTrustFrameworkWorkspace />

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
          onClick={() => navigate(adminStudioExpertMarketplacePath())}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          EXPERT MARKETPLACE →
        </button>
      </div>

      <AdminStudioDisclaimerFooter>
        PROFESSIONAL TRUST FRAMEWORK™ V1.0 · RESPONSIBLE GUIDANCE · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
