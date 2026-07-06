import { useNavigate } from 'react-router-dom';
import { useSelfHealingEngineState } from '../../../../hooks/useSelfHealingEngineState';
import { SELF_HEALING_ENGINE_ACCENT } from '../../../../studio-os-core/self-healing-engine';
import { adminStudioSelfHealingEnginePath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Self-Healing™ Engine preview (M150). */
export function MissionControlSelfHealingEnginePanel() {
  const navigate = useNavigate();
  const { profile } = useSelfHealingEngineState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="SELF-HEALING™ ENGINE">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>RESILIENCE ENGINE LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="SELF-HEALING™ ENGINE · INTELLIGENT RESILIENCE">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.resilienceScore} size={52} label="SH" accent={SELF_HEALING_ENGINE_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.autoRepairsToday} AUTO-REPAIRS · {profile.pendingApprovals} PENDING
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            Minor issues resolve quietly · major issues arrive with recovery plans
          </p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockSelfHealingLine.slice(0, 110)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioSelfHealingEnginePath())} style={eiaActionBtn}>
        OPEN SELF-HEALING →
      </button>
    </ExecutiveSecondaryCard>
  );
}
