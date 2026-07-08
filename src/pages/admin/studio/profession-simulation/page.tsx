import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ProfessionSimulationShiftWorkspace } from '../../../../components/admin/studio/profession-simulation/ProfessionSimulationShiftWorkspace';
import { ADMIN_STUDIO_PROFESSION_SIMULATION_SUBTITLE } from '../../../../utils/adminStudioProfessionSimulationDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

export default function AdminStudioProfessionSimulationPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="PROFESSION SIMULATION"
      subtitle={ADMIN_STUDIO_PROFESSION_SIMULATION_SUBTITLE}
      breadcrumbParentLabel="THE STUDIO"
      breadcrumbParentPath="/admin/studio"
      onBack={() => navigate('/admin/studio')}
      navGroupId="intelligence"
    >
      <div className="p-3 mb-4 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          CAREERS ARE SIMULATED™ · PROFESSION BRAIN → SCENARIO → MISSION → EVALUATION → FEEDBACK
        </p>
        <p className="text-[8px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Demo shift: Shampoo Station Rush™ — reusable engine foundation, not a specific academy product.
        </p>
      </div>

      <ProfessionSimulationShiftWorkspace />

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={() => navigate('/admin/studio/profession-brain')}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          ← PROFESSION BRAIN
        </button>
        <button
          type="button"
          onClick={() => navigate('/admin/studio/studio-institute')}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          STUDIO INSTITUTE →
        </button>
      </div>

      <AdminStudioDisclaimerFooter>
        PROFESSION SIMULATION ENGINE V1.1 · FOUNDATION STUB · ONE PLAYABLE SHIFT · REUSABLE ACROSS PROFESSIONS
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
