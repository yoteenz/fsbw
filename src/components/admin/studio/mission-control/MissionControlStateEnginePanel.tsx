import { useNavigate } from 'react-router-dom';
import { useStateEngineState } from '../../../../hooks/useStateEngineState';
import { STATE_ENGINE_ACCENT } from '../../../../studio-os-core/state-engine';
import { adminStudioStateEnginePath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — State Engine™ preview (M139). */
export function MissionControlStateEnginePanel() {
  const navigate = useNavigate();
  const { profile } = useStateEngineState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="STATE ENGINE™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>LIFECYCLE MANAGEMENT LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="STATE ENGINE™ · PREDICTABLE LIFECYCLE">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.consistencyScore} size={52} label="SE" accent={STATE_ENGINE_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.lifecycleStates.length} STATES · {profile.stateObjects.length} OBJECT TYPES
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>{profile.historyCompletenessPct}% HISTORY · CONSISTENCY</p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockConsistencyLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioStateEnginePath())} style={eiaActionBtn}>
        OPEN STATE ENGINE →
      </button>
    </ExecutiveSecondaryCard>
  );
}
