import { useNavigate } from 'react-router-dom';
import { useInteractionEngineState } from '../../../../hooks/useInteractionEngineState';
import { INTERACTION_ENGINE_ACCENT } from '../../../../studio-os-core/interaction-engine';
import { adminStudioInteractionEnginePath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Interaction Engine™ preview (M130). */
export function MissionControlInteractionEnginePanel() {
  const navigate = useNavigate();
  const { profile } = useInteractionEngineState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="INTERACTION ENGINE™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>BEHAVIORAL PATTERNS LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="INTERACTION ENGINE™ · BEHAVIORAL TRUTH">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.engineScore} size={52} label="IE" accent={INTERACTION_ENGINE_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.totalPatterns} PATTERNS · {profile.componentCompliancePct}% COMPLIANCE
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>BEHAVIORAL COHESION PROTECTED</p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockEngineLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioInteractionEnginePath())} style={eiaActionBtn}>
        OPEN INTERACTION ENGINE →
      </button>
    </ExecutiveSecondaryCard>
  );
}
