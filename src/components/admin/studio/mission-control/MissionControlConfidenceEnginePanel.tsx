import { useNavigate } from 'react-router-dom';
import { useConfidenceEngineState } from '../../../../hooks/useConfidenceEngineState';
import { CONFIDENCE_ENGINE_ACCENT } from '../../../../studio-os-core/confidence-engine';
import { adminStudioConfidenceEnginePath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Confidence Engine™ preview (M152). */
export function MissionControlConfidenceEnginePanel() {
  const navigate = useNavigate();
  const { profile } = useConfidenceEngineState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="CONFIDENCE ENGINE™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>CONFIDENCE ANALYSIS LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="CONFIDENCE ENGINE™ · VISIBLE INTELLIGENCE">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.overallConfidenceScore} size={52} label="CE" accent={CONFIDENCE_ENGINE_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.recommendationsActive} RECOMMENDATIONS · {profile.lowConfidenceCount} LOW
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            Confidence is a conversation · never a black box
          </p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockConfidenceLine.slice(0, 110)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioConfidenceEnginePath())} style={eiaActionBtn}>
        OPEN CONFIDENCE ENGINE →
      </button>
    </ExecutiveSecondaryCard>
  );
}
