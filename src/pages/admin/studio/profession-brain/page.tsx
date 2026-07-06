import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { StudioOsBrandTagline } from '../../../../components/admin/studio/brand/StudioOsBrandTagline';
import { ProfessionBrainWorkspace } from '../../../../components/admin/studio/profession-brain/ProfessionBrainWorkspace';
import {
  PROFESSION_BRAIN_WORKSPACE_PHILOSOPHY,
  PROFESSION_BRAIN_WORKSPACE_SUBTITLE,
} from '../../../../utils/adminStudioProfessionBrainDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  adminStudioBusinessDiscoveryBlueprintPath,
  adminStudioExpertMarketplacePath,
  adminStudioKnowledgeCommercePath,
  adminStudioSuccessionModePath,
  adminStudioMemoryEnginePath,
  adminStudioOrganizationGenomePath,
  adminStudioProfessionalTrustFrameworkPath,
  adminStudioStudioInstitutePath,
} from '../../../../utils/adminStudioRoutes';

export default function AdminStudioProfessionBrainPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="PROFESSION BRAIN™"
      subtitle={PROFESSION_BRAIN_WORKSPACE_SUBTITLE}
      breadcrumbParentLabel="HEADQUARTERS"
      breadcrumbParentPath="/admin/studio/mission-control"
      onBack={() => navigate('/admin/studio/mission-control')}
      navGroupId="intelligence"
    >
      <div className="p-3 mb-4 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <StudioOsBrandTagline systemId="profession-brain" />
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          {PROFESSION_BRAIN_WORKSPACE_PHILOSOPHY}
        </p>
      </div>

      <ProfessionBrainWorkspace />

      <div className="flex flex-col gap-2 mt-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate(adminStudioBusinessDiscoveryBlueprintPath())}
            className="flex-1 py-2 text-[7px] font-futura uppercase border"
            style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
          >
            ← DISCOVERY BLUEPRINT
          </button>
          <button
            type="button"
            onClick={() => navigate(adminStudioStudioInstitutePath())}
            className="flex-1 py-2 text-[7px] font-futura uppercase border"
            style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
          >
            STUDIO INSTITUTE →
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate(adminStudioSuccessionModePath())}
            className="flex-1 py-2 text-[7px] font-futura uppercase border"
            style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
          >
            SUCCESSION MODE →
          </button>
          <button
            type="button"
            onClick={() => navigate(adminStudioMemoryEnginePath())}
            className="flex-1 py-2 text-[7px] font-futura uppercase border"
            style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
          >
            MEMORY ENGINE →
          </button>
          <button
            type="button"
            onClick={() => navigate(adminStudioOrganizationGenomePath())}
            className="flex-1 py-2 text-[7px] font-futura uppercase border"
            style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
          >
            ORGANIZATION GENOME →
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate(adminStudioProfessionalTrustFrameworkPath())}
            className="flex-1 py-2 text-[7px] font-futura uppercase border"
            style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
          >
            TRUST FRAMEWORK →
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate(adminStudioKnowledgeCommercePath())}
            className="flex-1 py-2 text-[7px] font-futura uppercase border"
            style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
          >
            KNOWLEDGE COMMERCE →
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
      </div>

      <AdminStudioDisclaimerFooter>
        PROFESSION BRAIN™ · M91 · INSTITUTIONAL INTELLIGENCE · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
