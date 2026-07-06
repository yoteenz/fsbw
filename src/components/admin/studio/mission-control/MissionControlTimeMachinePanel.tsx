import { useNavigate } from 'react-router-dom';
import { useTimeMachineState } from '../../../../hooks/useTimeMachineState';
import { TIME_MACHINE_ACCENT } from '../../../../studio-os-core/time-machine';
import { adminStudioTimeMachinePath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Time Machine™ preview (M148). */
export function MissionControlTimeMachinePanel() {
  const navigate = useNavigate();
  const { profile } = useTimeMachineState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="TIME MACHINE™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>REPLAY ENGINE LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="TIME MACHINE™ · ORGANIZATIONAL REPLAY">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.replayScore} size={52} label="TM" accent={TIME_MACHINE_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.totalReplayableEvents} REPLAYABLE · 11 LAYERS
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            Understand WHY · not just what happened
          </p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockTimeMachineLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioTimeMachinePath())} style={eiaActionBtn}>
        OPEN TIME MACHINE →
      </button>
    </ExecutiveSecondaryCard>
  );
}
