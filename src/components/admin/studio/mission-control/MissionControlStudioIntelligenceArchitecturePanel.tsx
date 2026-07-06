import { useNavigate } from 'react-router-dom';
import { useStudioIntelligenceArchitectureState } from '../../../../hooks/useStudioIntelligenceArchitectureState';
import { STUDIO_INTELLIGENCE_ARCHITECTURE_ACCENT } from '../../../../studio-os-core/studio-intelligence-architecture';
import { adminStudioStudioIntelligenceArchitecturePath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Studio Intelligence™ Architecture preview (M122). */
export function MissionControlStudioIntelligenceArchitecturePanel() {
  const navigate = useNavigate();
  const { profile } = useStudioIntelligenceArchitectureState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="STUDIO INTELLIGENCE™ ARCHITECTURE">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>ARCHITECTURE LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="STUDIO INTELLIGENCE™ · MODEL-AGNOSTIC">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing
          value={profile.architectureScore}
          size={52}
          label="ARCH"
          accent={STUDIO_INTELLIGENCE_ARCHITECTURE_ACCENT}
        />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.knowledgeFabricNodes} FABRIC NODES · {profile.contextSourcesReady} CONTEXT · PIPELINE {profile.pipelineHealthPct}%
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>ORG OWNS KNOWLEDGE · MODELS REASON</p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockArchitectureLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioStudioIntelligenceArchitecturePath())} style={eiaActionBtn}>
        OPEN INTELLIGENCE ARCHITECTURE →
      </button>
    </ExecutiveSecondaryCard>
  );
}
