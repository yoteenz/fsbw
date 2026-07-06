import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { StudioOsBrandTagline } from '../../../../components/admin/studio/brand/StudioOsBrandTagline';
import { ExpansionCenterWorkspace } from '../../../../components/admin/studio/expansion-center/ExpansionCenterWorkspace';
import {
  EXPANSION_CENTER_CHAIN,
  EXPANSION_CENTER_PHILOSOPHY,
  EXPANSION_CENTER_SUBTITLE,
} from '../../../../utils/adminStudioExpansionCenterDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { adminStudioMarketplacePath } from '../../../../utils/adminStudioRoutes';

export default function AdminStudioExpansionCenterPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="EXPANSION CENTER"
      subtitle={EXPANSION_CENTER_SUBTITLE}
      breadcrumbParentLabel="HEADQUARTERS"
      breadcrumbParentPath="/admin/studio/mission-control"
      onBack={() => navigate('/admin/studio/mission-control')}
      navGroupId="settings"
    >
      <div className="p-3 mb-4 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <StudioOsBrandTagline systemId="expansion-center" />
        <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          {EXPANSION_CENTER_PHILOSOPHY}
        </p>
        <div className="flex flex-col items-center gap-0">
          {EXPANSION_CENTER_CHAIN.map((step, i) => (
            <div key={step} className="w-full flex flex-col items-center">
              {i > 0 ? <div className="w-px h-2" style={{ background: ADMIN_STUDIO_THEME.panelBorderStrong }} /> : null}
              <div
                className="w-full px-2 py-1 text-[7px] font-futura uppercase text-center border"
                style={{
                  fontWeight: 515,
                  color: step === 'EXPANSION CENTER' ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
                  background: step === 'EXPANSION CENTER' ? ADMIN_STUDIO_THEME.selectedBg : 'rgba(255,255,255,0.6)',
                  borderColor: ADMIN_STUDIO_THEME.panelBorder,
                }}
              >
                {step}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ExpansionCenterWorkspace />

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={() => navigate('/admin/studio/organizational-inheritance')}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          ← ORGANIZATIONAL INHERITANCE
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
        EXPANSION CENTER · M89 MONETIZATION ARCHITECTURE · THREE-LAYER ECONOMY · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
