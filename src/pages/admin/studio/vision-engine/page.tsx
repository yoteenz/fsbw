import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { VisionEngineWorkspace } from '../../../../components/admin/studio/vision-engine/VisionEngineWorkspace';
import {
  ADMIN_STUDIO_VISION_ENGINE_SUBTITLE,
  VISION_ENGINE_INHERITANCE_CHAIN,
} from '../../../../utils/adminStudioVisionEngineDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

export default function AdminStudioVisionEnginePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="VISION ENGINE"
      subtitle={ADMIN_STUDIO_VISION_ENGINE_SUBTITLE}
      breadcrumbParentLabel="THE STUDIO"
      breadcrumbParentPath="/admin/studio"
      onBack={() => navigate('/admin/studio')}
      navGroupId="intelligence"
    >
      <div className="p-3 mb-4 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          STUDIO OS CINEMATIC PRESENTATION ENGINE · INTERNAL ONLY · NOT CUSTOMER-FACING
        </p>
        <div className="flex flex-col items-center gap-0">
          {VISION_ENGINE_INHERITANCE_CHAIN.map((step, i) => (
            <div key={step} className="w-full flex flex-col items-center">
              {i > 0 ? <div className="w-px h-2" style={{ background: ADMIN_STUDIO_THEME.panelBorderStrong }} /> : null}
              <div
                className="w-full px-2 py-1 text-[7px] font-futura uppercase text-center border"
                style={{
                  fontWeight: 515,
                  color: step === 'VISION MODES' ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
                  background: step === 'VISION MODES' ? ADMIN_STUDIO_THEME.selectedBg : 'rgba(255,255,255,0.6)',
                  borderColor: ADMIN_STUDIO_THEME.panelBorder,
                }}
              >
                {step}
              </div>
            </div>
          ))}
        </div>
      </div>

      <VisionEngineWorkspace />

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={() => navigate('/admin/studio/growth-network')}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          ← GROWTH NETWORK
        </button>
        <button
          type="button"
          onClick={() => navigate('/admin/studio/knowledge-hub')}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          KNOWLEDGE HUB →
        </button>
      </div>

      <AdminStudioDisclaimerFooter>
        VISION ENGINE™ V1.0 · BUILDER · RECORDER · SHARE · ANALYTICS · VISION AI STUB · DEMO DATA · INTERNAL ROLES ONLY
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
