import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { StudioOsBrandTagline } from '../../../../components/admin/studio/brand/StudioOsBrandTagline';
import { BusinessDiscoveryBlueprintWorkspace } from '../../../../components/admin/studio/business-discovery-blueprint/BusinessDiscoveryBlueprintWorkspace';
import {
  BUSINESS_DISCOVERY_BLUEPRINT_CHAIN,
  BUSINESS_DISCOVERY_BLUEPRINT_PHILOSOPHY,
  BUSINESS_DISCOVERY_BLUEPRINT_SUBTITLE,
  BUSINESS_DISCOVERY_LIVING_NOTE,
} from '../../../../utils/adminStudioBusinessDiscoveryBlueprintDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { adminStudioCompanyOnboardingIntelligencePath } from '../../../../utils/adminStudioRoutes';

export default function AdminStudioBusinessDiscoveryBlueprintPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="BUSINESS DISCOVERY BLUEPRINT™"
      subtitle={BUSINESS_DISCOVERY_BLUEPRINT_SUBTITLE}
      breadcrumbParentLabel="HEADQUARTERS"
      breadcrumbParentPath="/admin/studio/mission-control"
      onBack={() => navigate('/admin/studio/mission-control')}
      navGroupId="settings"
    >
      <div className="p-3 mb-4 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <StudioOsBrandTagline systemId="business-discovery-blueprint" />
        <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          {BUSINESS_DISCOVERY_BLUEPRINT_PHILOSOPHY}
        </p>
        <div className="flex flex-col items-center gap-0">
          {BUSINESS_DISCOVERY_BLUEPRINT_CHAIN.map((step, i) => (
            <div key={step} className="w-full flex flex-col items-center">
              {i > 0 ? <div className="w-px h-2" style={{ background: ADMIN_STUDIO_THEME.panelBorderStrong }} /> : null}
              <div
                className="w-full px-2 py-1 text-[7px] font-futura uppercase text-center border"
                style={{
                  fontWeight: 515,
                  color: step.includes('BLUEPRINT') ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
                  background: step.includes('BLUEPRINT') ? ADMIN_STUDIO_THEME.selectedBg : 'rgba(255,255,255,0.6)',
                  borderColor: ADMIN_STUDIO_THEME.panelBorder,
                }}
              >
                {step}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[6px] font-futura normal-case mt-2" style={{ color: '#555', lineHeight: 1.45 }}>
          {BUSINESS_DISCOVERY_LIVING_NOTE}
        </p>
      </div>

      <BusinessDiscoveryBlueprintWorkspace />

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={() => navigate(adminStudioCompanyOnboardingIntelligencePath())}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          ← COMPANY ONBOARDING INTELLIGENCE
        </button>
        <button
          type="button"
          onClick={() => navigate('/admin/studio/expansion-center')}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          EXPANSION CENTER →
        </button>
      </div>

      <AdminStudioDisclaimerFooter>
        BUSINESS DISCOVERY BLUEPRINT™ · M90 · ORGANIZATIONAL ARCHAEOLOGY · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
