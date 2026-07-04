import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { SimulationEngineWorkspace } from '../../../../components/admin/studio/simulation-engine/SimulationEngineWorkspace';
import {
  ADMIN_STUDIO_SIMULATION_ENGINE_SUBTITLE,
  SIMULATION_ENGINE_INHERITANCE_CHAIN,
} from '../../../../utils/adminStudioSimulationEngineDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

export default function AdminStudioSimulationEnginePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="SIMULATION ENGINE"
      subtitle={ADMIN_STUDIO_SIMULATION_ENGINE_SUBTITLE}
      breadcrumbParentLabel="THE STUDIO"
      breadcrumbParentPath="/admin/studio"
      onBack={() => navigate('/admin/studio')}
      navGroupId="intelligence"
    >
      <div className="p-3 mb-4 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          MODEL BEFORE COMMITTING · EXPLORE POSSIBILITIES · NOT GUARANTEES · FOUNDER DECIDES
        </p>
        <div className="flex flex-col items-center gap-0">
          {SIMULATION_ENGINE_INHERITANCE_CHAIN.map((step, i) => (
            <div key={step} className="w-full flex flex-col items-center">
              {i > 0 ? <div className="w-px h-2" style={{ background: ADMIN_STUDIO_THEME.panelBorderStrong }} /> : null}
              <div
                className="w-full px-2 py-1 text-[7px] font-futura uppercase text-center border"
                style={{
                  fontWeight: 515,
                  color: step === 'SIMULATION CENTER' ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
                  background: step === 'SIMULATION CENTER' ? ADMIN_STUDIO_THEME.selectedBg : 'rgba(255,255,255,0.6)',
                  borderColor: ADMIN_STUDIO_THEME.panelBorder,
                }}
              >
                {step}
              </div>
            </div>
          ))}
        </div>
      </div>

      <SimulationEngineWorkspace />

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={() => navigate('/admin/studio/studio-intelligence')}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          ← STUDIO INTELLIGENCE
        </button>
        <button
          type="button"
          onClick={() => navigate('/admin/studio/labs')}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          STUDIO OS LABS →
        </button>
      </div>

      <AdminStudioDisclaimerFooter>
        SIMULATION ENGINE V1.0 · DEMO DATA · NOT PREDICTIONS · EXPLORE TRADEOFFS · IMPROVE DECISION QUALITY
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
