import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { StudioInstituteLearningWorkspace } from '../../../../components/admin/studio/studio-institute/StudioInstituteLearningWorkspace';
import {
  STUDIO_INSTITUTE_PAGE_PHILOSOPHY,
  STUDIO_INSTITUTE_PAGE_SUBTITLE,
} from '../../../../utils/adminStudioStudioInstituteDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  adminStudioExpertMarketplacePath,
  adminStudioProfessionBrainPath,
} from '../../../../utils/adminStudioRoutes';

export default function AdminStudioStudioInstitutePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="STUDIO INSTITUTE™"
      subtitle={STUDIO_INSTITUTE_PAGE_SUBTITLE}
      breadcrumbParentLabel="PROFESSION BRAIN"
      breadcrumbParentPath={adminStudioProfessionBrainPath()}
      onBack={() => navigate(adminStudioProfessionBrainPath())}
      navGroupId="intelligence"
    >
      <div className="p-3 mb-4 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          {STUDIO_INSTITUTE_PAGE_PHILOSOPHY}
        </p>
      </div>

      <StudioInstituteLearningWorkspace />

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
        STUDIO INSTITUTE™ V1.0 · PROFESSION BRAIN-DRIVEN LEARNING · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
