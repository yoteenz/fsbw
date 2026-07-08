import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { StudioExchangeWorkspace } from '../../../../components/admin/studio/studio-exchange/StudioExchangeWorkspace';
import { adminStudioCareerWorldsPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

export default function AdminStudioExchangePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="STUDIO EXCHANGE™"
      subtitle="Professional License System™ — enter professions, not courses"
      breadcrumbParentLabel="THE STUDIO"
      breadcrumbParentPath="/admin/studio"
      onBack={() => navigate('/admin/studio')}
      navGroupId="intelligence"
    >
      <StudioExchangeWorkspace />

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={() => navigate(adminStudioCareerWorldsPath())}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          ← CAREER WORLDS™
        </button>
      </div>

      <AdminStudioDisclaimerFooter>
        STUDIO EXCHANGE™ V1.0 · PROFESSIONAL LICENSE FOUNDATION · PAYMENT RAILS NOT CONNECTED
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
