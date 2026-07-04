import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { MarketplaceWorkspace } from '../../../../components/admin/studio/marketplace/MarketplaceWorkspace';
import {
  ADMIN_STUDIO_MARKETPLACE_SUBTITLE,
  MARKETPLACE_INHERITANCE_CHAIN,
} from '../../../../utils/adminStudioMarketplaceDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

export default function AdminStudioMarketplacePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="MARKETPLACE"
      subtitle={ADMIN_STUDIO_MARKETPLACE_SUBTITLE}
      breadcrumbParentLabel="THE STUDIO"
      breadcrumbParentPath="/admin/studio"
      onBack={() => navigate('/admin/studio')}
      navGroupId="intelligence"
    >
      <div className="p-3 mb-4 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          PROFESSIONAL OPERATING NETWORK · RELATIONSHIP-FIRST · NOT A FREELANCER MARKETPLACE
        </p>
        <div className="flex flex-col items-center gap-0">
          {MARKETPLACE_INHERITANCE_CHAIN.map((step, i) => (
            <div key={step} className="w-full flex flex-col items-center">
              {i > 0 ? <div className="w-px h-2" style={{ background: ADMIN_STUDIO_THEME.panelBorderStrong }} /> : null}
              <div
                className="w-full px-2 py-1 text-[7px] font-futura uppercase text-center border"
                style={{
                  fontWeight: 515,
                  color: step === 'PARTICIPANT PROFILES' ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
                  background: step === 'PARTICIPANT PROFILES' ? ADMIN_STUDIO_THEME.selectedBg : 'rgba(255,255,255,0.6)',
                  borderColor: ADMIN_STUDIO_THEME.panelBorder,
                }}
              >
                {step}
              </div>
            </div>
          ))}
        </div>
      </div>

      <MarketplaceWorkspace />

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={() => navigate('/admin/studio/talent-network')}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          ← TALENT NETWORK
        </button>
        <button
          type="button"
          onClick={() => navigate('/admin/studio/growth-network')}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          GROWTH NETWORK →
        </button>
      </div>

      <AdminStudioDisclaimerFooter>
        MARKETPLACE V1.0 · DEMO DATA · PAYMENT RAILS NOT CONNECTED · RELATIONSHIP-FIRST ECOSYSTEM
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
