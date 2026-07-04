import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AiMediaNetworkWorkspace } from '../../../../components/admin/studio/ai-media-network/AiMediaNetworkWorkspace';
import {
  ADMIN_STUDIO_AI_MEDIA_NETWORK_SUBTITLE,
  AI_MEDIA_NETWORK_INHERITANCE_CHAIN,
} from '../../../../utils/adminStudioAiMediaNetworkDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

export default function AdminStudioAiMediaNetworkPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="AI MEDIA NETWORK"
      subtitle={ADMIN_STUDIO_AI_MEDIA_NETWORK_SUBTITLE}
      breadcrumbParentLabel="THE STUDIO"
      breadcrumbParentPath="/admin/studio"
      onBack={() => navigate('/admin/studio')}
      navGroupId="intelligence"
    >
      <div className="p-3 mb-4 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          TV NETWORK + AI PUBLISHING COMPANY · 5 PILLARS · 5 SHOWS · LABS-POWERED LEARNING
        </p>
        <div className="flex flex-col items-center gap-0">
          {AI_MEDIA_NETWORK_INHERITANCE_CHAIN.map((step, i) => (
            <div key={step} className="w-full flex flex-col items-center">
              {i > 0 ? <div className="w-px h-2" style={{ background: ADMIN_STUDIO_THEME.panelBorderStrong }} /> : null}
              <div
                className="w-full px-2 py-1 text-[7px] font-futura uppercase text-center border"
                style={{
                  fontWeight: 515,
                  color: step === 'PROGRAMMING NETWORK' ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
                  background: step === 'PROGRAMMING NETWORK' ? ADMIN_STUDIO_THEME.selectedBg : 'rgba(255,255,255,0.6)',
                  borderColor: ADMIN_STUDIO_THEME.panelBorder,
                }}
              >
                {step}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AiMediaNetworkWorkspace />

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={() => navigate('/admin/studio/labs')}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          ← STUDIO OS LABS
        </button>
        <button
          type="button"
          onClick={() => navigate('/admin/studio-os/workspace/ai-media/dashboard')}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          AI MEDIA WORKSPACE →
        </button>
      </div>

      <AdminStudioDisclaimerFooter>
        AI MEDIA NETWORK V1.0 · DEMO DATA · PERMANENT STUDIO OS PILOT · CONNECTORS NOT CONNECTED
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
