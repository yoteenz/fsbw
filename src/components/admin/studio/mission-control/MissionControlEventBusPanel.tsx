import { useNavigate } from 'react-router-dom';
import { useEventBusState } from '../../../../hooks/useEventBusState';
import { EVENT_BUS_ACCENT } from '../../../../studio-os-core/event-bus';
import { adminStudioEventBusPath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Event Bus™ preview (M131). */
export function MissionControlEventBusPanel() {
  const navigate = useNavigate();
  const { profile } = useEventBusState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="EVENT BUS™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>NERVOUS SYSTEM LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="EVENT BUS™ · NERVOUS SYSTEM">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.busScore} size={52} label="EB" accent={EVENT_BUS_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.totalEventTypes} TYPES · {profile.totalSubscriptions} SUBS
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>{profile.avgLatencyMs}MS AVG · LOOSELY COUPLED</p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockBusLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioEventBusPath())} style={eiaActionBtn}>
        OPEN EVENT BUS →
      </button>
    </ExecutiveSecondaryCard>
  );
}
